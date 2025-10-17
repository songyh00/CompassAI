import { useMemo, useState } from "react";
import type { Tool } from "../../../types/tool";
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
 * --------------------------------------------------
 * - AI 툴 카드 1개를 표시
 * - hover 시 더 큰 팝오버 카드가 위로 표시됨
 * - 이미지 후보를 순차 시도하며 로딩 실패 대비
 */
export default function ToolCard({ tool }: Props) {
    /** 🔹 로고 이미지 후보 경로 (우선순위 순으로 시도) */
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

    /** 🔹 이름을 한글 / 영어(괄호)로 분리 */
    const { koName, enName } = useMemo(() => {
        const m = tool.name.match(/^(.*?)\s*\((.*?)\)\s*$/);
        if (m) return { koName: m[1].trim(), enName: m[2].trim() };
        return { koName: tool.name.trim(), enName: "" };
    }, [tool.name]);

    /** 🔹 보조 데이터 처리 (값 없을 때 안전하게 기본값 적용) */
    const origin = tool.origin ?? "";              // "국내" | "해외"
    const long = tool.long ?? tool.subTitle ?? ""; // 상세 설명
    const platform = tool.subTitle ?? "";          // 하단 보조 텍스트
    const tags = Array.isArray(tool.tags) ? tool.tags.slice(0, 8) : [];

    return (
        <div className={s.wrap}>
            {/* ===== 기본 카드 ===== */}
            <a className={s.card} href={tool.url || "#"} target="_blank" rel="noreferrer">
                <div className={s.inner}>
                    {/* 왼쪽: 로고 */}
                    <div className={s.left}>
                        <div className={s.logo}>
                            {src && (
                                <img
                                    src={src}
                                    alt={tool.name}
                                    onError={() => {
                                        // 로딩 실패 시 다음 후보로 교체
                                        if (idx < candidates.length - 1) setIdx(idx + 1);
                                    }}
                                />
                            )}
                        </div>
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

            {/* ===== 팝오버 (카드 위로 마우스 올릴 때 표시) ===== */}
            <div className={s.popover} role="dialog" aria-hidden="true">
                {/* 상단: 로고 + 이름 + 국가 뱃지 */}
                <div className={s.popHead}>
                    <div className={s.popLogo}>
                        {src && <img src={src} alt="" />}
                    </div>
                    <div className={s.popTitleBox}>
                        <div className={s.popTitle}>
                            {koName}
                            {enName && <span className={s.popEn}> ({enName})</span>}
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

                {/* 본문 설명 */}
                {long && <div className={s.popBody}>{long}</div>}

                {/* 태그 목록 */}
                {tags.length > 0 && (
                    <div className={s.tags}>
                        {tags.map((t) => (
                            <span key={t} className={s.tag}>#{t}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
