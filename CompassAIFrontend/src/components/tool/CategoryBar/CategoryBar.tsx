import { useMemo } from "react";
import s from "./CategoryBar.module.css";

/**
 * 카테고리 객체 타입
 * - id: 고유 식별자
 * - label: 화면에 표시할 이름
 */
export type Category = { id: string; label: string };

type Props = {
    items: Category[];              // 표시할 카테고리 목록
    activeId: string | null;        // 현재 선택된 카테고리 id (없으면 전체)
    onChange: (id: string | null) => void;  // 카테고리 클릭 시 호출되는 콜백
};

/**
 * CategoryBar 컴포넌트
 * --------------------------------------------------
 * - 상단 카테고리 버튼 리스트를 렌더링
 * - "전체" 버튼을 항상 가장 앞에 표시
 * - 클릭 시 선택 상태(activeId) 변경
 */
export default function CategoryBar({ items, activeId, onChange }: Props) {
    /** "전체" 카테고리 항목을 메모이제이션 (한 번만 생성) */
    const allItem: Category = useMemo(() => ({ id: "", label: "전체" }), []);

    /** 클릭 핸들러: id가 비어 있으면 전체(null)로 처리 */
    const handleClick = (id: string) => onChange(id || null);

    return (
        <div className={s.catbar}>
            <div className={s.track}>
                {/* [전체] 버튼 */}
                <button
                    type="button"
                    className={`${s.chip} ${activeId === null ? s.active : ""}`}
                    onClick={() => handleClick(allItem.id)}
                >
                    {allItem.label}
                </button>

                {/* 개별 카테고리 버튼 */}
                {items.map((it) => (
                    <button
                        key={it.id}
                        type="button"
                        className={`${s.chip} ${activeId === it.id ? s.active : ""}`}
                        onClick={() => handleClick(it.id)}
                    >
                        {it.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
