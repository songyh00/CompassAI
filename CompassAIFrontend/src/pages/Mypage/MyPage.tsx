// src/pages/Mypage/MyPage.tsx
import { useEffect, useState } from "react";
import { me } from "@/api/client";
import type { Me } from "@/api/client";
import { postJSON } from "@/api/apiUtils";
import s from "./MyPage.module.css";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type MyToolApplication = {
    id: number;
    name: string;
    subTitle?: string | null;
    origin?: string | null;
    url?: string | null;
    logo?: string | null;
    status: ApplicationStatus;
    appliedAt: string;
    processedAt?: string | null;
    rejectReason?: string | null;
    categories?: string[];
};

type ProfileErrors = {
    name?: string;
    email?: string;
    root?: string;
};

type PasswordErrors = {
    currentPassword?: string;
    newPassword?: string;
    confirm?: string;
    root?: string;
};

function getErrorMessage(e: unknown, fallback: string) {
    if (e instanceof Error && e.message) return e.message;
    return fallback;
}

export default function MyPage() {
    const [user, setUser] = useState<Me | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profileErr, setProfileErr] = useState<ProfileErrors>({});
    const [profileOk, setProfileOk] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdErr, setPwdErr] = useState<PasswordErrors>({});
    const [pwdOk, setPwdOk] = useState("");

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);

    const [apps, setApps] = useState<MyToolApplication[]>([]);
    const [appsLoading, setAppsLoading] = useState(false);
    const [appsError, setAppsError] = useState<string | null>(null);

    // 현재 로그인 유저 불러오기
    useEffect(() => {
        const load = async () => {
            try {
                const u = await me();
                if (u) {
                    setUser(u);
                    setName(u.name);
                    setEmail(u.email);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setProfileLoading(false);
            }
        };
        load();
    }, []);

    // 내가 신청한 AI 목록
    useEffect(() => {
        const fetchApps = async () => {
            setAppsLoading(true);
            setAppsError(null);
            try {
               const res = await fetch("/api/tools/applications/my-applications", {
                   credentials: "include",
               });
                const text = await res.text();
                if (!res.ok) {
                    throw new Error(
                        text || "신청 목록을 불러오지 못했습니다."
                    );
                }
                const data: MyToolApplication[] = text ? JSON.parse(text) : [];
                setApps(data);
            } catch (e) {
                console.error(e);
                setAppsError(
                    getErrorMessage(e, "신청 목록을 불러오지 못했습니다.")
                );
            } finally {
                setAppsLoading(false);
            }
        };

        fetchApps();
    }, []);

    if (profileLoading) {
        return (
            <div className={s.wrap}>
                <div className={s.centerNotice}>내 정보를 불러오는 중입니다...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={s.wrap}>
                <div className={s.centerNotice}>
                    로그인 후 이용할 수 있는 페이지입니다.
                </div>
            </div>
        );
    }

    // 회원정보 수정 검증
    const validateProfile = () => {
        const next: ProfileErrors = {};
        if (!name.trim()) next.name = "이름을 입력해 주세요.";
        if (!email.trim()) next.email = "이메일을 입력해 주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "이메일 형식이 올바르지 않습니다.";
        setProfileErr(next);
        return Object.keys(next).length === 0;
    };

    // 회원정보 저장
    const onSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateProfile()) return;

        setSavingProfile(true);
        setProfileErr({});
        setProfileOk("");
        try {
            // postJSON("/auth/...") → 실제로는 /api/auth/... 로 호출됨
            const updated = await postJSON("/auth/me", { name, email });
            setProfileOk("회원정보가 수정되었습니다.");
            setUser((prev) =>
                prev
                    ? {
                          ...prev,
                          name: updated.name ?? name,
                          email: updated.email ?? email,
                      }
                    : prev
            );
            window.dispatchEvent(new Event("auth:changed"));
        } catch (e: unknown) {
            const msg = getErrorMessage(
                e,
                "회원정보 수정에 실패했습니다."
            );
            setProfileErr({ root: msg });
        } finally {
            setSavingProfile(false);
        }
    };

    // 비밀번호 변경 검증
    const validatePassword = () => {
        const next: PasswordErrors = {};
        if (!currentPassword)
            next.currentPassword = "현재 비밀번호를 입력해 주세요.";
        if (!newPassword) next.newPassword = "새 비밀번호를 입력해 주세요.";
        else if (newPassword.length < 8)
            next.newPassword = "비밀번호는 8자 이상이어야 합니다.";
        if (!confirmPassword)
            next.confirm = "비밀번호 확인을 입력해 주세요.";
        else if (newPassword !== confirmPassword)
            next.confirm = "비밀번호가 일치하지 않습니다.";
        setPwdErr(next);
        return Object.keys(next).length === 0;
    };

    // 비밀번호 변경
    const onChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setSavingPwd(true);
        setPwdErr({});
        setPwdOk("");
        try {
            await postJSON("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            setPwdOk("비밀번호가 변경되었습니다.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: unknown) {
            const msg = getErrorMessage(
                e,
                "비밀번호 변경에 실패했습니다."
            );
            setPwdErr({ root: msg });
        } finally {
            setSavingPwd(false);
        }
    };

    return (
        <div className={s.wrap}>
            <div className={s.inner}>
                {/* 회원정보 수정 */}
                <section className={s.card}>
                    <h1 className={s.title}>마이페이지</h1>
                    <p className={s.sub}>
                        가입 정보를 확인하고 수정할 수 있습니다.
                    </p>

                    <form className={s.form} onSubmit={onSaveProfile} noValidate>
                        {profileErr.root && (
                            <div className={s.alert}>{profileErr.root}</div>
                        )}
                        {profileOk && (
                            <div className={s.notice}>{profileOk}</div>
                        )}

                        <div className={s.field}>
                            <label className={s.label}>이름</label>
                            <input
                                className={`${s.input} ${
                                    profileErr.name ? s.invalid : ""
                                }`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {profileErr.name && (
                                <span className={s.error}>
                                    {profileErr.name}
                                </span>
                            )}
                        </div>

                        <div className={s.field}>
                            <label className={s.label}>이메일</label>
                            <input
                                type="email"
                                className={`${s.input} ${
                                    profileErr.email ? s.invalid : ""
                                }`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {profileErr.email && (
                                <span className={s.error}>
                                    {profileErr.email}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={s.primaryBtn}
                            disabled={savingProfile}
                        >
                            {savingProfile ? "저장 중..." : "회원정보 저장"}
                        </button>
                    </form>
                </section>

                {/* 비밀번호 변경 */}
                <section className={s.card}>
                    <h2 className={s.sectionTitle}>비밀번호 변경</h2>
                    <form
                        className={s.form}
                        onSubmit={onChangePassword}
                        noValidate
                    >
                        {pwdErr.root && (
                            <div className={s.alert}>{pwdErr.root}</div>
                        )}
                        {pwdOk && <div className={s.notice}>{pwdOk}</div>}

                        <div className={s.field}>
                            <label className={s.label}>현재 비밀번호</label>
                            <input
                                type="password"
                                className={`${s.input} ${
                                    pwdErr.currentPassword ? s.invalid : ""
                                }`}
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                            />
                            {pwdErr.currentPassword && (
                                <span className={s.error}>
                                    {pwdErr.currentPassword}
                                </span>
                            )}
                        </div>

                        <div className={s.field}>
                            <label className={s.label}>새 비밀번호</label>
                            <input
                                type="password"
                                className={`${s.input} ${
                                    pwdErr.newPassword ? s.invalid : ""
                                }`}
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                            />
                            {pwdErr.newPassword && (
                                <span className={s.error}>
                                    {pwdErr.newPassword}
                                </span>
                            )}
                        </div>

                        <div className={s.field}>
                            <label className={s.label}>새 비밀번호 확인</label>
                            <input
                                type="password"
                                className={`${s.input} ${
                                    pwdErr.confirm ? s.invalid : ""
                                }`}
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />
                            {pwdErr.confirm && (
                                <span className={s.error}>
                                    {pwdErr.confirm}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={s.secondaryBtn}
                            disabled={savingPwd}
                        >
                            {savingPwd ? "변경 중..." : "비밀번호 변경"}
                        </button>
                    </form>
                </section>

                {/* 내가 신청한 AI 목록 */}
                <section className={s.card}>
                    <h2 className={s.sectionTitle}>내 AI 검수 신청</h2>
                    <p className={s.sectionSub}>
                        내가 등록 요청한 AI 도구들의 검수 상태를 확인할 수 있습니다.
                    </p>

                    {appsError && (
                        <div className={s.alert}>{appsError}</div>
                    )}

                    {appsLoading ? (
                        <div className={s.centerNotice}>
                            신청 목록을 불러오는 중입니다...
                        </div>
                    ) : apps.length === 0 ? (
                        <div className={s.centerNotice}>
                            아직 검수 신청한 AI 도구가 없습니다.
                        </div>
                    ) : (
                        <ul className={s.appList}>
                            {apps.map((app) => (
                                <li key={app.id} className={s.appItem}>
                                    <div className={s.appHeader}>
                                        <div className={s.appTitleBox}>
                                            <div className={s.appName}>
                                                {app.name}
                                            </div>
                                            {app.subTitle && (
                                                <div className={s.appSubTitle}>
                                                    {app.subTitle}
                                                </div>
                                            )}
                                        </div>
                                        <div className={s.appBadges}>
                                            <StatusBadge status={app.status} />
                                            {app.origin && (
                                                <span className={s.badge}>
                                                    {app.origin}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={s.appMeta}>
                                        <span>신청일: {app.appliedAt}</span>
                                        {app.processedAt && (
                                            <span>처리일: {app.processedAt}</span>
                                        )}
                                    </div>

                                    {app.url && (
                                        <div className={s.appRow}>
                                            <span className={s.appLabel}>
                                                URL
                                            </span>
                                            <a
                                                href={app.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={s.appLink}
                                            >
                                                {app.url}
                                            </a>
                                        </div>
                                    )}

                                    {app.status === "REJECTED" &&
                                        app.rejectReason && (
                                            <div className={s.appRow}>
                                                <span className={s.appLabel}>
                                                    거절 사유
                                                </span>
                                                <span className={s.appValue}>
                                                    {app.rejectReason}
                                                </span>
                                            </div>
                                        )}

                                    {app.categories &&
                                        app.categories.length > 0 && (
                                            <div className={s.appRow}>
                                                <span className={s.appLabel}>
                                                    카테고리
                                                </span>
                                                <span className={s.appValue}>
                                                    {app.categories.map((c) => (
                                                        <span
                                                            key={c}
                                                            className={s.badge}
                                                        >
                                                            {c}
                                                        </span>
                                                    ))}
                                                </span>
                                            </div>
                                        )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
    let label = "";
    let cls = "";
    if (status === "PENDING") {
        label = "대기";
        cls = s.statusPending;
    } else if (status === "APPROVED") {
        label = "승인됨";
        cls = s.statusApproved;
    } else {
        label = "거절됨";
        cls = s.statusRejected;
    }
    return <span className={`${s.badge} ${cls}`}>{label}</span>;
}
