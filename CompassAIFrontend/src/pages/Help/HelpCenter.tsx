import { useMemo, useState } from "react";
import s from "./HelpCenter.module.css";

type Faq = { id: string; q: string; a: string; cat: string };

const FAQS: Faq[] = [
    { id: "acc-1", cat: "계정", q: "비밀번호를 잊어버렸어요.", a: "로그인 페이지의 ‘비밀번호 찾기’를 이용하세요." },
    { id: "acc-2", cat: "계정", q: "이메일을 변경하고 싶어요.", a: "마이페이지에서 이메일을 변경할 수 있습니다. 보안 확인 절차가 진행됩니다." },
    { id: "submit-1", cat: "AI 등록·검수", q: "제가 만든 AI를 등록하려면?", a: "회원가입 후 대시보드에서 ‘AI 등록’을 클릭해 정보를 입력하면 검수가 진행됩니다. 평균 2~3영업일 소요됩니다." },
    { id: "submit-2", cat: "AI 등록·검수", q: "검수 기준은 무엇인가요?", a: "안전성, 저작권 준수, 설명의 명확성, 실사용 가능 여부를 중점으로 확인합니다." },
    { id: "tech-1", cat: "기술", q: "사이트가 느려요.", a: "브라우저 캐시를 비우고 재시도해 주세요. 지속될 경우 고객센터로 증상을 알려주시면 확인해 드립니다." },
    { id: "tech-2", cat: "기술", q: "로그인이 안돼요.", a: "비밀번호/이메일을 확인하고, 소셜 로그인 차단 플러그인이 없는지 확인해 주세요." },
];

const CATS = ["전체", "계정", "AI 등록·검수", "기술"];

export default function HelpCenter() {
    const [tab, setTab] = useState<"faq" | "contact">("faq");
    const [cat, setCat] = useState("전체");
    const [q, setQ] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState("일반 문의");
    const [subject, setSubject] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [err, setErr] = useState<{ email?: string; subject?: string; msg?: string }>({});
    const [openId, setOpenId] = useState<string | null>(null); // 현재 열려있는 FAQ ID

    const filtered = useMemo(() => {
        const list = cat === "전체" ? FAQS : FAQS.filter((f) => f.cat === cat);
        if (!q.trim()) return list;
        const kw = q.trim().toLowerCase();
        return list.filter(
            (f) =>
                f.q.toLowerCase().includes(kw) ||
                f.a.toLowerCase().includes(kw)
        );
    }, [cat, q]);

    const submitContact = async (e: React.FormEvent) => {
        e.preventDefault();
        const next: typeof err = {};
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "올바른 이메일을 입력해 주세요.";
        if (!subject.trim()) next.subject = "제목을 입력해 주세요.";
        if (!msg.trim() || msg.length < 10)
            next.msg = "문의 내용을 10자 이상 입력해 주세요.";

        setErr(next);
        if (Object.keys(next).length) return;

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
            {/* 페이지 제목 영역 */}
            <div className={s.head}>
                <h1 className={s.title}>고객센터</h1>
                <p className={s.sub}>
                    무엇을 도와드릴까요? 아래에서 찾아보거나 문의를 남겨주세요.
                </p>
            </div>

            {/* ★ 제목 아래 사각형 카드 영역 */}
            <div className={s.panel}>
                {/* 상단: 검색 + 탭 */}
                <div className={s.panelTop}>
                    <div className={s.search}>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="키워드로 검색 (예: 로그인, AI 등록, ... )"
                        />
                    </div>

                    <div className={s.tabs}>
                        <button
                            className={tab === "faq" ? s.active : ""}
                            onClick={() => setTab("faq")}
                        >
                            자주 묻는 질문
                        </button>
                        <button
                            className={tab === "contact" ? s.active : ""}
                            onClick={() => setTab("contact")}
                        >
                            문의하기
                        </button>
                    </div>
                </div>

                {/* 하단: FAQ / 문의 폼 */}
                {tab === "faq" ? (
                    <section className={s.section}>
                        <div className={s.cats}>
                            {CATS.map((c) => (
                                <button
                                    key={c}
                                    className={`${s.cat} ${
                                        cat === c ? s.catActive : ""
                                    }`}
                                    onClick={() => setCat(c)}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <ul className={s.faq}>
                            {filtered.map((item) => (
                                <FaqItem
                                    key={item.id}
                                    q={item.q}
                                    a={item.a}
                                    open={openId === item.id}
                                    onToggle={() =>
                                        setOpenId(
                                            openId === item.id ? null : item.id
                                        )
                                    }
                                />
                            ))}
                            {filtered.length === 0 && (
                                <li
                                    className={s.item}
                                    style={{
                                        padding: 14,
                                        textAlign: "center",
                                    }}
                                >
                                    검색 결과가 없습니다.
                                </li>
                            )}
                        </ul>
                    </section>
                ) : (
                    <section className={s.section}>
                        {notice && <div className={s.notice}>{notice}</div>}

                        <form
                            className={s.form}
                            onSubmit={submitContact}
                            noValidate
                        >
                            <label className={s.field}>
                                <span>이메일</span>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={err.email ? s.invalid : ""}
                                />
                                {err.email && (
                                    <em className={s.error}>{err.email}</em>
                                )}
                            </label>

                            <label className={s.field}>
                                <span>문의 유형</span>
                                <select
                                    value={topic}
                                    onChange={(e) =>
                                        setTopic(e.target.value)
                                    }
                                >
                                    <option>일반 문의</option>
                                    <option>계정/로그인</option>
                                    <option>AI 등록/검수</option>
                                    <option>버그/기술 이슈</option>
                                    <option>제안/피드백</option>
                                </select>
                            </label>

                            <label className={s.field}>
                                <span>제목</span>
                                <input
                                    placeholder="문의 제목"
                                    value={subject}
                                    onChange={(e) =>
                                        setSubject(e.target.value)
                                    }
                                    className={err.subject ? s.invalid : ""}
                                />
                                {err.subject && (
                                    <em className={s.error}>
                                        {err.subject}
                                    </em>
                                )}
                            </label>

                            <label className={s.field}>
                                <span>내용</span>
                                <textarea
                                    placeholder="자세한 증상/재현 절차/스크린샷 링크 등을 적어주세요."
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    rows={6}
                                    className={err.msg ? s.invalid : ""}
                                />
                                {err.msg && (
                                    <em className={s.error}>{err.msg}</em>
                                )}
                            </label>

                            <div className={s.actions}>
                                <button
                                    type="submit"
                                    className={s.submit}
                                    disabled={loading}
                                >
                                    {loading ? "전송 중..." : "문의 보내기"}
                                </button>
                                <span className={s.fyi}>
                                    평균 1영업일 이내 회신드립니다.
                                </span>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
}

function FaqItem({
                     q,
                     a,
                     open,
                     onToggle,
                 }: {
    q: string;
    a: string;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <li className={`${s.item} ${open ? s.itemOpen : ""}`}>
            <button
                className={`${s.q} ${open ? s.qOpen : ""}`}
                onClick={onToggle}
                aria-expanded={open}
            >
                <span>{q}</span>
                <i>{open ? "–" : "+"}</i>
            </button>
            {open && <div className={s.a}>{a}</div>}
        </li>
    );
}
