import { useEffect, useRef, useState } from "react";
import s from "./SearchBar.module.css";

type Props = {
    placeholder?: string;       // 입력창 placeholder 문구
    defaultValue?: string;      // 초기 입력값
    onSearch: (q: string) => void; // 검색 실행 시 부모로 전달되는 콜백
};

/**
 * SearchBar 컴포넌트
 * --------------------------------------------------
 * - AI 서비스 검색 입력창
 * - 엔터로 검색 실행 / ESC로 입력 초기화
 * - 입력값이 없을 때 중앙 placeholder(ghost) 표시
 */
export default function SearchBar({
                                      placeholder = "AI 서비스 검색",
                                      defaultValue = "",
                                      onSearch,
                                  }: Props) {
    /** 입력값 상태 */
    const [q, setQ] = useState(defaultValue);

    /** input 엘리먼트 참조 (초점 이동용) */
    const inputRef = useRef<HTMLInputElement>(null);

    /** 외부에서 defaultValue가 바뀔 때 내부 상태도 동기화 */
    useEffect(() => setQ(defaultValue), [defaultValue]);

    /** 검색 실행 함수 (양쪽 공백 제거 후 전달) */
    const doSearch = () => onSearch(q.trim());

    /** 입력 초기화 함수 */
    const clear = () => {
        setQ("");
        onSearch("");            // 부모 컴포넌트에도 빈 검색 전달
        inputRef.current?.focus(); // 입력창에 포커스 복귀
    };

    return (
        <div className={s.wrap} role="search">
            {/* ===== 중앙 placeholder (직접 입력 없을 때만 표시) ===== */}
            {!q && <span className={s.ghost}>{placeholder}</span>}

            {/* ===== 실제 입력창 ===== */}
            <input
                ref={inputRef}
                className={s.input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();  // 엔터 → 검색 실행
                    if (e.key === "Escape") clear();     // ESC → 입력 초기화
                }}
                placeholder={placeholder}                // 접근성 보조용 (CSS로 시각적 숨김)
                aria-label="AI 툴 검색"
            />

            {/* ===== 입력 초기화 버튼 (×) ===== */}
            {q && (
                <button
                    className={s.clear}
                    onClick={clear}
                    aria-label="검색어 지우기"
                    type="button"
                >
                    ×
                </button>
            )}

            {/* ===== 검색 실행 버튼 ===== */}
            <button
                className={s.button}
                onClick={doSearch}
                type="button"
            >
                검색
            </button>
        </div>
    );
}
