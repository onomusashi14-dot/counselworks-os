"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  EmptyRow,
  ErrorRow,
  LoadingRows,
  SectionCard,
  statusTone,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import {
  casesApi,
  draftsApi,
  notificationsApi,
  requestsApi,
} from "@/lib/modules";
import {
  caseDisplayName,
  draftDisplayTitle,
  requestDisplayTitle,
  updatedAt,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

const BLOCKED_STATUSES = new Set(["blocked", "awaiting_client", "on_hold"]);
const ACTIVE_STATUSES = new Set([
  "active",
  "in_review",
  "intake",
  "blocked",
  "awaiting_client",
  "assigned",
  "in_progress",
]);
const NEW_LEAD_STATUSES = new Set(["new", "triaged", "unassigned"]);

function Kpi({
  label,
  value,
  tone,
  href,
  sub,
}: {
  label: string;
  value: number | string;
  tone: "info" | "risk" | "warn" | "ok";
  href?: string;
  sub?: string;
}) {
  const toneMap = {
    info: "text-brand-700 bg-brand-50 border-brand-100",
    risk: "text-status-risk bg-red-50 border-red-100",
    warn: "text-status-warn bg-amber-50 border-amber-100",
    ok: "text-status-ok bg-emerald-50 border-emerald-100",
  } as const;
  const body = (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold text-ink-900 tabular-nums">
            {value}
          </div>
          {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
        </div>
        <span
          className={`rounded-lg border px-2 py-1 text-[11px] font-medium ${toneMap[tone]}`}
        >
          {tone.toUpperCase()}
        </span>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:-translate-y-0.5 transition">
      {body}
    </Link>
  ) : (
    body
  );
}

export default function DashboardPage() {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const isAttorney = session?.user.role === "attorney";

  const cases = useAuthedQuery(casesApi.list, token, "firms/me/cases");
  const requests = useAuthedQuery(requestsApi.list, token, "firms/me/requests");
  const drafts = useAuthedQuery(draftsApi.list, token, "firms/me/drafts");
  const notifs = useAuthedQuery(notificationsApi.list, token, "notifications");

  const { activeCases, blockedCases, statusBreakdown } = useMemo(() => {
    const list = cases.data ?? [];
    const active = list.filter((c) =>
      ACTIVE_STATUSES.has((c.status || "").toLowerCase())
    );
    const blocked = list.filter((c) =>
      BLOCKED_STATUSES.has((c.status || "").toLowerCase())
    );
    const breakdown = new Map<string, number>();
    for (const c of list) {
      const k = (c.status || "unknown").toLowerCase();
      breakdown.set(k, (breakdown.get(k) || 0) + 1);
    }
    return {
      activeCases: active,
      blockedCases: blocked,
      statusBreakdown: Array.from(breakdown.entries()).sort(
        (a, b) => b[1] - a[1]
      ),
    };
  }, [cases.data]);

  const newLeads = useMemo(() => {
    const list = requests.data ?? [];
    return list.filter((r) =>
      NEW_LEAD_STATUSES.has((r.status || "").toLowerCase())
    );
  }, [requests.data]);

  const pendingApprovals = useMemo(() => {
    const list = drafts.data ?? [];
    return list.filter(
      (d) => (d.status || "").toLowerCase() === "pending_approval"
    );
  }, [drafts.data]);

  const loading =
    cases.loading || requests.loading || drafts.loading || notifs.loading;

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">
            Welcome back{session?.user.name ? `, ${session.user.name}` : ""}.
          </h1>
          <p className="text-sm text-ink-500">
            {loading
              ? "Loading your firm overview…"
              : "Here's what needs your attention today."}
          </p>
        </div>
        <div className="text-xs text-ink-500">
          Signed in as{" "}
          <span className="font-medium text-ink-700">{session?.user.email}</span>{" "}
          ·{" "}
          <span
            className={`badge capitalize ${
              isAttorney
                ? "bg-brand-100 text-brand-700"
                : "bg-ink-100 text-ink-700"
            }`}
          >
            {session?.user.role}
          </span>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="New leads"
          value={requests.loading ? "—" : newLeads.length}
          tone="info"
          href="/requests"
          sub="Unhandled intake — route or assign"
        />
        <Kpi
          label="Active cases"
          value={cases.loading ? "—" : activeCases.length}
          tone="ok"
          href="/cases"
          sub={`${cases.data?.length ?? 0} total`}
        />
        <Kpi
          label="Blockers"
          value={cases.loading ? "—" : blockedCases.length}
          tone="risk"
          href="/cases?filter=blocked"
          sub="Cases awaiting action"
        />
        <Kpi
          label={isAttorney ? "Pending approvals" : "Awaiting attorney"}
          value={drafts.loading ? "—" : pendingApprovals.length}
          tone="warn"
          href="/documents?filter=pending_approval"
          sub={isAttorney ? "You sign off on these" : "Attorney review queue"}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-6">
          <SectionCard
            title="Blockers"
            count={blockedCases.length}
            action={
              <Link
                href="/cases?filter=blocked"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                View all
              </Link>
            }
          >
            {cases.loading && <LoadingRows />}
            {cases.error && <ErrorRow message={cases.error} />}
            {!cases.loading &&
              !cases.error &&
              blockedCases.length === 0 && (
                <EmptyRow message="No blockers. Every case is moving." />
              )}
            {blockedCases.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-ink-100/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink-900">
                    {caseDisplayName(c)}
                  </div>
                  <div className="truncate text-xs text-ink-500">
                    {c.blocker || "Case is blocked"} · updated{" "}
                    {relativeTime(updatedAt(c))}
                  </div>
                </div>
                <span className={`badge ${statusTone(c.status)} capitalize`}>
                  {humanStatus(c.status)}
                </span>
              </Link>
            ))}
          </SectionCard>

          <SectionCard
            title={
              isAttorney ? "Approvals awaiting you" : "Drafts awaiting attorney"
            }
            count={pendingApprovals.length}
            action={
              <Link
                href="/documents?filter=pending_approval"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Open queue
              </Link>
            }
          >
            {drafts.loading && <LoadingRows />}
            {drafts.error && <ErrorRow message={drafts.error} />}
            {!drafts.loading &&
              !drafts.error &&
              pendingApprovals.length === 0 && (
                <EmptyRow message="No drafts pending approval." />
              )}
            {pendingApprovals.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/documents/${d.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-ink-100/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink-900">
                    {draftDisplayTitle(d)}
                  </div>
                  <div className="truncate text-xs text-ink-500">
                    Updated {relativeTime(updatedAt(d))}
                    {!isAttorney ? " · awaiting attorney sign-off" : ""}
                  </div>
                </div>
                <span className={`badge ${statusTone("pending_approval")}`}>
                  {isAttorney ? "Review" : "Pending"}
                </span>
              </Link>
            ))}
          </SectionCard>

          <SectionCard
            title="New leads"
            count={newLeads.length}
            action={
              <Link
                href="/requests"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Go to intake
              </Link>
            }
          >
            {requests.loading && <LoadingRows />}
            {requests.error && <ErrorRow message={requests.error} />}
            {!requests.loading &&
              !requests.error &&
              newLeads.length === 0 && (
                <EmptyRow message="Inbox zero. No unhandled leads." />
              )}
            {newLeads.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-ink-100/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink-900">
                    {requestDisplayTitle(r)}
                  </div>
                  <div className="truncate text-xs text-ink-500">
                    {r.clientName || r.client_name || r.email || "New inquiry"}{" "}
                    · received {relativeTime(updatedAt(r))}
                  </div>
                </div>
                <span className={`badge ${statusTone(r.status)} capitalize`}>
                  {humanStatus(r.status)}
                </span>
              </Link>
            ))}
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Case status">
            {cases.loading && <LoadingRows rows={4} />}
            {cases.error && <ErrorRow message={cases.error} />}
            {!cases.loading &&
              !cases.error &&
              statusBreakdown.length === 0 && (
                <EmptyRow message="No cases yet." />
              )}
            {statusBreakdown.map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`badge ${statusTone(status)} capitalize`}>
                    {humanStatus(status)}
                  </span>
                </div>
                <span className="text-sm tabular-nums font-medium text-ink-900">
                  {count}
                </span>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Activity"
            action={
              <span className="text-xs text-ink-500">Latest notifications</span>
            }
          >
            {notifs.loading && <LoadingRows rows={4} />}
            {notifs.error && <ErrorRow message={notifs.error} />}
            {!notifs.loading &&
              !notifs.error &&
              (notifs.data?.length ?? 0) === 0 && (
                <EmptyRow message="Quiet so far today." />
              )}
            {(notifs.data ?? []).slice(0, 6).map((n) => (
              <div key={n.id} className="px-5 py-3">
                <div className="text-sm text-ink-900">
                  {n.title || n.message || n.body || humanStatus(n.kind || n.type)}
                </div>
                <div className="text-xs text-ink-500">
                  {relativeTime(n.createdAt || n.created_at)}
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
