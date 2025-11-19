const API_BASE = "/api";

async function parse<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!res.ok) throw new Error(text || "Request failed");
    return (text ? JSON.parse(text) : null) as T;
}

export async function getJSON<T>(path: string): Promise<T> {
    const res = await fetch(API_BASE + path, { credentials: "include" });
    return parse<T>(res);
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });
    return parse<T>(res);
}

export async function postEmpty(path: string): Promise<void> {
    const res = await fetch(API_BASE + path, {
        method: "POST",
        credentials: "include",
    });
    await parse(res);
}

/* ==============================
   좋아요 API 유틸
   ============================== */

export type LikeStatusResponse = {
    toolId: number;
    liked: boolean;
    likeCount: number;
};

export async function fetchLikeStatus(
    toolId: number | string
): Promise<LikeStatusResponse> {
    return getJSON<LikeStatusResponse>(`/tools/${toolId}/like/status`);
}

export async function likeTool(
    toolId: number | string
): Promise<LikeStatusResponse> {
    const res = await fetch(`${API_BASE}/tools/${toolId}/like`, {
        method: "POST",
        credentials: "include",
    });
    return parse<LikeStatusResponse>(res);
}

export async function unlikeTool(
    toolId: number | string
): Promise<LikeStatusResponse> {
    const res = await fetch(`${API_BASE}/tools/${toolId}/like`, {
        method: "DELETE",
        credentials: "include",
    });
    return parse<LikeStatusResponse>(res);
}

export async function toggleToolLike(
    toolId: number | string,
    liked: boolean
): Promise<LikeStatusResponse> {
    return liked ? unlikeTool(toolId) : likeTool(toolId);
}
