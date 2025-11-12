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
// 선행 "/" 뒤로 "/" 제외 임의 문자 허용(공백/한글 포함), 확장자 검사
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

/* 더미 제출 */
async function submitTool(form: ToolForm) {
    return new Promise<ToolForm>((r) => setTimeout(() => r(form), 500));
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
            const res = await submitTool(form);
            setPreview(res);
            setOkMessage("등록 요청이 제출되었습니다. 검토 후 반영됩니다.");
        } finally {
            setSubmitting(false);
        }
    }

    // 첨부 버튼
    function handleAttachClick() {
        fileInputRef.current?.click();
    }

    // 파일 선택 → "/파일명.확장자"로 자동 채움
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        setAttachedFile(f);
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
                                placeholder={attachedFile ? "/파일이름.확장자" : "https://example.com/logo.png"}
                                value={form.logo}
                                onChange={(e) => {
                                    if (!attachedFile) onChange("logo", e.target.value);
                                }}
                                disabled={!!attachedFile}
                                aria-invalid={!!errors.logo}
                                title={attachedFile ? "첨부를 취소하면 URL을 수정할 수 있습니다." : ""}
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
                                <button type="button" className={`${s.input} ${s.uploadBtn}`} onClick={handleAttachClick}>
                                    로고 첨부
                                </button>
                            ) : (
                                <button type="button" className={`${s.input} ${s.uploadBtn} ${s.cancel}`} onClick={handleCancelAttach}>
                                    첨부 취소
                                </button>
                            )}
                        </div>

                        {/* 카테고리 */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>
                                카테고리 <span className={s.hintInline}>복수 선택 가능</span> <span className={s.req}>*</span>
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
                            <button type="button" className={`${s.btn} ${s["btn-ghost"]}`} onClick={handleReset}>
                                초기화
                            </button>
                            <button type="button" className={`${s.btn} ${s["btn-ghost"]}`} onClick={() => setPreview(form)}>
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
