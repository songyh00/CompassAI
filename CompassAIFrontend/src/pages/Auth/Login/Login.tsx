import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "@/api/client";
import s from "./Login.module.css";

type LoginErrors = {
    email?: string;
    password?: string;
    root?: string;
};

export default function Login() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState(params.get("email") ?? "");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<LoginErrors>({});

    useEffect(() => {
        if (!email) {
            const saved = localStorage.getItem("compassai_last_email");
            if (saved) setEmail(saved);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validate = () => {
        const next: LoginErrors = {};
        if (!email.trim()) next.email = "이메일을 입력해 주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "이메일 형식이 올바르지 않습니다.";
        if (!password) next.password = "비밀번호를 입력해 주세요.";
        else if (password.length < 8)
            next.password = "비밀번호는 8자 이상이어야 합니다.";
        setErr(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErr({});
        try {
            // ✅ 백엔드 로그인
            await login({ email, password });

            // 이메일 저장(옵션)
            if (remember) localStorage.setItem("compassai_last_email", email);
            else localStorage.removeItem("compassai_last_email");

            // 성공 → 홈으로
            navigate("/");
        } catch (error) {
            const msg =
                error instanceof Error
                    ? error.message || "로그인에 실패했습니다."
                    : "로그인에 실패했습니다.";
            setErr({ root: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.wrap}>
            <form className={s.card} onSubmit={onSubmit} noValidate>
                <h1 className={s.title}>로그인</h1>

                {err.root && <div className={s.alert}>{err.root}</div>}

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

                <label className={s.field}>
                    <span className={s.label}>비밀번호</span>
                    <div className={s.group}>
                        <input
                            type={showPwd ? "text" : "password"}
                            autoComplete="current-password"
                            className={`${s.input} ${err.password ? s.invalid : ""}`}
                            placeholder="8자 이상"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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

                <div className={s.row}>
                    <label className={s.check}>
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        로그인 상태 유지
                    </label>
                    <Link to="" className={s.link}>
                        비밀번호 찾기
                    </Link>
                </div>

                <button type="submit" className={s.submit} disabled={loading}>
                    {loading ? "로그인 중..." : "로그인"}
                </button>

                <p className={s.foot}>
                    아직 계정이 없으신가요?{" "}
                    <Link to="/signup" className={s.link}>
                        회원가입
                    </Link>
                </p>
            </form>
        </div>
    );
}
