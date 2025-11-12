import { getJSON } from "./client";       // ← 너의 공통 유틸 파일 경로에 맞춰 수정
import type { Page } from "../types/page";
import type { Tool } from "../types/tool";

/** 서버 DTO 타입 (백엔드 AiToolResponse) */
type AiToolResponse = {
    id: number;
    name: string;
    subTitle?: string;
    origin?: string;
    url?: string;
    logo?: string;
    description?: string;
    categories: string[];
};

/** 서버 DTO → 프론트 Tool 매핑 (long = description) */
function mapDto(t: AiToolResponse): Tool {
    return {
        id: t.id,
        name: t.name,
        subTitle: t.subTitle,
        origin: t.origin,
        url: t.url,
        logo: t.logo,
        long: t.description,
        categories: t.categories ?? [],
    };
}

/** GET /api/tools (카테고리/검색/출처/페이지네이션) */
export async function getTools(params?: {
    category?: string | null;
    q?: string | null;
    origin?: string | null;
    page?: number;
    size?: number;
}) {
    const usp = new URLSearchParams();
    if (params?.category) usp.set("category", params.category);
    if (params?.q)        usp.set("q", params.q);
    if (params?.origin)   usp.set("origin", params.origin);
    usp.set("page", String(params?.page ?? 0));
    usp.set("size", String(params?.size ?? 40));

    const page = await getJSON<Page<AiToolResponse>>(`/tools?${usp.toString()}`);
    return {
        ...page,
        content: page.content.map(mapDto) as Tool[],
    };
}

/** GET /api/tools/{id} (단건) */
export async function getTool(id: number | string) {
    const dto = await getJSON<AiToolResponse>(`/tools/${id}`);
    return mapDto(dto);
}
