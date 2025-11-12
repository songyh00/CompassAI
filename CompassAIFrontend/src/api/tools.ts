import { getJSON } from "./apiUtils";
import type { Page } from "../types/page";
import type { Tool } from "../types/tool";

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

export async function getTools(params?: {
    category?: string | null;
    q?: string | null;
    origin?: string | null;
    page?: number;
    size?: number;
}) {
    const usp = new URLSearchParams();
    if (params?.category) usp.set("category", params.category);
    if (params?.q) usp.set("q", params.q);
    if (params?.origin) usp.set("origin", params.origin);
    usp.set("page", String(params?.page ?? 0));
    usp.set("size", String(params?.size ?? 40));

    const page = await getJSON<Page<AiToolResponse>>(`/tools?${usp.toString()}`);
    return {
        ...page,
        content: page.content.map(mapDto),
    };
}

export async function getTool(id: number | string) {
    const dto = await getJSON<AiToolResponse>(`/tools/${id}`);
    return mapDto(dto);
}
