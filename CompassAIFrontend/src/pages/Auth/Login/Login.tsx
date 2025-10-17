import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import s from "./Login.module.css";

/** 폼 검증 시 발생할 수 있는 오류 필드 타입 */
type LoginErrors = {
    email?: string;
    password?: string;
    root?: string;
};

export default function Login() {
    /** URL 쿼리(email 파라미터) 읽기 */
    const [params] = useSearchParams();
    const navigate = useNavigate();

    /** 상태 관리 */
    const [email, setEmail] = useState(params.get("email") ?? "");  // 이메일 입력값
    const [password, setPassword] = useState("");                   // 비밀번호 입력값
    const [showPwd, setShowPwd] = useState(false);                  // 비밀번호 보기 토글
    const [remember, setRemember] = useState(true);                 // 로그인 상태 유지 체크박스
    const [loading, setLoading] = useState(false);                  // 로그인 중 로딩 상태
    const [err, setErr] = useState<LoginErrors>({});                // 폼 입력 오류 객체

    /** 페이지 진입 시 — 로컬 저장된 이메일 자동 불러오기 */
    useEffect(() => {
        if (!email) {
            const saved = localStorage.getItem("compassai_last_email");
            if (saved) setEmail(saved);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 입력값 검증 함수 */
    const validate = () => {
        const next: LoginErrors = {};

        // 이메일 검증
        if (!email.trim()) next.email = "이메일을 입력해 주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "이메일 형식이 올바르지 않습니다.";

        // 비밀번호 검증
        if (!password) next.password = "비밀번호를 입력해 주세요.";
        else if (password.length < 8)
            next.password = "비밀번호는 8자 이상이어야 합니다.";

        setErr(next);
        return Object.keys(next).length === 0; // 오류 없으면 true
    };

    /** 로그인 폼 제출 이벤트 */
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 입력값 검증 통과 실패 시 중단
        if (!validate()) return;

        setLoading(true);
        try {
            /** 임시: 실제 백엔드 연결 전 데모용 딜레이 */
            await new Promise((r) => setTimeout(r, 500));

            // 이메일 저장 (remember 체크 시)
            if (remember) localStorage.setItem("compassai_last_email", email);
            else localStorage.removeItem("compassai_last_email");

            // 로그인 성공 후 홈으로 이동
            navigate("/");
        } catch {
            // 예외 발생 시 에러 메시지 표시
            setErr({ root: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.wrap}>
            {/* 메인 로그인 카드 */}
            <form className={s.card} onSubmit={onSubmit} noValidate>
                <h1 className={s.title}>로그인</h1>

                {/* 전체 오류 메시지 (루트 레벨) */}
                {err.root && <div className={s.alert}>{err.root}</div>}

                {/* ===== 이메일 입력 ===== */}
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

                {/* ===== 비밀번호 입력 ===== */}
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
                        {/* 비밀번호 보기/숨김 토글 버튼 */}
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

                {/* ===== 옵션 영역 ===== */}
                <div className={s.row}>
                    {/* 로그인 상태 유지 체크박스 */}
                    <label className={s.check}>
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        로그인 상태 유지
                    </label>
                    {/* 비밀번호 찾기 링크 */}
                    <Link to="" className={s.link}>
                        비밀번호 찾기
                    </Link>
                </div>

                {/* ===== 제출 버튼 ===== */}
                <button type="submit" className={s.submit} disabled={loading}>
                    {loading ? "로그인 중..." : "로그인"}
                </button>

                {/* ===== 하단 회원가입 링크 ===== */}
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
