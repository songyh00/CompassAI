import ToolCard from "../ToolCard/ToolCard";
import type { Tool } from "../../../types/tool";
import s from "./ToolGrid.module.css";

type Props = { items: Tool[] };

/**
 * ToolGrid 컴포넌트
 * --------------------------------------------------
 * - 여러 개의 AI 툴 카드를 격자(grid) 형태로 렌더링
 * - 각 카드(`ToolCard`)는 개별 툴 정보를 표시
 */
export default function ToolGrid({ items }: Props) {
    return (
        <section className={s.section}>
            <div className={s.grid}>
                {/* Tool 배열을 순회하며 카드 생성 */}
                {items.map((t) => (
                    <ToolCard key={t.id} tool={t} />
                ))}
            </div>
        </section>
    );
}
