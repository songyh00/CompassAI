import React, { useRef, useState } from "react";
import s from "./SubmitToolPage.module.css";

/* 선택 항목 */
const CATEGORIES = [
    "글쓰기/콘텐츠",
    "디자인/아트",
    "비디오/오디오",
    "생산성/협업도구",
    "교육/학습",
    "개발/프로그래밍",
    "비즈니스/마케팅",
    "검색/데이터",
    "엔터테인먼트/기타",
    "게임",
    "일상생활형 서비스",
] as const;
type Category = (typeof CATEGORIES)[number];

const ORIGINS = ["국내", "해외"] as const;
type Origin = (typeof ORIGINS)[number];

/* 폼 데이터 */
type ToolForm = {
    name: string;
    subTitle: string;
    categories: Category[];
    origin: Origin | "";
    url: string;
    logo: string; // URL 또는 "/파일명.확장자"
    long: string;
};

/* 초기값 */
const initialForm: ToolForm = {
    name: "",
    subTitle: "",
    categories: [],
    origin: "",
    url: "",
    logo: "",
    long: "",
};

/* 검증 규칙 */
type Errors = Partial<Record<keyof ToolForm, string>>;
const urlRegex = /^(https?):\/\/\S+$/i;
// public 루트에 저장되는 "/파일명.확장자" 형태만 허용
const localPathRegex = /^\/[^/]+\.(png|jpe?g|gif|webp|svg)$/i;
const required = (v: string) => v.trim().length > 0;

function validate(form: ToolForm): Errors {
    const e: Errors = {};
    if (!required(form.name)) e.name = "이름을 입력하세요.";
    if (!required(form.subTitle)) e.subTitle = "부제목을 입력하세요.";
    if (!form.categories.length) e.categories = "카테고리를 1개 이상 선택하세요.";
    if (!required(form.origin)) e.origin = "지역을 선택하세요.";
    if (!required(form.url) || !urlRegex.test(form.url)) e.url = "유효한 URL을 입력하세요.";

    // http(s) 또는 "/파일명.확장자" 허용
    if (!required(form.logo) || !(urlRegex.test(form.logo) || localPathRegex.test(form.logo))) {
        e.logo = "유효한 로고(웹 URL 또는 /파일이름.확장자)를 입력/첨부하세요.";
    }

    if (!required(form.long)) e.long = "상세 설명을 입력하세요.";
    return e;
}

// 응답 타입
type SubmitResp = { applicationId: number };

// 1) 로고 파일을 백엔드로 업로드 후, 최종 url 반환
//    - 백엔드는 CompassAIFrontend/public 에 랜덤 파일명(UUID)으로 저장
//    - 응답의 {"url": "/랜덤이름.png"} 를 그대로 DB에 넣을 logo 로 사용
async function uploadLogoFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/tools/logos", {
        method: "POST",
        credentials: "include",
        body: fd,
    });

    const text = await res.text();
    if (!res.ok) {
        throw new Error(text || "로고 업로드에 실패했습니다.");
    }

    let data: { url?: string };
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("로고 업로드 응답 형식이 올바르지 않습니다.");
    }

    if (!data.url) {
        throw new Error("로고 업로드 응답에 url 값이 없습니다.");
    }

    return data.url; // 예: "/5f0a3b4e-1234-5678-9abc-def012345678.png"
}

// 2) 신청 JSON 전송: /api/tools/applications
//    - 첨부 파일이 있으면 먼저 업로드하고, 서버가 돌려준 url로 logo를 교체해서 전송
async function submitTool(form: ToolForm, file?: File | null): Promise<SubmitResp> {
    // 최종 전송할 payload
    let payload: ToolForm = form;

    // 첨부 파일이 있으면 먼저 업로드하고, 응답 url을 logo 에 반영
    if (file) {
        const logoUrl = await uploadLogoFile(file);
        payload = {
            ...form,
            logo: logoUrl, // ★ DB에 들어갈 logo 값과 실제 저장된 파일명을 일치시키는 핵심 부분
        };
    }

    const res = await fetch("/api/tools/applications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 로그인 세션 유지용 (백엔드에서 cookie 사용 시)
        body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
        // 백엔드에서 에러 메시지 내려주면 그걸 쓰고, 없으면 기본 문구
        throw new Error(text || "신청 처리 중 오류가 발생했습니다.");
    }

    // {"applicationId": 1} 같은 응답이라고 가정
    return text ? (JSON.parse(text) as SubmitResp) : { applicationId: -1 };
}

