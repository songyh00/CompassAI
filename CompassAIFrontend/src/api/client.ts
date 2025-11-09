export const API_BASE = "/api";

export async function postJSON<T>(url: string, data: unknown): Promise<T> {
    const res = await fetch(API_BASE + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Request failed");
    }

    return res.json() as Promise<T>;
}
