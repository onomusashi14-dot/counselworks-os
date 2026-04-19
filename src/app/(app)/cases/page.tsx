"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  EmptyRow,
  ErrorRow,
  LoadingRows,
  PageHeader,
  SectionCard,
  Tabs,
  statusTone,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import { casesApi } from "@/lib/modules";
import { caseDisplayName, updatedAt, type Case } from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

type Filter = "all" | "active" | "blocked" | "closed";

const BLOCKED = new Set(["blocked", "awaiting_client", "on_hold"]);
const CLOSED = new Set(["closed", "archived", "resolved"]);

function matchesFilter(c: Case, f: Filter): boolean {
  const s = (c.status || "").toLowerCase();
  if (f === "all") return true;
  if (f === "blocked") return BLOCKED.has(s);
  if (f === "closed") return CLOSED.has(s);
  return !BLOCKED.has(s) && !CLOSED.has(s);
}

function caseClient(c: Case): string {
  return c.clientName || c.client_name || "—";
}

function openRequests(c: Case): number {
  return c.openRequests ?? c.open_requests ?? 0;
}

function pendingDrafts(c: Case): number {
  return c.pendingDrafts ?? c.pending_drafts ?? 0;
}

export default function CasesPage() {
  const { session } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const token = session?.token ?? null;

  const initialFilter = (params.get("filter") as Filter) || "active";
  const [filter, setFilter] = useState<Filter>(
    ["all", "active", "blocked", "closed"].includes(initialFilter)
      ? initialFilter
      : "active"
  );
  const [q, setQ] = useState("");

  const { data, error, loading } = useAuthedQuery(casesApi.list, token, "firms/me/cases");

  useEffect(() => {
    const current = params.get("filter") || "active";
    if (filter === current) return;
    const next = new URLSearchParams(params.toString());
    if (filter === "active") next.delete("filter");
    else next.set("filter", filter);
    const qs = next.toString();
    router.replace(qs ? `/cases?${qs}` : "/cases", { scroll: false });
  }, [filter, params, router]);

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      all: list.length,
      active: list.filter((c) => matchesFilter(c, "active")).length,
      blocked: list.filter((c) => matchesFilter(c, "blocked")).length,
      closed: list.filter((c) => matchesFilter(c, "closed")).length,
    };
  }, [data]);

  const visible = useMemo(() => {
    const list = (data ?? []).filter((c) => matchesFilter(c, filter));
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) => {
      return (
        caseDisplayName(c).toLowerCase().includes(term) ||
        caseClient(c).toLowerCase().includes(term) ||
        (c.status || "").toLowerCase().includes(term)
      );
    });
  }, [data, filter, q]);

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Cases"
        subtitle="Every matter in the firm, filtered by status."
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "Active", count: counts.active },
            { value: "blocked", label: "Blocked", count: counts.blocked },
            { value: "closed", label: "Closed", count: counts.closed },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, client, status"
            className="input w-64 pl-9"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300"
            aria-hidden
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m20 20-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-5">
        <SectionCard title="Results" count={visible.length}>
          {loading && <LoadingRows rows={5} />}
          {error && <ErrorRow message={error} />}
          {!loading && !error && visible.length === 0 && (
            <EmptyRow
              message={
                (data?.length ?? 0) === 0
                  ? "No cases in this firm yet."
                  : "No cases match the current filter."
              }
            />
          )}
          {!loading && !error && visible.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-500 bg-ink-100/40">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">Case</th>
                    <th className="text-left font-medium px-5 py-2.5">
                      Client
                    </th>
                    <th className="text-left font-medium px-5 py-2.5">
                      Status
                    </th>
                    <th className="text-right font-medium px-5 py-2.5">
                      Open req.
                    </th>
                    <th className="text-right font-medium px-5 py-2.5">
                      Pending drafts
                    </th>
                    <th className="text-right font-medium px-5 py-2.5">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {visible.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-ink-100/40 cursor-pointer"
                      onClick={() => router.push(`/cases/${c.id}`)}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/cases/${c.id}`}
                          className="font-medium text-ink-900 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {caseDisplayName(c)}
                        </Link>
                        {c.blocker && (
                          <div className="text-xs text-status-risk mt-0.5 truncate max-w-[280px]">
                            ⚠ {c.blocker}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink-700 truncate max-w-[200px]">
                        {caseClient(c)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`badge ${statusTone(c.status)} capitalize`}
                        >
                          {humanStatus(c.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-ink-700">
                        {openRequests(c)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-ink-700">
                        {pendingDrafts(c)}
                      </td>
                      <td className="px-5 py-3 text-right text-ink-500 text-xs whitespace-nowrap">
                        {relativeTime(updatedAt(c))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
