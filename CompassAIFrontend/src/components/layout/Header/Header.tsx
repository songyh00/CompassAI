// src/components/layout/Header.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "./Header.module.css";
import { me, logout } from "@/api/client";
import type { Me } from "@/api/client";

export default function Header() {
    const [user, setUser] = useState<Me | null>(null);
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    // 로그인 유저 정보 조회
    useEffect(() => {
        me().then(setUser).catch(() => setUser(null));
    }, []);

    // auth:changed 이벤트(로그인/로그아웃 후 갱신)
    useEffect(() => {
        const handle = () => me().then(setUser).catch(() => setUser(null));
        window.addEventListener("auth:changed", handle);
        return () => window.removeEventListener("auth:changed", handle);
    }, []);

    const goHome = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = "/";
    };

    const onLogout = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        try {
            await logout();
            setUser(null);
            navigate("/");
        } catch {
            /* no-op */
        }
    };

    // 드롭다운 바깥 클릭 시 닫기
    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (menuRef.current?.contains(t)) return;
            if (btnRef.current?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, [open]);

    // ESC 키로 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const toggleMenu = () => setOpen((v) => !v);

    // ✅ 진짜 관리자만: role 이 ADMIN 또는 ROLE_ADMIN 일 때만 true
    const isAdmin =
        !!user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");

    return (
        <header className={s.header}>
            <div className={s.inner}>
                <a
                    href="/"
                    className={s.brand}
                    aria-label="CompassAI Home"
                    onClick={goHome}
                >
                    <img className={s.logo} src="/logo.png" alt="CompassAI 로고" />
                    <span className={s.text}>CompassAI</span>
                </a>

                <nav className={s.links} aria-label="유틸리티 메뉴">
                    {!user ? (
                        <>
                            <Link to="/community">커뮤니티</Link>
                            <span className={s.divider} aria-hidden="true">
                                |
                            </span>
                            <Link to="/help">고객센터</Link>
                            <span className={s.divider} aria-hidden="true">
                                |
                            </span>
                            <Link to="/login">로그인</Link>
                            <span className={s.divider} aria-hidden="true">
                                |
                            </span>
                            <Link to="/signup">회원가입</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/community">커뮤니티</Link>
                            <span className={s.divider} aria-hidden="true">
                                |
                            </span>
                            <Link to="/help">고객센터</Link>
                            <span className={s.divider} aria-hidden="true">
                                |
                            </span>

                            <div className={s.menuGroup}>
                                <button
                                    ref={btnRef}
                                    type="button"
                                    className={s.userButton}
                                    aria-haspopup="menu"
                                    aria-expanded={open}
                                    onClick={toggleMenu}
                                >
                                    <span className={s.hello}>{user.name}님</span>
                                    <span className={s.caret} aria-hidden="true">
                                        ▾
                                    </span>
                                </button>

                                {open && (
                                    <div
                                        ref={menuRef}
                                        className={s.dropdown}
                                        role="menu"
                                        aria-label="사용자 메뉴"
                                    >
                                        <Link
                                            to="/mypage"
                                            role="menuitem"
                                            className={s.dropdownItem}
                                            onClick={() => setOpen(false)}
                                        >
                                            마이페이지
                                        </Link>

                                        <Link
                                            to="/submit"
                                            role="menuitem"
                                            className={s.dropdownItem}
                                            onClick={() => setOpen(false)}
                                        >
                                            AI 등록
                                        </Link>

                                       {isAdmin && (
                                           <Link
                                               to="/admin/tools/review"
                                               role="menuitem"
                                               className={s.dropdownItem}
                                               onClick={() => setOpen(false)}
                                           >
                                               AI 검수
                                           </Link>
                                       )}


                                        <div
                                            className={s.separator}
                                            role="separator"
                                        />

                                        <button
                                            role="menuitem"
                                            className={s.dropdownItemBtn}
                                            onClick={onLogout}
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
