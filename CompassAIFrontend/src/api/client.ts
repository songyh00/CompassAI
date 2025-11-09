const API_BASE = "/api";

/** ---------------- 공통 유틸 ---------------- */
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
        credentials: "include", // 세션 쿠키 주고받기
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

/** ---------------- Auth API ---------------- */
export type LoginResp = { id: number; name: string; email: string };
export type Me = LoginResp | null;

// 전역 이벤트: 로그인 상태 변경 통지
function notifyAuthChanged() {
    window.dispatchEvent(new Event("auth:changed"));
}

export function login(payload: { email: string; password: string }) {
    return postJSON<LoginResp>("/auth/login", payload).then((r) => {
        notifyAuthChanged();
        return r;
    });
}

export function me() {
    return getJSON<Me>("/auth/me");
}

export function logout() {
    return postEmpty("/auth/logout").then(() => {
        notifyAuthChanged();
    });
}
