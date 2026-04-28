"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { leadsApi } from "@/lib/modules";
import { leadDisplayTitle, updatedAt, type Lead } from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

type Filter = "open" | "in_progress" | "completed" | "closed" | "all";

function matchesFilter(s: string | undefined, f: Filter): boolean {
  const status = (s || "").toLowerCase();
  if (f === "all") return true;
  return status === f;
}

export default function LeadsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const token = session?.token ?? null;

  const initial = params.get("filter") as Filter | null;
  const FILTERS: Filter[] = ["open", "in_progress", "completed", "closed", "all"];
  const [filter, setFilter] = useState<Filter>(
    initial && FILTERS.includes(initial) ? initial : "open"
  );
  const [q, setQ] = useState("");

  const { data, error, loading } = useAuthedQuery(leadsApi.list, token, "firms/me/leads");

  useEffect(() => {
    const current = params.get("filter");
    if (filter !== current) {
      const next = new URLSearchParams(params.toString());
      if (filter === "open") next.delete("filter");
      else next.set("filter", filter);
      const qs = next.toString();
      router.replace(qs ? `/leads?${qs}` : "/leads", { scroll: false });
    }
  }, [filter, params, router]);

  const counts = useMemo(() => {
    const list = data ?? [];
    return FILTERS.reduce(
      (acc, f) => ({
        ...acc,
        [f]: list.filter((l) => matchesFilter(l.status, f)).length,
      }),
      {} as Record<Filter, number>
    );
  }, [data]);

  const visible = useMemo(() => {
    const list = (data ?? []).filter((l) => matchesFilter(l.status, filter));
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((l) => {
      return (
        leadDisplayTitle(l).toLowerCase().includes(term) ||
        (l.clientName || l.client_name || "").toLowerCase().includes(term) ||
        (l.email || "").toLowerCase().includes(term) ||
        (l.source || "").toLowerCase().includes(term) ||
        (l.status || "").toLowerCase().includes(term)
      );
    });
  }, [data, filter, q]);

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Leads"
        subtitle="Intake pipeline — every potential client, from first contact to conversion."
        right={
          counts.open > 0 ? (
            <span className="badge bg-brand-100 text-brand-700">
              {counts.open} open
            </span>
          ) : undefined
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <div className="overflow-x-auto -mx-1 px-1">
          <Tabs<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: "open", label: "Open", count: counts.open },
              { value: "in_progress", label: "In Progress", count: counts.in_progress },
              { value: "completed", label: "Completed", count: counts.completed },
              { value: "closed", label: "Closed", count: counts.closed },
              { value: "all", label: "All", count: counts.all },
            ]}
          />
        </div>
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, source"
            className="input w-full md:w-64 pl-9"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="mt-5">
        <SectionCard title="Pipeline" count={visible.length}>
          {loading && <LoadingRows rows={5} />}
          {error && <ErrorRow message={error} />}
          {!loading && !error && visible.length === 0 && (
            <EmptyRow
              message={
                (data?.length ?? 0) === 0
                  ? "No leads yet. They will appear here as requests come in."
                  : "No leads match this filter."
              }
            />
          )}
          {!loading && !error && visible.length > 0 && (
            <>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase tracking-wide text-ink-500 bg-ink-100/40">
                      <tr>
                        <th className="text-left font-medium px-5 py-2.5">Lead</th>
                        <th className="text-left font-medium px-5 py-2.5">Client</th>
                        <th className="text-left font-medium px-5 py-2.5">Email</th>
                        <th className="text-left font-medium px-5 py-2.5">Status</th>
                        <th className="text-left font-medium px-5 py-2.5">Source</th>
                        <th className="text-right font-medium px-5 py-2.5">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {visible.map((l) => (
                        <tr
                          key={l.id}
                          className="hover:bg-ink-100/40 cursor-pointer"
                          onClick={() => router.push(`/leads/${l.id}`)}
                        >
                          <td className="px-5 py-3">
                            <Link
                              href={`/leads/${l.id}`}
                              className="font-medium text-ink-900 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {leadDisplayTitle(l)}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-ink-700 truncate max-w-[180px]">
                            {l.clientName || l.client_name || "—"}
                          </td>
                          <td className="px-5 py-3 text-ink-700 truncate max-w-[200px]">
                            {l.email || "—"}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`badge ${statusTone(l.status)} capitalize`}>
                              {humanStatus(l.status)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-ink-500 text-xs">
                            {l.source || "—"}
                          </td>
                          <td className="px-5 py-3 text-right text-ink-500 text-xs whitespace-nowrap">
                            {relativeTime(l.createdAt || l.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="block md:hidden divide-y divide-ink-100">
                {visible.map((l) => (
                  <Link key={l.id} href={`/leads/${l.id}`} className="block px-4 py-3 hover:bg-ink-100/40">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-ink-900 truncate">{leadDisplayTitle(l)}</div>
                      <span className={`badge ${statusTone(l.status)} capitalize`}>{humanStatus(l.status)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span>Source: {l.source || "—"}</span>
                      <span>Received: {relativeTime(l.createdAt || l.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
