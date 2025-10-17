import React, { useMemo, useState } from "react";
import s from "./SubmitToolPage.module.css";

/* ================================
   상수 정의
   ================================ */

/** 서비스 카테고리 목록 */
const CATEGORIES = [
    "글쓰기/컨텐츠",
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
type Category = typeof CATEGORIES[number];

/** 지원 플랫폼 목록 */
const PLATFORM_OPTIONS = [
    "웹(Web)",
    "iOS",
    "Android",
    "Windows",
    "macOS",
    "Linux",
    "브라우저 확장(Extension)",
    "API/SDK",
] as const;

/* ================================
   폼 데이터 타입 및 초기값
   ================================ */

/** 제출 폼 데이터 타입 정의 */
type SubmitToolForm = {
    name: string;
    website: string;
    region: string;
    category: Category;
    description: string;
    features: string;
    pricing: string;
    audience: string;
    platforms: string[];
    extra: string;
};

/** 폼 초기값 */
const initialForm: SubmitToolForm = {
    name: "",
    website: "",
    region: "",
    category: CATEGORIES[0],
    description: "",
    features: "",
    pricing: "",
    audience: "",
    platforms: [],
    extra: "",
};

/* ================================
   유효성 검사 및 더미 제출 함수
   ================================ */

/** URL 형식 확인용 정규식 */
const urlRegex = /^(https?):\/\/\S+$/i;
/** 공백 여부 검사 */
const required = (v: string) => v.trim().length > 0;

/** 입력값 검증 함수 */
function validate(form: SubmitToolForm) {
    const e: Partial<Record<keyof SubmitToolForm, string>> = {};
    if (!required(form.name)) e.name = "서비스 이름을 입력하세요";
    if (!required(form.website) || !urlRegex.test(form.website))
        e.website = "유효한 웹사이트 주소(https://)를 입력하세요";
    if (!required(form.region)) e.region = "서비스 지역을 입력하세요";
    if (!required(form.category)) e.category = "카테고리를 선택하세요";
    if (!required(form.description)) e.description = "설명을 입력하세요";
    return e;
}

/** 더미 제출 API (실제 서버 없음) */
async function submitTool(form: SubmitToolForm) {
    return new Promise<SubmitToolForm>((r) => setTimeout(() => r(form), 500));
}

/* ================================
   메인 컴포넌트
   ================================ */

export default function SubmitToolPage() {
    /* ---- 상태 정의 ---- */
    const [form, setForm] = useState(initialForm); // 입력 데이터
    const [errors, setErrors] = useState<
        Partial<Record<keyof SubmitToolForm, string>>
    >({}); // 유효성 에러 메시지
    const [submitting, setSubmitting] = useState(false); // 제출 중 여부
    const [preview, setPreview] = useState<SubmitToolForm | null>(null); // 미리보기 데이터
    const [okMessage, setOkMessage] = useState(""); // 성공 메시지

    /* ---- 특징 칩(Chip) 표시용: 콤마·줄바꿈으로 구분 ---- */
    const featureChips = useMemo(
        () =>
            form.features
                .split(/[\n,]/)
                .map((s) => s.trim())
                .filter(Boolean),
        [form.features]
    );

    /* ---- 입력 핸들러 ---- */
    const onChange = <K extends keyof SubmitToolForm>(
        k: K,
        v: SubmitToolForm[K]
    ) => setForm((p) => ({ ...p, [k]: v }));

    /* ---- 제출 처리 ---- */
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setOkMessage("");
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return; // 에러가 있으면 중단

        setSubmitting(true);
        try {
            const res = await submitTool(form);
            setPreview(res);
            setOkMessage("등록 요청이 제출되었습니다. 검토 후 반영됩니다.");
        } finally {
            setSubmitting(false);
        }
    }

    /* ================================
       렌더링 영역
       ================================ */
    return (
        <div className={s["submit-wrap"]}>
            <div className={s["submit-container"]}>
                {/* ───────── 헤더 영역 ───────── */}
                <header className={s["submit-header"]}>
                    <h1 className={s["submit-title"]}>AI 서비스 등록</h1>
                    <p className={s["submit-sub"]}>
                        AI 툴을 빠르게 찾고, 내가 만든 툴도 소개해 보세요.
                    </p>
                </header>

                {/* ───────── 등록 폼 ───────── */}
                <section className={s["submit-card"]}>
                    <form onSubmit={onSubmit} className={s["submit-grid"]}>
                        {/* 서비스 이름 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                서비스 이름 <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder="예) CompassAI"
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && <p className={s.error}>{errors.name}</p>}
                        </div>

                        {/* 웹사이트 주소 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                웹사이트 주소 <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder="https://example.com"
                                value={form.website}
                                onChange={(e) => onChange("website", e.target.value)}
                                aria-invalid={!!errors.website}
                            />
                            {errors.website && <p className={s.error}>{errors.website}</p>}
                        </div>

                        {/* 서비스 지역 */}
                        <div className={s.field}>
                            <label className={s.label}>
                                서비스 지역 <span className={s.req}>*</span>
                            </label>
                            <input
                                className={s.input}
                                placeholder="예) 한국, 글로벌"
                                value={form.region}
                                onChange={(e) => onChange("region", e.target.value)}
                                aria-invalid={!!errors.region}
                            />
                            {errors.region && <p className={s.error}>{errors.region}</p>}
                        </div>

                        {/* 서비스 유형(카테고리) */}
                        <div className={s.field}>
                            <label className={s.label}>
                                서비스 유형(카테고리) <span className={s.req}>*</span>
                            </label>
                            <select
                                className={s.input}
                                value={form.category}
                                onChange={(e) =>
                                    onChange("category", e.target.value as Category)
                                }
                                aria-invalid={!!errors.category}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className={s.error}>{errors.category}</p>}
                        </div>

                        {/* 가격 */}
                        <div className={s.field}>
                            <label className={s.label}>가격(변동 가능)</label>
                            <input
                                className={s.input}
                                placeholder="예) 무료 / 프리미엄(월 $10) / 문의 / 변동가"
                                value={form.pricing}
                                onChange={(e) => onChange("pricing", e.target.value)}
                            />
                            <p className={s.hint}>
                                자유 입력: free / freemium / paid / 문의 / 기타 상세 등
                            </p>
                        </div>

                        {/* 대상자층 */}
                        <div className={s.field}>
                            <label className={s.label}>대상자층</label>
                            <input
                                className={s.input}
                                placeholder="예) 학생, 마케터, 개발자, 디자이너 등"
                                value={form.audience}
                                onChange={(e) => onChange("audience", e.target.value)}
                            />
                        </div>

                        {/* 지원 플랫폼(다중선택) */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>지원 플랫폼 (다중 선택 가능)</label>
                            <div className={s.checks}>
                                {PLATFORM_OPTIONS.map((p) => {
                                    const checked = form.platforms.includes(p);
                                    return (
                                        <label key={p} className={s["check-item"]}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...form.platforms, p]
                                                        : form.platforms.filter((x) => x !== p);
                                                    onChange("platforms", next);
                                                }}
                                            />
                                            <span>{p}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 설명 */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>
                                설명 <span className={s.req}>*</span>
                            </label>
                            <textarea
                                className={`${s.input} ${s.textarea}`}
                                rows={4}
                                placeholder="서비스의 목적과 주요 제공 가치를 간단히 작성하세요"
                                value={form.description}
                                onChange={(e) => onChange("description", e.target.value)}
                                aria-invalid={!!errors.description}
                            />
                            {errors.description && (
                                <p className={s.error}>{errors.description}</p>
                            )}
                        </div>

                        {/* 주요 특징 */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>주요 특징</label>
                            <textarea
                                className={`${s.input} ${s.textarea}`}
                                rows={4}
                                placeholder={`줄바꿈 또는 ,(콤마)로 구분해서 입력하세요\n예) 한국어 지원, 무료 플랜, API 제공, 팀 협업 기능`}
                                value={form.features}
                                onChange={(e) => onChange("features", e.target.value)}
                            />
                            {featureChips.length > 0 && (
                                <div className={s.chips}>
                                    {featureChips.map((chip, i) => (
                                        <span key={`${chip}-${i}`} className={s.chip}>
                      {chip}
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 기타 정보 */}
                        <div className={`${s.field} ${s.full}`}>
                            <label className={s.label}>기타 정보</label>
                            <textarea
                                className={`${s.input} ${s.textarea}`}
                                rows={3}
                                placeholder="라이선스/제약/특이사항 등"
                                value={form.extra}
                                onChange={(e) => onChange("extra", e.target.value)}
                            />
                        </div>

                        {/* 액션 버튼 */}
                        <div className={`${s.actions} ${s.full}`}>
                            <button
                                type="button"
                                className={`${s.btn} ${s["btn-ghost"]}`}
                                onClick={() => setForm(initialForm)}
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

                        {/* 성공 메시지 */}
                        {okMessage && <p className={s.ok}>{okMessage}</p>}
                    </form>
                </section>

                {/* ───────── 미리보기 섹션 ───────── */}
                {preview && (
                    <section className={s["submit-card"]}>
                        <h3 className={s["preview-title"]}>제출 데이터 미리보기</h3>
                        <pre className={s["preview-pre"]}>
              {JSON.stringify(preview, null, 2)}
            </pre>
                    </section>
                )}
            </div>
        </div>
    );
}
