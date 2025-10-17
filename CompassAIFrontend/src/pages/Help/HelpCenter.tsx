import { useMemo, useState } from "react";
import s from "./HelpCenter.module.css";

/** FAQ 항목 타입 정의 */
type Faq = { id: string; q: string; a: string; cat: string };

/** 샘플 FAQ 데이터 */
const FAQS: Faq[] = [
    { id: "acc-1", cat: "계정", q: "비밀번호를 잊어버렸어요.", a: "로그인 페이지의 ‘비밀번호 찾기’를 이용하세요. 가입 이메일로 재설정 링크가 발송됩니다." },
    { id: "acc-2", cat: "계정", q: "이메일을 변경하고 싶어요.", a: "마이페이지에서 이메일을 변경할 수 있습니다. 보안 확인 절차가 진행됩니다." },
    { id: "billing-1", cat: "결제", q: "환불 정책이 궁금해요.", a: "결제 후 7일 이내 미사용 시 전액 환불 가능합니다. 사용 이력이 있으면 일부 환불 정책이 적용됩니다." },
    { id: "billing-2", cat: "결제", q: "영수증/세금계산서 발행이 되나요?", a: "팀/비즈니스 요금제는 매월 자동 발행됩니다. 개인은 결제 내역에서 다운로드할 수 있습니다." },
    { id: "submit-1", cat: "AI 등록·검수", q: "제가 만든 AI를 등록하려면?", a: "회원가입 후 대시보드에서 ‘AI 등록’을 클릭해 정보를 입력하면 검수가 진행됩니다. 평균 2~3영업일 소요됩니다." },
    { id: "submit-2", cat: "AI 등록·검수", q: "검수 기준은 무엇인가요?", a: "안전성, 저작권 준수, 설명의 명확성, 실사용 가능 여부를 중점으로 확인합니다." },
    { id: "tech-1", cat: "기술", q: "사이트가 느려요.", a: "브라우저 캐시를 비우고 재시도해 주세요. 지속될 경우 고객센터로 증상을 알려주시면 확인해 드립니다." },
    { id: "tech-2", cat: "기술", q: "로그인이 안돼요.", a: "비밀번호/이메일을 확인하고, 소셜 로그인 차단 플러그인이 없는지 확인해 주세요." },
];

/** 카테고리 목록 */
const CATS = ["전체", "계정", "결제", "AI 등록·검수", "기술"];

