import { useMemo, useState, useEffect } from "react";
import type { Tool } from "../../../types/tool";
import { fetchLikeStatus, toggleToolLike } from "../../../api/apiUtils";
import s from "./ToolCard.module.css";

/**
 * Tool 타입 확장
 * - tags, origin, long, subTitle 등 일부 선택 필드를 추가로 허용
 */
type ToolPlus = Tool & {
    tags?: string[];
    origin?: "국내" | "해외" | string;
    long?: string;
    subTitle?: string;
};

type Props = { tool: ToolPlus };

/**
 * ToolCard 컴포넌트
 */
export default function ToolCard({ tool }: Props) {
    /** 로고 이미지 후보 경로 (우선순위 순으로 시도) */
    const candidates = useMemo(() => {
        const name = tool.name.trim();
        const asIs = `/${name}.png`;
        const logos = `/logos/${name}.png`;
        const images = `/images/${name}.png`;
        const list = [tool.logo, asIs, logos, images].filter(Boolean) as string[];
        return list.map((p) => encodeURI(p));
    }, [tool.logo, tool.name]);

    /** 현재 표시 중인 이미지 인덱스 */
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? "";

    /** 좋아요 상태 */
    const [liked, setLiked] = useState(false);

    /** 초기 좋아요 상태 서버에서 불러오기 */
    useEffect(() => {
        async function loadLike() {
            try {
                const res = await fetchLikeStatus(tool.id);
                setLiked(res.liked);
            } catch (err) {
                console.error(err);
            }
        }
        loadLike();
    }, [tool.id]);

    /** 이름 한글 / 영어 분리 */
    const { koName, enName } = useMemo(() => {
        const m = tool.name.match(/^(.*?)\s*\((.*?)\)\s*$/);
        if (m) return { koName: m[1].trim(), enName: m[2].trim() };
        return { koName: tool.name.trim(), enName: "" };
    }, [tool.name]);

    /** 보조 데이터 처리 */
    const origin = tool.origin ?? "";
    const long = tool.long ?? tool.subTitle ?? "";
    const platform = tool.subTitle ?? "";
    const tags = Array.isArray(tool.tags) ? tool.tags.slice(0, 8) : [];

    return (
        <div className={s.wrap}>
            {/* 기본 카드 */}
            <a className={s.card} href={tool.url || "#"} target="_blank" rel="noreferrer">
                <div className={s.inner}>
                    {/* 왼쪽: 로고 + 좋아요 */}
                    <div className={s.left}>
                        <div className={s.logo}>
                            {src && (
                                <img
                                    src={src}
                                    alt={tool.name}
                                    onError={() => {
                                        if (idx < candidates.length - 1) setIdx(idx + 1);
                                    }}
                                />
                            )}
                        </div>

                        {/* 좋아요 버튼 */}
                        <button
                            className={s.likeBtn}
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                    const res = await toggleToolLike(tool.id, liked);
                                    setLiked(res.liked);
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                        >
                            {liked ? "❤️" : "🤍"}
                        </button>
                    </div>

                    {/* 오른쪽: 이름 + 부제 */}
                    <div className={s.right}>
                        <div className={s.rightTop}>
                            <h3 className={s.title}>
                                <span className={s.titleKo}>{koName}</span>
                                {enName && <span className={s.titleEn}>({enName})</span>}
                            </h3>
                        </div>

                        <div className={s.rightBottom}>
                            <div className={s.desc}>{tool.subTitle}</div>
                        </div>
                    </div>
                </div>
            </a>

            {/* 팝오버 */}
            <div className={s.popover} role="dialog" aria-hidden="true">
                <div className={s.popHead}>
                    <div className={s.popLogo}>{src && <img src={src} alt="" />}</div>

                    <div className={s.popTitleBox}>
                        <div className={s.popTitle}>
                            {koName}
                            {enName && <span className={s.popEn}>({enName})</span>}
                        </div>
                        {platform && <div className={s.popSub}>{platform}</div>}
                    </div>

                    {origin && (
                        <span
                            className={`${s.badge} ${
                                origin === "국내" ? s.badgeKr : s.badgeGl
                            }`}
                        >
                            {origin}
                        </span>
                    )}
                </div>

                {long && <div className={s.popBody}>{long}</div>}

                {tags.length > 0 && (
                    <div className={s.tags}>
                        {tags.map((t) => (
                            <span key={t} className={s.tag}>
                                #{t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
