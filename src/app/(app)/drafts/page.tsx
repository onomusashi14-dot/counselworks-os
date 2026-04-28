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
import { draftsApi, casesApi } from "@/lib/modules";
import {
  caseDisplayName,
  draftDisplayTitle,
  updatedAt,
  type Case,
  type Draft,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

type Filter = "drafted" | "in_review" | "needs_revision" | "approved" | "delivered" | "all";

const FILTERS: Filter[] = ["drafted", "in_review", "needs_revision", "approved", "delivered", "all"];

function matchesFilter(s: string | undefined, f: Filter): boolean {
  const status = (s || "").toLowerCase();
  if (f === "all") return true;
  return status === f;
}

export default function DraftsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const token = session?.token ?? null;

  const initial = params.get("filter") as Filter | null;
  const [filter, setFilter] = useState<Filter>(
    initial && FILTERS.includes(initial) ? initial : "all"
  );
  const [q, setQ] = useState("");

  const drafts = useAuthedQuery(draftsApi.list, token, "firms/me/drafts");
  const cases = useAuthedQuery(casesApi.list, token, "firms/me/cases");

  useEffect(() => {
    const current = params.get("filter");
    if (filter !== current) {
      const next = new URLSearchParams(params.toString());
      if (filter === "all") next.delete("filter");
      else next.set("filter", filter);
      const qs = next.toString();
      router.replace(qs ? `/drafts?${qs}` : "/drafts", { scroll: false });
    }
  }, [filter, params, router]);

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
        [f]: list.filter((d) => matchesFilter(d.status, f)).length,
      }),
      {} as Record<Filter, number>
    );
  }, [drafts.data]);

  const visible = useMemo(() => {
    const list = (drafts.data ?? []).filter((d) => matchesFilter(d.status, filter));
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((d) => {
      const caseId = d.caseId || d.case_id || null;
      const caseName = caseId && caseById.get(caseId)
        ? caseDisplayName(caseById.get(caseId)!)
        : "";
      return (
        draftDisplayTitle(d).toLowerCase().includes(term) ||
        (d.authorName || d.author_name || "").toLowerCase().includes(term) ||
        caseName.toLowerCase().includes(term) ||
        (d.status || "").toLowerCase().includes(term)
      );
    });
  }, [drafts.data, filter, q, caseById]);

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Drafts"
        subtitle="Document drafting and approval queue."
        right={
          counts.in_review > 0 ? (
            <span className="badge bg-amber-100 text-amber-700">
              {counts.in_review} in review
            </span>
          ) : undefined
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "drafted", label: "Drafted", count: counts.drafted },
            { value: "in_review", label: "In Review", count: counts.in_review },
            { value: "needs_revision", label: "Revision", count: counts.needs_revision },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "delivered", label: "Delivered", count: counts.delivered },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, author, case"
            className="input w-64 pl-9"
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
        <SectionCard title="Queue" count={visible.length}>
          {drafts.loading && <LoadingRows rows={5} />}
          {drafts.error && <ErrorRow message={drafts.error} />}
          {!drafts.loading && !drafts.error && visible.length === 0 && (
            <EmptyRow
              message={
                (drafts.data?.length ?? 0) === 0
                  ? "No drafts yet."
                  : "No drafts match this filter."
              }
            />
          )}
          {!drafts.loading && !drafts.error && visible.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-500 bg-ink-100/40">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">Draft</th>
                    <th className="text-left font-medium px-5 py-2.5">Type</th>
                    <th className="text-left font-medium px-5 py-2.5">Status</th>
                    <th className="text-left font-medium px-5 py-2.5">Case</th>
                    <th className="text-left font-medium px-5 py-2.5">Author</th>
                    <th className="text-right font-medium px-5 py-2.5">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {visible.map((d) => {
                    const caseId = d.caseId || d.case_id || null;
                    const caseObj = caseId ? caseById.get(caseId) : undefined;
                    const dType = d.draftType || d.draft_type || d.type || "";
                    return (
                      <tr
                        key={d.id}
                        className="hover:bg-ink-100/40 cursor-pointer"
                        onClick={() => router.push(`/drafts/${d.id}`)}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/drafts/${d.id}`}
                            className="font-medium text-ink-900 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {draftDisplayTitle(d)}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-ink-500 text-xs capitalize">
                          {dType ? humanStatus(dType) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`badge ${statusTone(d.status)} capitalize`}>
                            {humanStatus(d.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {caseObj ? (
                            <Link
                              href={`/cases/${caseObj.id}`}
                              className="text-brand-700 hover:underline truncate max-w-[180px] inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {caseDisplayName(caseObj)}
                            </Link>
                          ) : (
                            <span className="text-ink-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-ink-700 truncate max-w-[150px]">
                          {d.authorName || d.author_name || "—"}
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
