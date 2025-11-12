// src/pages/signup/Signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postJSON } from "@/api/apiUtils";   // ← 변경 포인트
import { login } from "@/api/client";        // ← 로그인은 client.ts
import s from "./Signup.module.css";

type Errors = {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    agree?: string;
    root?: string;
};

function getErrorMessage(e: unknown): string {
    if (e instanceof Error && e.message) return e.message;
    const anyErr = e as {
        message?: string;
        response?: { statusText?: string; data?: { message?: string } };
    } | undefined;
    return (
        anyErr?.response?.data?.message ??
        anyErr?.response?.statusText ??
        anyErr?.message ??
        "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요."
    );
}

function mapMessageToFieldErrors(msg: string): Partial<Errors> {
    const m = msg.toLowerCase();

    if (m.includes("이미 존재") || m.includes("중복") || m.includes("exists") || m.includes("duplicate")) {
        return { email: "이미 사용 중인 이메일입니다." };
    }

    if (m.includes("이름")) return { name: msg };
    if (m.includes("email") || m.includes("이메일")) return { email: msg };
    if (m.includes("비밀번호") || m.includes("password")) return { password: msg };

    return { root: msg };
}

export default function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [agree, setAgree] = useState(false);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<Errors>({});

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
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErr({});
        try {
            await postJSON("/auth/signup", { name, email, password });
            await login({ email, password });
            navigate("/");
        } catch (e: unknown) {
            const msg = getErrorMessage(e);
            const mapped = mapMessageToFieldErrors(msg);
            setErr((prev) => ({ ...prev, ...mapped }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.wrap}>
            <form className={s.card} onSubmit={onSubmit} noValidate>
                <h1 className={s.title}>회원가입</h1>

                {err.root && <div className={s.alert}>{err.root}</div>}

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

                <label className={s.field}>
                    <span className={s.label}>이메일</span>
                    <input
                        type="email"
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
                            className={`${s.input} ${err.password ? s.invalid : ""}`}
                            placeholder="8자 이상"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={s.ghostBtn}
                            onClick={() => setShowPwd((v) => !v)}
                        >
                            {showPwd ? "숨김" : "보기"}
                        </button>
                    </div>
                    {err.password && <span className={s.error}>{err.password}</span>}
                </label>

                <label className={s.field}>
                    <span className={s.label}>비밀번호 확인</span>
                    <input
                        type="password"
                        className={`${s.input} ${err.confirm ? s.invalid : ""}`}
                        placeholder="한번 더 입력"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                    {err.confirm && <span className={s.error}>{err.confirm}</span>}
                </label>

                <label className={s.check} style={{ marginTop: 12 }}>
                    <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span>
            <Link to="/terms" className={s.link}>서비스 이용약관</Link>{" "}및{" "}
                        <Link to="/privacy" className={s.link}>개인정보 처리방침</Link>
            에 동의합니다.
          </span>
                </label>
                {err.agree && <span className={s.error}>{err.agree}</span>}

                <button type="submit" className={s.submit} disabled={loading}>
                    {loading ? "가입 중..." : "회원가입"}
                </button>

                <p className={s.foot}>
                    이미 계정이 있으신가요?{" "}
                    <Link to="/login" className={s.link}>로그인</Link>
                </p>
            </form>
        </div>
    );
}
