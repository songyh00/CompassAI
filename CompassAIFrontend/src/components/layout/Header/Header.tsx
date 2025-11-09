import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "./Header.module.css";
import { me, logout } from "@/api/client";
import type { Me } from "@/api/client";

export default function Header() {
    const [user, setUser] = useState<Me>(null);
    const navigate = useNavigate();

    // 최초 로드 시 현재 세션 사용자 조회
    useEffect(() => {
        me().then(setUser).catch(() => setUser(null));
    }, []);

    // ✅ 로그인/로그아웃 시점에 헤더 갱신
    useEffect(() => {
        const handle = () => me().then(setUser).catch(() => setUser(null));
        window.addEventListener("auth:changed", handle);
        return () => window.removeEventListener("auth:changed", handle);
    }, []);

    const goHome = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = "/";
    };

    const onLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await logout();
            setUser(null);
            navigate("/");
        } catch {
            // 필요 시 토스트 처리
        }
    };

    return (
        <header className={s.header}>
            <div className={s.inner}>
                <a href="/" className={s.brand} aria-label="CompassAI Home" onClick={goHome}>
                    <img className={s.logo} src="/logo.png" alt="CompassAI 로고" />
                    <span className={s.text}>CompassAI</span>
                </a>

                <nav className={s.links} aria-label="유틸리티 메뉴">
                    {!user ? (
                        <>
                            <Link to="/login">로그인</Link>
                            <span className={s.divider} aria-hidden="true">|</span>
                            <Link to="/signup">회원가입</Link>
                            <span className={s.divider} aria-hidden="true">|</span>
                            <Link to="/help">고객센터</Link>
                        </>
                    ) : (
                        <>
                            <div className={s.menuGroup}>
                                <span className={s.hello}>{user.name}님</span>
                                {/* 드롭다운 추가 예정 영역 */}
                            </div>
                            <span className={s.divider} aria-hidden="true">|</span>
                            <Link to="/submit">AI 등록</Link>
                            <span className={s.divider} aria-hidden="true">|</span>
                            <a href="/logout" onClick={onLogout}>로그아웃</a>
                            <span className={s.divider} aria-hidden="true">|</span>
                            <Link to="/help">고객센터</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
