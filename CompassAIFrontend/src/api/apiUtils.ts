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
