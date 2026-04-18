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
import { casesApi, draftsApi } from "@/lib/modules";
import {
  caseDisplayName,
  draftDisplayTitle,
  updatedAt,
  type Case,
  type Draft,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

type Filter =
  | "pending_approval"
  | "drafting"
  | "approved"
  | "rejected"
  | "all";

const FILTERS: Filter[] = [
  "pending_approval",
  "drafting",
  "approved",
  "rejected",
  "all",
];

function matchesFilter(d: Draft, f: Filter) {
  const s = (d.status || "").toLowerCase();
  if (f === "all") return true;
  if (f === "drafting") return s === "drafting" || s === "draft";
  return s === f;
}

function authorOf(d: Draft): string {
  return d.authorName || d.author_name || d.authorId || d.author_id || "—";
}

export default function DocumentsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const token = session?.token ?? null;
  const isAttorney = session?.user.role === "attorney";

  const initial = params.get("filter") as Filter | null;
  const defaultFilter: Filter = isAttorney ? "pending_approval" : "all";
  const [filter, setFilter] = useState<Filter>(
    initial && FILTERS.includes(initial) ? initial : defaultFilter
  );
  const [q, setQ] = useState("");

  const drafts = useAuthedQuery(draftsApi.list, token);
  const cases = useAuthedQuery(casesApi.list, token);

  useEffect(() => {
    const current = params.get("filter");
    if (filter !== current) {
      const next = new URLSearchParams(params.toString());
      if (filter === defaultFilter) next.delete("filter");
      else next.set("filter", filter);
      const qs = next.toString();
      router.replace(qs ? `/documents?${qs}` : "/documents", {
        scroll: false,
      });
    }
  }, [filter, params, router, defaultFilter]);

  const caseById = useMemo(() => {
    const map = new Map<string, Case>();
    for (const c of cases.data ?? []) map.set(c.id, c);
    return map;
  }, [cases.data]);

  const counts = useMemo(() => {
    const list = drafts.data ?? [];
    return FILTERS.reduce(
      (acc, f) => ({
        ...acc,
        [f]: list.filter((d) => matchesFilter(d, f)).length,
      }),
      {} as Record<Filter, number>
    );
  }, [drafts.data]);

  const visible = useMemo(() => {
    const list = (drafts.data ?? []).filter((d) => matchesFilter(d, filter));
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((d) => {
      const caseName =
        (d.caseId || d.case_id) && caseById.get((d.caseId || d.case_id)!)
          ? caseDisplayName(caseById.get((d.caseId || d.case_id)!)!)
          : "";
      return (
        draftDisplayTitle(d).toLowerCase().includes(term) ||
        caseName.toLowerCase().includes(term) ||
        authorOf(d).toLowerCase().includes(term)
      );
    });
  }, [drafts.data, filter, q, caseById]);

  const subtitle = isAttorney
    ? "Every draft routes through you. Approve or request changes."
    : "Drafts you've authored and their approval status.";

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Documents"
        subtitle={subtitle}
        right={
          isAttorney && counts.pending_approval > 0 ? (
            <span className="badge bg-amber-50 text-status-warn border border-amber-200">
              {counts.pending_approval} awaiting you
            </span>
          ) : undefined
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            {
              value: "pending_approval",
              label: isAttorney ? "Awaiting you" : "Awaiting attorney",
              count: counts.pending_approval,
            },
            { value: "drafting", label: "Drafting", count: counts.drafting },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, case, author"
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
        <SectionCard title="Documents" count={visible.length}>
          {drafts.loading && <LoadingRows rows={5} />}
          {drafts.error && <ErrorRow message={drafts.error} />}
          {!drafts.loading && !drafts.error && visible.length === 0 && (
            <EmptyRow
              message={
                (drafts.data?.length ?? 0) === 0
                  ? "No drafts yet."
                  : "No documents match this filter."
              }
            />
          )}
          {!drafts.loading && !drafts.error && visible.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-500 bg-ink-100/40">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">
                      Document
                    </th>
                    <th className="text-left font-medium px-5 py-2.5">Case</th>
                    <th className="text-left font-medium px-5 py-2.5">
                      Status
                    </th>
                    <th className="text-left font-medium px-5 py-2.5">
                      Author
                    </th>
                    <th className="text-right font-medium px-5 py-2.5">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {visible.map((d) => {
                    const caseId = d.caseId || d.case_id || null;
                    const caseObj = caseId ? caseById.get(caseId) : undefined;
                    return (
                      <tr
                        key={d.id}
                        className="hover:bg-ink-100/40 cursor-pointer"
                        onClick={() => router.push(`/documents/${d.id}`)}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/documents/${d.id}`}
                            className="font-medium text-ink-900 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {draftDisplayTitle(d)}
                          </Link>
                          {d.type && (
                            <div className="text-xs text-ink-500 capitalize mt-0.5">
                              {humanStatus(d.type)}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {caseObj ? (
                            <Link
                              href={`/cases/${caseObj.id}`}
                              className="text-ink-700 hover:underline truncate max-w-[220px] inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {caseDisplayName(caseObj)}
                            </Link>
                          ) : (
                            <span className="text-ink-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`badge ${statusTone(d.status)} capitalize`}
                          >
                            {humanStatus(d.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-700 truncate max-w-[180px]">
                          {authorOf(d)}
                        </td>
                        <td className="px-5 py-3 text-right text-ink-500 text-xs whitespace-nowrap">
                          {relativeTime(updatedAt(d))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