/* 컴포넌트 */
export default function SubmitToolPage() {
    const [form, setForm] = useState<ToolForm>(initialForm);
    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [preview, setPreview] = useState<ToolForm | null>(null);
    const [okMessage, setOkMessage] = useState("");

    // 로고 첨부 상태
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onChange = <K extends keyof ToolForm>(k: K, v: ToolForm[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setOkMessage("");
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return;

        setSubmitting(true);
        try {
            const res = await submitTool(form, attachedFile);

            // 실제로 전송한 form 기준으로 미리보기
            setPreview(form);

            if (res.applicationId && res.applicationId > 0) {
                setOkMessage(`등록 요청이 제출되었습니다. (신청 번호: ${res.applicationId})`);
            } else {
                setOkMessage("등록 요청이 제출되었습니다. 검토 후 반영됩니다.");
            }
        } catch (err) {
            console.error(err);
            alert(
                err instanceof Error
                    ? err.message
                    : "등록 요청 중 알 수 없는 오류가 발생했습니다."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // 첨부 버튼
    function handleAttachClick() {
        fileInputRef.current?.click();
    }

    // 파일 선택 → "/파일명.확장자"로 자동 채움 (검증용)
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        setAttachedFile(f);
        // 사용자가 첨부하면 일단 "/원래파일명.확장자"로 채워서 validate 통과시킴
        // 실제 DB에는 submitTool() 내부에서 서버 응답 url(랜덤 이름)으로 교체되어 저장됨
        onChange("logo", `/${f.name}`);
        setErrors((prev) => ({ ...prev, logo: undefined }));
    }

    // 첨부 취소
    function handleCancelAttach() {
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onChange("logo", "");
    }

    // 폼 초기화
    function handleReset() {
        setForm(initialForm);
        setErrors({});
        setOkMessage("");
        setPreview(null);
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div className={s["submit-wrap"]}>
            <div className={s["submit-container"]}>
                <header className={s["submit-header"]}>
                    <h1 className={s["submit-title"]}>AI 서비스 등록</h1>
                    <p className={s["submit-sub"]}></p>
                </header>

                <section className={s["submit-card"]}>
                    <form onSubmit={onSubmit} className={s["submit-grid"]}>
                        {/* 이름 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                이름 <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder="예) 챗지피티 (ChatGPT)"
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && <p className={s.error}>{errors.name}</p>}
                        </div>

                        {/* 부제목 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                부제목 <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder="예) 대화형 AI"
                                value={form.subTitle}
                                onChange={(e) => onChange("subTitle", e.target.value)}
                                aria-invalid={!!errors.subTitle}
                            />
                            {errors.subTitle && <p className={s.error}>{errors.subTitle}</p>}
                        </div>

                        {/* 지역 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                지역 <span className={s.req}>*</span>
                            </label>
                            <select
                                className={s.input}
                                value={form.origin}
                                onChange={(e) => onChange("origin", e.target.value as Origin)}
                                aria-invalid={!!errors.origin}
                            >
                                <option value="">선택하세요</option>
                                {ORIGINS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                            {errors.origin && <p className={s.error}>{errors.origin}</p>}
                        </div>

                        {/* 웹사이트 주소 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                웹사이트 주소 <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder="https://chatgpt.com/"
                                value={form.url}
                                onChange={(e) => onChange("url", e.target.value)}
                                aria-invalid={!!errors.url}
                            />
                            {errors.url && <p className={s.error}>{errors.url}</p>}
                        </div>

                        {/* 로고(URL) */}
                        <div className={s.field}>
                            <label className={s.label}>
                                로고(URL) <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder={
                                    attachedFile ? "/파일이름.확장자" : "https://example.com/logo.png"
                                }
                                value={form.logo}
                                onChange={(e) => {
                                    if (!attachedFile) onChange("logo", e.target.value);
                                }}
                                disabled={!!attachedFile}
                                aria-invalid={!!errors.logo}
                                title={
                                    attachedFile
                                        ? "첨부를 취소하면 URL을 수정할 수 있습니다."
                                        : ""
                                }
                            />
                            {errors.logo && <p className={s.error}>{errors.logo}</p>}
                        </div>

                        {/* 로고(테스트용) */}
                        <div className={s.field}>
                            <label className={s.label}>
                                로고(테스트용) <span className={s.req}>*</span>
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />

                            {!attachedFile ? (
                                <button
                                    type="button"
                                    className={`${s.input} ${s.uploadBtn}`}
                                    onClick={handleAttachClick}
                                >
                                    로고 첨부
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={`${s.input} ${s.uploadBtn} ${s.cancel}`}
                                    onClick={handleCancelAttach}
                                >
                                    첨부 취소
                                </button>
                            )}
                        </div>

                        {/* 카테고리 */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>
                                카테고리 <span className={s.hintInline}>복수 선택 가능</span>{" "}
                                <span className={s.req}>*</span>
                            </label>

                            <div className={s.checks}>
                                {CATEGORIES.map((c) => {
                                    const checked = form.categories.includes(c);
                                    return (
                                        <label key={c} className={s["check-item"]}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...form.categories, c]
                                                        : form.categories.filter((x) => x !== c);
                                                    onChange("categories", next);
                                                }}
                                            />
                                            <span>{c}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.categories && <p className={s.error}>{errors.categories}</p>}
                        </div>

                        {/* 상세 설명 */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>
                                상세 설명 <span className={s.req}>*</span>
                            </label>
                            <textarea
                                className={`${s.input} ${s.textarea}`}
                                rows={5}
                                placeholder="서비스의 목적과 특징을 자세히 작성하세요."
                                value={form.long}
                                onChange={(e) => onChange("long", e.target.value)}
                                aria-invalid={!!errors.long}
                            />
                            {errors.long && <p className={s.error}>{errors.long}</p>}
                        </div>

                        {/* 액션 */}
                        <div className={`${s.actions} ${s.full}`}>
                            <button
                                type="button"
                                className={`${s.btn} ${s["btn-ghost"]}`}
                                onClick={handleReset}
                            >
                                초기화
                            </button>
                            <button
                                type="button"
                                className={`${s.btn} ${s["btn-ghost"]}`}
                                onClick={() => setPreview(form)}
                            >
                                미리보기
                            </button>
                            <button type="submit" className={s.btn} disabled={submitting}>
                                {submitting ? "제출 중…" : "등록 제출"}
                            </button>
                        </div>

                        {okMessage && <p className={s.ok}>{okMessage}</p>}
                    </form>
                </section>

                {/* 미리보기 */}
                {preview && (
                    <section className={s["submit-card"]}>
                        <h3 className={s["preview-title"]}>제출 데이터 미리보기</h3>
                        <pre className={s["preview-pre"]}>{JSON.stringify(preview, null, 2)}</pre>
                    </section>
                )}
            </div>
        </div>
    );
}
