"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  EmptyRow,
  ErrorRow,
  LoadingRows,
  PageHeader,
  SectionCard,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import {
  casesApi,
  draftsApi,
  leadsApi,
  notificationsApi,
  requestsApi,
} from "@/lib/modules";
import type {
  Case,
  ClientRequest,
  Draft,
  Lead,
  Notification,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

/* ── helpers ─────────────────────────────────────────────────── */

function createdThisMonth(item: { createdAt?: string; created_at?: string }): boolean {
  const raw = item.createdAt ?? item.created_at;
  if (!raw) return false;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

type Tone = "info" | "risk" | "warn" | "ok";

const TONE_MAP: Record<Tone, string> = {
  info: "text-brand-700 bg-brand-50 border-brand-100",
  risk: "text-status-risk bg-red-50 border-red-100",
  warn: "text-status-warn bg-amber-50 border-amber-100",
  ok: "text-status-ok bg-emerald-50 border-emerald-100",
};

/* ── KPI card (same pattern as dashboard) ────────────────────── */

function Kpi({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: number | string;
  tone: Tone;
  sub?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {label}
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tabular-nums">
            {value}
          </div>
          {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
        </div>
        <span
          className={`rounded-lg border px-2 py-1 text-[11px] font-medium ${TONE_MAP[tone]}`}
        >
          {tone.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

/* ── horizontal bar component ────────────────────────────────── */

function HBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="w-28 shrink-0 text-sm text-ink-700 capitalize">
        {humanStatus(label)}
      </span>
      <div className="flex-1 h-5 bg-ink-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className="w-16 text-right text-sm tabular-nums font-medium text-ink-900">
        {count} / {total}
      </span>
    </div>
  );
}

/* ── pipeline stage card ─────────────────────────────────────── */

function PipelineStage({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-semibold text-ink-900 tabular-nums">
        {count}
      </div>
      <div className="mt-1 text-xs font-medium text-ink-700 capitalize">
        {humanStatus(label)}
      </div>
      <div className="mt-1 text-[11px] text-ink-500 tabular-nums">{pct}%</div>
    </div>
  );
}

/* ── notification icon ───────────────────────────────────────── */

function NotifIcon({ kind }: { kind: string }) {
  const k = kind.toLowerCase();
  if (k.includes("request"))
    return (
      <div className="h-8 w-8 shrink-0 rounded-full bg-brand-50 grid place-items-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-600" aria-hidden>
          <path d="M4 5h16v11H7l-3 3zM8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  if (k.includes("draft") || k.includes("document"))
    return (
      <div className="h-8 w-8 shrink-0 rounded-full bg-amber-50 grid place-items-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-amber-600" aria-hidden>
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  if (k.includes("case"))
    return (
      <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 grid place-items-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden>
          <path d="M4 7h16v12H4zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-ink-100 grid place-items-center">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-ink-500" aria-hidden>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ── error section with retry ────────────────────────────────── */

function ErrorSection({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="px-5 py-6 text-center">
      <div className="text-sm text-status-risk">{message}</div>
      <button
        onClick={onRetry}
        className="mt-2 text-xs font-medium text-brand-700 hover:underline"
      >
        Retry
      </button>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────── */

export default function ReportsPage() {
  const { session } = useAuth();
  const token = session?.token ?? null;

  const casesQ = useAuthedQuery(casesApi.list, token, "firms/me/cases");
  const requestsQ = useAuthedQuery(requestsApi.list, token, "firms/me/requests");
  const draftsQ = useAuthedQuery(draftsApi.list, token, "firms/me/drafts");
  const leadsQ = useAuthedQuery(leadsApi.list, token, "firms/me/leads");
  const notifsQ = useAuthedQuery(notificationsApi.list, token, "notifications");

  /* ── Section 1: KPI metrics ─────────────────────────────── */

  const kpis = useMemo(() => {
    const cases: Case[] = casesQ.data ?? [];
    const requests: ClientRequest[] = requestsQ.data ?? [];
    const drafts: Draft[] = draftsQ.data ?? [];
    const leads: Lead[] = leadsQ.data ?? [];

    const activeCases = cases.filter(
      (c) => (c.status || "").toLowerCase() === "active"
    ).length;
    const closedCases = cases.filter(
      (c) => (c.status || "").toLowerCase() === "closed"
    ).length;
    const onHoldCases = cases.filter((c) => {
      const s = (c.status || "").toLowerCase();
      return s === "on_hold" || s === "blocked" || s === "awaiting_client";
    }).length;

    const openRequests = requests.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return s === "open" || s === "in_progress" || s === "new" || s === "pending_attorney";
    }).length;

    const leadsThisMonth = leads.filter(createdThisMonth).length;

    const draftsInProgress = drafts.filter((d) => {
      const s = (d.status || "").toLowerCase();
      return s === "draft" || s === "drafted" || s === "in_review";
    }).length;
    const awaitingApproval = drafts.filter(
      (d) => (d.status || "").toLowerCase() === "pending_approval"
    ).length;

    return {
      totalCases: cases.length,
      activeCases,
      closedCases,
      onHoldCases,
      openRequests,
      totalRequests: requests.length,
      leadsThisMonth,
      totalLeads: leads.length,
      draftsInProgress,
      awaitingApproval,
    };
  }, [casesQ.data, requestsQ.data, draftsQ.data, leadsQ.data]);

  /* ── Section 2: Case status breakdown ───────────────────── */

  const caseBreakdown = useMemo(() => {
    const cases: Case[] = casesQ.data ?? [];
    const total = cases.length;
    const buckets: { key: string; count: number; color: string }[] = [
      {
        key: "active",
        count: cases.filter((c) => (c.status || "").toLowerCase() === "active").length,
        color: "bg-emerald-500",
      },
      {
        key: "on_hold",
        count: cases.filter((c) => {
          const s = (c.status || "").toLowerCase();
          return s === "on_hold" || s === "blocked" || s === "awaiting_client";
        }).length,
        color: "bg-red-500",
      },
      {
        key: "closed",
        count: cases.filter((c) => (c.status || "").toLowerCase() === "closed").length,
        color: "bg-ink-400",
      },
    ];
    return { total, buckets };
  }, [casesQ.data]);

  /* ── Section 3: Request pipeline ────────────────────────── */

  const requestPipeline = useMemo(() => {
    const requests: ClientRequest[] = requestsQ.data ?? [];
    const total = requests.length;
    const stages = [
      { key: "open", count: 0 },
      { key: "in_progress", count: 0 },
      { key: "completed", count: 0 },
      { key: "closed", count: 0 },
    ];
    for (const r of requests) {
      const s = (r.status || "").toLowerCase();
      if (s === "open" || s === "new" || s === "pending_attorney") stages[0].count++;
      else if (s === "in_progress" || s === "assigned" || s === "triaged") stages[1].count++;
      else if (s === "completed" || s === "delivered") stages[2].count++;
      else if (s === "closed") stages[3].count++;
      else stages[0].count++; // default to open
    }
    return { total, stages };
  }, [requestsQ.data]);

  /* ── Section 5: Lead pipeline ───────────────────────────── */

  const leadPipeline = useMemo(() => {
    const leads: Lead[] = leadsQ.data ?? [];
    const total = leads.length;
    const buckets: { key: string; count: number; color: string }[] = [
      {
        key: "open",
        count: leads.filter((l) => {
          const s = (l.status || "").toLowerCase();
          return s === "open" || s === "new";
        }).length,
        color: "bg-blue-500",
      },
      {
        key: "in_progress",
        count: leads.filter(
          (l) => (l.status || "").toLowerCase() === "in_progress"
        ).length,
        color: "bg-amber-500",
      },
      {
        key: "completed",
        count: leads.filter(
          (l) => (l.status || "").toLowerCase() === "completed"
        ).length,
        color: "bg-emerald-500",
      },
      {
        key: "closed",
        count: leads.filter(
          (l) => (l.status || "").toLowerCase() === "closed"
        ).length,
        color: "bg-ink-400",
      },
    ];
    return { total, buckets };
  }, [leadsQ.data]);

  const loading =
    casesQ.loading ||
    requestsQ.loading ||
    draftsQ.loading ||
    leadsQ.loading ||
    notifsQ.loading;

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader title="Reports" subtitle="Firm performance at a glance." />

      {/* ── Section 1: KPI Summary ──────────────────────────── */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {casesQ.loading ? (
          <div className="card p-5 animate-pulse">
            <div className="h-3 w-20 bg-ink-100 rounded" />
            <div className="mt-3 h-7 w-12 bg-ink-100 rounded" />
          </div>
        ) : (
          <Kpi
            label="Total Cases"
            value={kpis.totalCases}
            tone={kpis.activeCases > 0 ? "ok" : "info"}
            sub={`${kpis.activeCases} active · ${kpis.closedCases} closed · ${kpis.onHoldCases} on hold`}
          />
        )}
        {requestsQ.loading ? (
          <div className="card p-5 animate-pulse">
            <div className="h-3 w-20 bg-ink-100 rounded" />
            <div className="mt-3 h-7 w-12 bg-ink-100 rounded" />
          </div>
        ) : (
          <Kpi
            label="Open Requests"
            value={kpis.openRequests}
            tone={kpis.openRequests > 5 ? "warn" : "ok"}
            sub={`${kpis.totalRequests} total requests`}
          />
        )}
        {leadsQ.loading ? (
          <div className="card p-5 animate-pulse">
            <div className="h-3 w-20 bg-ink-100 rounded" />
            <div className="mt-3 h-7 w-12 bg-ink-100 rounded" />
          </div>
        ) : (
          <Kpi
            label="Leads This Month"
            value={kpis.leadsThisMonth}
            tone="info"
            sub={`${kpis.totalLeads} total leads`}
          />
        )}
        {draftsQ.loading ? (
          <div className="card p-5 animate-pulse">
            <div className="h-3 w-20 bg-ink-100 rounded" />
            <div className="mt-3 h-7 w-12 bg-ink-100 rounded" />
          </div>
        ) : (
          <Kpi
            label="Drafts In Progress"
            value={kpis.draftsInProgress}
            tone={kpis.awaitingApproval > 0 ? "warn" : "ok"}
            sub={`${kpis.awaitingApproval} awaiting attorney approval`}
          />
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Section 2: Case Status Breakdown ────────────── */}
        <SectionCard title="Cases by Status" count={caseBreakdown.total}>
          {casesQ.loading && <LoadingRows rows={3} />}
          {casesQ.error && (
            <ErrorSection
              message={casesQ.error}
              onRetry={casesQ.reload}
            />
          )}
          {!casesQ.loading && !casesQ.error && caseBreakdown.total === 0 && (
            <EmptyRow message="No cases yet." />
          )}
          {!casesQ.loading &&
            !casesQ.error &&
            caseBreakdown.buckets.map((b) => (
              <HBar
                key={b.key}
                label={b.key}
                count={b.count}
                total={caseBreakdown.total}
                color={b.color}
              />
            ))}
        </SectionCard>

        {/* ── Section 5: Lead Pipeline ────────────────────── */}
        <SectionCard title="Lead Pipeline" count={leadPipeline.total}>
          {leadsQ.loading && <LoadingRows rows={4} />}
          {leadsQ.error && (
            <ErrorSection
              message={leadsQ.error}
              onRetry={leadsQ.reload}
            />
          )}
          {!leadsQ.loading && !leadsQ.error && leadPipeline.total === 0 && (
            <EmptyRow message="No leads yet." />
          )}
          {!leadsQ.loading &&
            !leadsQ.error &&
            leadPipeline.buckets.map((b) => (
              <HBar
                key={b.key}
                label={b.key}
                count={b.count}
                total={leadPipeline.total}
                color={b.color}
              />
            ))}
        </SectionCard>
      </section>

      {/* ── Section 3: Request Pipeline ───────────────────── */}
      <section className="mt-6">
        <SectionCard title="Request Pipeline" count={requestPipeline.total}>
          {requestsQ.loading && <LoadingRows rows={2} />}
          {requestsQ.error && (
            <ErrorSection
              message={requestsQ.error}
              onRetry={requestsQ.reload}
            />
          )}
          {!requestsQ.loading && !requestsQ.error && (
            <div className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {requestPipeline.stages.map((stage, i) => (
                  <div key={stage.key} className="flex items-center gap-2">
                    <PipelineStage
                      label={stage.key}
                      count={stage.count}
                      total={requestPipeline.total}
                    />
                    {i < requestPipeline.stages.length - 1 && (
                      <span className="hidden lg:block text-ink-300 text-lg font-light">
                        {"→"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </section>

      {/* ── Section 4: Recent Activity Feed ───────────────── */}
      <section className="mt-6">
        <SectionCard
          title="Recent Activity"
          action={
            <span className="text-xs text-ink-500">Latest notifications</span>
          }
        >
          {notifsQ.loading && <LoadingRows rows={4} />}
          {notifsQ.error && (
            <ErrorSection
              message={notifsQ.error}
              onRetry={notifsQ.reload}
            />
          )}
          {!notifsQ.loading &&
            !notifsQ.error &&
            (notifsQ.data?.length ?? 0) === 0 && (
              <EmptyRow message="No recent activity." />
            )}
          {!notifsQ.loading &&
            !notifsQ.error &&
            (notifsQ.data ?? []).slice(0, 10).map((n: Notification) => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-5 py-3"
              >
                <NotifIcon kind={n.type || n.kind || ""} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink-900">
                    {n.title || n.message || n.body || humanStatus(n.kind || n.type)}
                  </div>
                  <div className="text-xs text-ink-500">
                    {relativeTime(n.createdAt || n.created_at)}
                  </div>
                </div>
              </div>
            ))}
        </SectionCard>
      </section>
    </div>
  );
}