export default function HelpCenter() {
    /** 현재 탭 상태: FAQ or 문의하기 */
    const [tab, setTab] = useState<"faq" | "contact">("faq");

    /** FAQ 필터 관련 상태 */
    const [cat, setCat] = useState<string>("전체"); // 선택된 카테고리
    const [q, setQ] = useState(""); // 검색어

    /** 문의 폼 입력 상태 */
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState("일반 문의");
    const [subject, setSubject] = useState("");
    const [msg, setMsg] = useState("");

    /** 폼 상태 */
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [err, setErr] = useState<{ email?: string; subject?: string; msg?: string }>({});

    /** 🔍 FAQ 필터링 (카테고리 + 검색 키워드 적용) */
    const filtered = useMemo(() => {
        const list = cat === "전체" ? FAQS : FAQS.filter((f) => f.cat === cat);
        if (!q.trim()) return list;
        const kw = q.trim().toLowerCase();
        return list.filter(
            (f) => f.q.toLowerCase().includes(kw) || f.a.toLowerCase().includes(kw)
        );
    }, [cat, q]);

    /** 문의 폼 제출 처리 */
    const submitContact = async (e: React.FormEvent) => {
        e.preventDefault();

        // 입력값 검증
        const next: typeof err = {};
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "올바른 이메일을 입력해 주세요.";
        if (!subject.trim()) next.subject = "제목을 입력해 주세요.";
        if (!msg.trim() || msg.length < 10)
            next.msg = "문의 내용을 10자 이상 입력해 주세요.";

        setErr(next);
        if (Object.keys(next).length) return; // 에러 있으면 중단

        // 가상 전송(데모용)
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 700));
            setNotice("문의가 접수되었습니다. 평균 1영업일 이내 이메일로 답변드립니다.");
            setEmail("");
            setSubject("");
            setMsg("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.wrap}>
            {/* ===== 헤더 영역 ===== */}
            <div className={s.head}>
                <h1 className={s.title}>고객센터</h1>
                <p className={s.sub}>
                    무엇을 도와드릴까요? 아래에서 찾아보거나 문의를 남겨주세요.
                </p>

                {/* 검색창 */}
                <div className={s.search}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="키워드로 검색 (예: 환불, 로그인, AI 등록)"
                        aria-label="고객센터 검색"
                    />
                </div>

                {/* 탭 버튼 (FAQ / 문의하기) */}
                <div className={s.tabs}>
                    <button
                        className={tab === "faq" ? "active " + s.active : ""}
                        onClick={() => setTab("faq")}
                    >
                        자주 묻는 질문
                    </button>
                    <button
                        className={tab === "contact" ? "active " + s.active : ""}
                        onClick={() => setTab("contact")}
                    >
                        문의하기
                    </button>
                </div>
            </div>

            {/* ===== FAQ 탭 ===== */}
            {tab === "faq" ? (
                <section className={s.section}>
                    {/* 카테고리 선택 */}
                    <div className={s.cats}>
                        {CATS.map((c) => (
                            <button
                                key={c}
                                className={`${s.cat} ${cat === c ? s.catActive : ""}`}
                                onClick={() => setCat(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* FAQ 리스트 */}
                    <ul className={s.faq}>
                        {filtered.map((item) => (
                            <FaqItem key={item.id} q={item.q} a={item.a} />
                        ))}
                        {filtered.length === 0 && (
                            <li className={s.item} style={{ padding: 14, textAlign: "center" }}>
                                검색 결과가 없습니다.
                            </li>
                        )}
                    </ul>

                    {/* 부가 정보 카드 */}
                    <div className={s.extra}>
                        <div className={s.card}>
                            <h3>운영시간</h3>
                            <p>평일 10:00–18:00 (점심 12:30–13:30, 주말/공휴일 휴무)</p>
                        </div>
                        <div className={s.card}>
                            <h3>시스템 상태</h3>
                            <p>
                                장애/점검 소식은{" "}
                                <a href="#" aria-disabled>
                                    상태 페이지
                                </a>
                                에서 확인할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </section>
            ) : (
                /* ===== 문의하기 탭 ===== */
                <section className={s.section}>
                    {notice && <div className={s.notice}>{notice}</div>}

                    <form className={s.form} onSubmit={submitContact} noValidate>
                        {/* 이메일 */}
                        <label className={s.field}>
                            <span>이메일</span>
                            <input
                                type="email"
                                inputMode="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={err.email ? s.invalid : ""}
                            />
                            {err.email && <em className={s.error}>{err.email}</em>}
                        </label>

                        {/* 문의 유형 */}
                        <label className={s.field}>
                            <span>문의 유형</span>
                            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                                <option>일반 문의</option>
                                <option>계정/로그인</option>
                                <option>결제/환불</option>
                                <option>AI 등록/검수</option>
                                <option>버그/기술 이슈</option>
                                <option>제안/피드백</option>
                            </select>
                        </label>

                        {/* 제목 */}
                        <label className={s.field}>
                            <span>제목</span>
                            <input
                                placeholder="문의 제목"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className={err.subject ? s.invalid : ""}
                            />
                            {err.subject && <em className={s.error}>{err.subject}</em>}
                        </label>

                        {/* 내용 */}
                        <label className={s.field}>
                            <span>내용</span>
                            <textarea
                                placeholder="자세한 증상/재현 절차/스크린샷 링크 등을 적어주세요."
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                rows={6}
                                className={err.msg ? s.invalid : ""}
                            />
                            {err.msg && <em className={s.error}>{err.msg}</em>}
                        </label>

                        {/* 전송 버튼 */}
                        <div className={s.actions}>
                            <button type="submit" className={s.submit} disabled={loading}>
                                {loading ? "전송 중..." : "문의 보내기"}
                            </button>
                            <span className={s.fyi}>평균 1영업일 이내 회신드립니다.</span>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}

/** FAQ 개별 아이템 컴포넌트 (질문 클릭 시 열림/닫힘) */
function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <li className={s.item}>
            <button className={s.q} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                <span>{q}</span>
                <i>{open ? "–" : "+"}</i>
            </button>
            {open && <div className={s.a}>{a}</div>}
        </li>
    );
}
