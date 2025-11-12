// CompassAIFrontend/src/pages/home/Home.tsx
import { useEffect, useMemo, useState } from "react";
import CategoryBar from "../../components/tool/CategoryBar/CategoryBar";
import SearchBar from "../../components/tool/SearchBar/SearchBar";
import ToolGrid from "../../components/tool/ToolGrid/ToolGrid";
import type { Category } from "../../types/category";
import type { Tool } from "../../types/tool";
import { getTools } from "../../api/tools"; // ★ 서버에서 목록 가져오기

/** UI에 보여줄 카테고리 목록 */
const CATEGORIES: Category[] = [
    { id: "write",         label: "글쓰기/콘텐츠" },
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
    write: ["글쓰기/콘텐츠", "글쓰기/컨텐츠"],
    design: ["디자인/아트"],
    video: ["비디오/오디오"],
    productivity: ["생산성/협업도구"],
    edu: ["교육/학습"],
    dev: ["개발/프로그래밍"],
    biz: ["비즈니스/마케팅"],
    search: ["검색/데이터"],
    ent: ["엔터테인먼트/기타"],
    game: ["게임"],
    life: ["일상생활형 서비스"],
};

export default function Home() {
    const [active, setActive]   = useState<string | null>(null); // 선택 카테고리(UI id)
    const [query, setQuery]     = useState("");                  // 검색어
    const [items, setItems]     = useState<Tool[]>([]);          // 서버 결과
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const handleSearch = (q: string) => setQuery(q);

    // 서버에 보낼 실제 카테고리 라벨 (UI id → 첫 번째 라벨)
    const serverCategory = useMemo(() => {
        if (!active) return null;
        const arr = CAT_LABELS[active] ?? [];
        return arr[0] ?? null;
    }, [active]);

    useEffect(() => {
        let dead = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const page = await getTools({
                    category: serverCategory,
                    q: query.trim() || null,
                    page: 0,
                    size: 60,
                });
                if (!dead) setItems(page.content);
            } catch (err) {
                if (!dead) {
                    const message =
                        err instanceof Error ? err.message : String(err);
                    setError(message);
                }
            } finally {
                if (!dead) setLoading(false);
            }
        })();
        return () => {
            dead = true;
        };
    }, [serverCategory, query]);

    return (
        <section className="home" style={{ textAlign: "center", padding: "32px 0" }}>
            <h1 style={{ fontSize: 36, margin: "24px 0 16px" }}>
                AI 툴을 빠르게 찾는 곳
            </h1>

            <SearchBar placeholder="AI 서비스 검색" onSearch={handleSearch} />

            <div style={{ marginTop: 16 }}>
                <CategoryBar items={CATEGORIES} activeId={active} onChange={setActive} />
            </div>

            {loading && (
                <p style={{ marginTop: 40 }}>불러오는 중…</p>
            )}

            {error && (
                <p style={{ marginTop: 40, color: "crimson" }}>오류: {error}</p>
            )}

            {!loading && !error && (items.length === 0 ? (
                <p
                    style={{
                        marginTop: "40px",
                        fontSize: "18px",
                        color: "#666",
                        fontWeight: 500,
                    }}
                >
                    {active
                        ? "선택한 카테고리에 해당하는 서비스가 없습니다."
                        : "해당하는 서비스가 없습니다."}
                </p>
            ) : (
                <div className="tool-section">
                    <ToolGrid items={items} />
                </div>
            ))}
        </section>
    );
}
