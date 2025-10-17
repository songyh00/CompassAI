import { useMemo, useState } from "react";
import CategoryBar from "../../components/tool/CategoryBar/CategoryBar";
import SearchBar from "../../components/tool/SearchBar/SearchBar";
import ToolGrid from "../../components/tool/ToolGrid/ToolGrid";
import type { Category } from "../../types/category";
import { TOOLS } from "../../data/tools";
import type { Tool } from "../../types/tool";

/** UI에 보여줄 카테고리 목록 */
const CATEGORIES: Category[] = [
    { id: "write",         label: "글쓰기/콘텐츠" },   // 표준 라벨(콘텐츠)
    { id: "design",        label: "디자인/아트" },
    { id: "video",         label: "비디오/오디오" },
    { id: "productivity",  label: "생산성/협업도구" },
    { id: "edu",           label: "교육/학습" },
    { id: "dev",           label: "개발/프로그래밍" },
    { id: "biz",           label: "비즈니스/마케팅" },
    { id: "search",        label: "검색/데이터" },
    { id: "ent",           label: "엔터테인먼트/기타" },
    { id: "game",          label: "게임" },
    { id: "life",          label: "일상생활형 서비스" },

];

/** 데이터상 카테고리 표기가 섞여 있을 수 있어 매핑(동의어) 정의 */
const CAT_LABELS: Record<string, string[]> = {
    write: ["글쓰기/콘텐츠", "글쓰기/컨텐츠"], // 두 표기를 모두 허용
    design: ["디자인/아트"],
    video: ["비디오/오디오"],
    productivity: ["생산성/협업도구"],
    edu: ["교육/학습"],
    dev: ["개발/프로그래밍"],
    biz: ["비즈니스/마케팅"],
    search: ["검색/데이터"],
    ent: ["엔터테인먼트/기타"],
    game: ["게임"],
    life: ["일상생활형 서비스"]
};

export default function Home() {
    const [active, setActive] = useState<string | null>(null); // null = 전체
    const [query, setQuery] = useState("");

    const handleSearch = (q: string) => setQuery(q);

    /** 단일/다중 카테고리를 모두 지원하는 헬퍼 */
    const getCategories = (t: Tool): string[] =>
        Array.isArray(t.categories)
            ? t.categories
            : t.category
                ? [t.category]
                : [];

    /** 카테고리/검색 필터링 */
    const filtered: Tool[] = useMemo(() => {
        let list = TOOLS;

        // 카테고리 필터 (여러 카테고리 지원)
        if (active) {
            const targets = CAT_LABELS[active] ?? [];
            list = list.filter((t) => {
                const cats = getCategories(t);
                return cats.some((c) => targets.includes(c));
            });
        }

        // 검색어 필터 (이름, 서브타이틀)
        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    (t.subTitle ?? "").toLowerCase().includes(q)
            );
        }

        return list;
    }, [active, query]);

    return (
        <section className="home" style={{ textAlign: "center", padding: "32px 0" }}>
            <h1 style={{ fontSize: 36, margin: "24px 0 16px" }}>
                AI 툴을 빠르게 찾는 곳
            </h1>

            <SearchBar placeholder="AI 서비스 검색" onSearch={handleSearch} />

            <div style={{ marginTop: 16 }}>
                <CategoryBar items={CATEGORIES} activeId={active} onChange={setActive} />
            </div>

            {/* ✅ 검색 결과 조건 처리 (한 번만 출력되게) */}
            {filtered.length === 0 ? (
                <p
                    style={{
                        marginTop: "40px",
                        fontSize: "18px",
                        color: "#666",
                        fontWeight: 500,
                    }}
                >
                    {active
                        ? `선택한 카테고리에 해당하는 서비스가 없습니다.`
                        : `해당하는 서비스가 없습니다.`}
                </p>
            ) : (
                <div className="tool-section">
                    <ToolGrid items={filtered} />
                </div>
            )}
        </section>

    );
}
