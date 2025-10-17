import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "./Signup.module.css";

/** 폼 검증 시 사용할 에러 메시지 타입 */
type Errors = {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    agree?: string;
    root?: string;
};

export default function Signup() {
    const navigate = useNavigate();

    /** ===== 입력 상태 ===== */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [agree, setAgree] = useState(false);

    /** 로딩/에러 상태 */
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<Errors>({});

    /** ===== 유효성 검사 ===== */
    const validate = () => {
        const next: Errors = {};

        if (!name.trim()) next.name = "이름을 입력해 주세요.";

        if (!email.trim()) next.email = "이메일을 입력해 주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "이메일 형식이 올바르지 않습니다.";

        if (!password) next.password = "비밀번호를 입력해 주세요.";
        else if (password.length < 8)
            next.password = "비밀번호는 8자 이상이어야 합니다.";

        if (!confirm) next.confirm = "비밀번호 확인을 입력해 주세요.";
        else if (password !== confirm)
            next.confirm = "비밀번호가 일치하지 않습니다.";

        if (!agree) next.agree = "약관에 동의해 주세요.";

        setErr(next);
        return Object.keys(next).length === 0; // 에러 없으면 통과
    };

    /** ===== 제출 핸들러 ===== */
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            // TODO: 실제 백엔드 연동 전 데모 대기
            await new Promise((r) => setTimeout(r, 600));

            // 성공 가정 → 로그인 페이지로 이동 (이메일 프리필)
            navigate(`/login?email=${encodeURIComponent(email)}`);
        } catch {
            setErr({ root: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.wrap}>
            {/* 회원가입 카드 */}
            <form className={s.card} onSubmit={onSubmit} noValidate>
                <h1 className={s.title}>회원가입</h1>

                {/* 루트 레벨 에러 (서버/알 수 없는 오류 등) */}
                {err.root && <div className={s.alert}>{err.root}</div>}

                {/* ===== 이름 ===== */}
                <label className={s.field}>
                    <span className={s.label}>이름</span>
                    <input
                        className={`${s.input} ${err.name ? s.invalid : ""}`}
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {err.name && <span className={s.error}>{err.name}</span>}
                </label>

                {/* ===== 이메일 ===== */}
                <label className={s.field}>
                    <span className={s.label}>이메일</span>
                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        className={`${s.input} ${err.email ? s.invalid : ""}`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {err.email && <span className={s.error}>{err.email}</span>}
                </label>

                {/* ===== 비밀번호 ===== */}
                <label className={s.field}>
                    <span className={s.label}>비밀번호</span>
                    <div className={s.group}>
                        <input
                            type={showPwd ? "text" : "password"}
                            autoComplete="new-password"
                            className={`${s.input} ${err.password ? s.invalid : ""}`}
                            placeholder="8자 이상"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* 비밀번호 보기/숨김 토글 */}
                        <button
                            type="button"
                            className={s.ghostBtn}
                            aria-label={showPwd ? "비밀번호 숨기기" : "비밀번호 보기"}
                            onClick={() => setShowPwd((v) => !v)}
                        >
                            {showPwd ? "숨김" : "보기"}
                        </button>
                    </div>
                    {err.password && <span className={s.error}>{err.password}</span>}
                </label>

                {/* ===== 비밀번호 확인 ===== */}
                <label className={s.field}>
                    <span className={s.label}>비밀번호 확인</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className={`${s.input} ${err.confirm ? s.invalid : ""}`}
                        placeholder="한번 더 입력"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                    {err.confirm && <span className={s.error}>{err.confirm}</span>}
                </label>

                {/* ===== 약관 동의 ===== */}
                <label className={s.check} style={{ marginTop: 12 }}>
                    <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span>
            <Link to="/terms" className={s.link}>
              서비스 이용약관
            </Link>{" "}
                        및{" "}
                        <Link to="/privacy" className={s.link}>
              개인정보 처리방침
            </Link>
            에 동의합니다.
          </span>
                </label>
                {err.agree && <span className={s.error}>{err.agree}</span>}

                {/* ===== 제출 버튼 ===== */}
                <button type="submit" className={s.submit} disabled={loading}>
                    {loading ? "가입 중..." : "회원가입"}
                </button>

                {/* ===== 하단: 로그인 안내 ===== */}
                <p className={s.foot}>
                    이미 계정이 있으신가요?{" "}
                    <Link to="/login" className={s.link}>
                        로그인
                    </Link>
                </p>
            </form>
        </div>
    );
}
