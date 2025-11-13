// src/api/client.ts
import { getJSON, postJSON, postEmpty } from "./apiUtils";

export type Role = "USER" | "ADMIN";

export type Me = {
    id: number;
    name: string;
    email: string;
    role: Role;
};

export type LoginResp = Me;

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
