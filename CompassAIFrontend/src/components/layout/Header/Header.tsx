import s from "./Header.module.css";

export default function Header() {
    /**
     * 홈 로고 클릭 시 전체 새로고침 (SPA 이동이 아닌 완전한 리로드)
     * - 브라우저 캐시/상태를 초기화하기 위해 사용
     */
    const goHome = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = "/";
    };

    return (
        <header className={s.header}>
            <div className={s.inner}>
                {/* =======================
                    좌측 영역: 브랜드 로고 & 이름
                   ======================= */}
                <a
                    href="/"
                    className={s.brand}
                    aria-label="CompassAI Home"
                    onClick={goHome}
                >
                    {/* 브랜드 로고 이미지 */}
                    <img
                        className={s.logo}
                        src="/logo.png"
                        alt="CompassAI 로고"
                    />

                    {/* 브랜드 텍스트 (사이트명) */}
                    <span className={s.text}>CompassAI</span>
                </a>

                {/* =======================
                    우측 영역: 상단 메뉴 링크 모음
                    (로그인, 회원가입, AI 등록, 고객센터)
                   ======================= */}
                <nav className={s.links} aria-label="유틸리티 메뉴">
                    <a href="/login">로그인</a>
                    <span className={s.divider} aria-hidden="true">|</span>

                    <a href="/signup">회원가입</a>
                    <span className={s.divider} aria-hidden="true">|</span>

                    <a href="/submit">AI 등록</a>
                    <span className={s.divider} aria-hidden="true">|</span>

                    <a href="/help">고객센터</a>
                </nav>
            </div>
        </header>
    );
}
