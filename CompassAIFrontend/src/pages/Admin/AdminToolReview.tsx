// src/pages/AdminToolReview.tsx
import { useEffect, useMemo, useState } from "react";
import s from "./AdminToolReview.module.css";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type ToolApplication = {
    id: number;

    // 신청 폼 정보 (ai_tool_application)
    name: string;
    subTitle?: string | null;
    origin?: string | null;
    url?: string | null;
    logo?: string | null;
    description?: string | null;

    // 상태 / 메타데이터
    status: ApplicationStatus;
    appliedAt: string;           // applied_at
    processedAt?: string | null; // processed_at
    rejectReason?: string | null;

    // 신청자 (users)
    applicant: {
        id: number;
        name: string;
        email: string;
    };

    // 신청 시 선택한 카테고리 (category.name)
    categories: string[];
};

const STATUS_TABS: { key: ApplicationStatus | "ALL"; label: string }[] = [
    { key: "PENDING", label: "대기" },
    { key: "APPROVED", label: "승인됨" },
    { key: "REJECTED", label: "거절됨" },
    { key: "ALL", label: "전체" },
];

export default function AdminToolReview() {
    const [apps, setApps] = useState<ToolApplication[]>([]);
    const [statusTab, setStatusTab] = useState<ApplicationStatus | "ALL">("PENDING");
    const [search, setSearch] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

   useEffect(() => {
       const fetchApps = async () => {
           setLoading(true);
           setError(null);
           try {
               const res = await fetch("/api/admin/ai-applications", {
                   credentials: "include",
               });
               const text = await res.text();
               if (!res.ok) {
                   throw new Error(text || "AI 등록 신청 목록을 불러오지 못했습니다.");
               }
               const data: ToolApplication[] = text ? JSON.parse(text) : [];
               setApps(data);
           } catch (err) {
               console.error(err);
               setError(
                   err instanceof Error
                       ? err.message
                       : "AI 등록 신청 목록을 불러오지 못했습니다."
               );
           } finally {
               setLoading(false);
           }
       };

       fetchApps();
   }, []);


    // 상태/검색 필터
    const filtered = useMemo(() => {
        let list = apps;
        if (statusTab !== "ALL") {
            list = list.filter((a) => a.status === statusTab);
        }
        if (search.trim()) {
            const kw = search.trim().toLowerCase();
            list = list.filter(
                (a) =>
                    a.name.toLowerCase().includes(kw) ||
                    (a.subTitle && a.subTitle.toLowerCase().includes(kw)) ||
                    a.applicant.name.toLowerCase().includes(kw) ||
                    a.applicant.email.toLowerCase().includes(kw)
            );
        }
        return list;
    }, [apps, statusTab, search]);

    // 승인/거절 처리
    const updateStatus = async (appId: number, nextStatus: ApplicationStatus) => {
        setError(null);
        setInfo(null);

        // 거절 시 간단한 거절 사유 입력 (임시 구현)
        let rejectReason: string | undefined;
        if (nextStatus === "REJECTED") {
            const msg = window.prompt("거절 사유를 입력해 주세요. (필수는 아님)");
            rejectReason = msg || undefined;
        }

        setBusyId(appId);

        const prev = apps;
        // 낙관적 업데이트
        setApps((curr) =>
            curr.map((a) =>
                a.id === appId
                    ? {
                          ...a,
                          status: nextStatus,
                          processedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                          rejectReason:
                              nextStatus === "REJECTED"
                                  ? rejectReason || "관리자에 의해 거절되었습니다."
                                  : null,
                      }
                    : a
            )
        );

        try {
            // 🔥 실제 API 호출
            const res = await fetch(`/api/admin/ai-applications/${appId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    status: nextStatus,
                    rejectReason,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "상태 변경에 실패했습니다.");
            }

            setInfo(
                nextStatus === "APPROVED"
                    ? "승인 처리되었습니다."
                    : "거절 처리되었습니다."
            );
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "상태 변경에 실패했습니다. 다시 시도해 주세요."
            );
            setApps(prev); // 실패 시 롤백
        } finally {
            setBusyId(null);
        }
    };


    return (
        <div className={s.wrap}>
            <div className={s.head}>
                <h1 className={s.title}>AI 등록 검수</h1>
                <p className={s.sub}>
                    개발자가 신청한 AI 도구를 한눈에 보고, 승인 또는 거절을 처리하는 관리자 전용 화면입니다.
                </p>

                <div className={s.search}>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="툴 이름, 신청자 이름/이메일로 검색"
                    />
                </div>

                <div className={s.tabs}>
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t.key}
                            className={statusTab === t.key ? s.tabActive : ""}
                            onClick={() => setStatusTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className={s.error}>{error}</div>}
            {info && <div className={s.notice}>{info}</div>}

            <section className={s.section}>
                {loading ? (
                    <div className={s.notice}>신청 목록을 불러오는 중입니다...</div>
                ) : (
                    <ul className={s.list}>
                        {filtered.map((app) => (
                            <ApplicationItem
                                key={app.id}
                                app={app}
                                open={openId === app.id}
                                onToggle={() => setOpenId(openId === app.id ? null : app.id)}
                                onApprove={() => updateStatus(app.id, "APPROVED")}
                                onReject={() => updateStatus(app.id, "REJECTED")}
                                busy={busyId === app.id}
                            />
                        ))}

                        {filtered.length === 0 && (
                            <li className={s.item} style={{ padding: 14, textAlign: "center" }}>
                                해당 조건에 맞는 신청 내역이 없습니다.
                            </li>
                        )}
                    </ul>
                )}
            </section>
        </div>
    );
}

type ApplicationItemProps = {
    app: ToolApplication;
    open: boolean;
    onToggle: () => void;
    onApprove: () => void;
    onReject: () => void;
    busy: boolean;
};

function ApplicationItem({
    app,
    open,
    onToggle,
    onApprove,
    onReject,
    busy,
}: ApplicationItemProps) {
    const statusClass =
        app.status === "PENDING"
            ? s.statusPending
            : app.status === "APPROVED"
            ? s.statusApproved
            : s.statusRejected;

    const statusLabel =
        app.status === "PENDING"
            ? "대기"
            : app.status === "APPROVED"
            ? "승인됨"
            : "거절됨";

    return (
        <li className={`${s.item} ${open ? s.itemOpen : ""}`}>
            <button
                className={`${s.rowBtn} ${open ? s.rowBtnOpen : ""}`}
                onClick={onToggle}
                aria-expanded={open}
            >
                <div>
                    <div>{app.name}</div>
                    {app.subTitle && (
                        <div style={{ marginTop: 4, fontSize: 13, color: "#4b5563" }}>
                            {app.subTitle}
                        </div>
                    )}
                    <div className={s.meta}>
                        <span className={`${s.badge} ${statusClass}`}>{statusLabel}</span>
                        {app.origin && <span className={s.badge}>{app.origin}</span>}
                        <span className={s.badge}>신청자: {app.applicant.name}</span>
                        <span className={s.badge}>{app.applicant.email}</span>
                        <span className={s.badge}>신청일: {app.appliedAt}</span>
                    </div>
                </div>
                <div className={s.rowRight}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {open ? "접기" : "자세히"}
                    </span>
                    <i className={s.toggleIcon}>{open ? "–" : "+"}</i>
                </div>
            </button>

            {open && (
                <div className={s.body}>
                    {app.url && (
                        <div className={s.bodyRow}>
                            <strong>URL</strong>
                            <a href={app.url} target="_blank" rel="noreferrer">
                                {app.url}
                            </a>
                        </div>
                    )}

                    <div className={s.bodyRow}>
                        <strong>신청자</strong>
                        <span>
                            {app.applicant.name} ({app.applicant.email})
                        </span>
                    </div>

                    {app.categories.length > 0 && (
                        <div className={s.bodyRow}>
                            <strong>카테고리</strong>
                            <span>
                                {app.categories.map((c) => (
                                    <span key={c} className={s.badge} style={{ marginRight: 4 }}>
                                        {c}
                                    </span>
                                ))}
                            </span>
                        </div>
                    )}

                    {app.processedAt && (
                        <div className={s.bodyRow}>
                            <strong>처리일시</strong>
                            <span>{app.processedAt}</span>
                        </div>
                    )}

                    {app.status === "REJECTED" && app.rejectReason && (
                        <div className={s.bodyRow}>
                            <strong>거절 사유</strong>
                            <span>{app.rejectReason}</span>
                        </div>
                    )}

                    {app.description && (
                        <div className={s.desc}>
                            <strong>설명</strong>
                            <div>{app.description}</div>
                        </div>
                    )}

                    <div className={s.actions}>
                        {app.status === "PENDING" ? (
                            <>
                                <button
                                    type="button"
                                    className={`${s.btn} ${s.btnApprove} ${
                                        busy ? s.btnDisabled : ""
                                    }`}
                                    onClick={onApprove}
                                    disabled={busy}
                                >
                                    승인
                                </button>
                                <button
                                    type="button"
                                    className={`${s.btn} ${s.btnReject} ${
                                        busy ? s.btnDisabled : ""
                                    }`}
                                    onClick={onReject}
                                    disabled={busy}
                                >
                                    거절
                                </button>
                            </>
                        ) : (
                            <span style={{ fontSize: 12, color: "#6b7280" }}>
                                이미 {statusLabel} 처리된 신청입니다.
                            </span>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
}
