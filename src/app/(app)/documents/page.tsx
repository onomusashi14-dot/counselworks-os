"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  EmptyRow,
  ErrorRow,
  LoadingRows,
  PageHeader,
  SectionCard,
  Tabs,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import { filesApi } from "@/lib/modules";
import { relativeTime } from "@/lib/format";
import type { CWFile } from "@/lib/types";

type Filter = "all" | string;

function humanDocType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(b) || b === 0) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const firmId = session?.user?.firmId ?? session?.user?.firm_id ?? null;

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const fetchFiles = useCallback(
    (t: string) => {
      if (!firmId) return Promise.resolve([]);
      return filesApi.list(t, firmId);
    },
    [firmId]
  );

  const filesQ = useAuthedQuery(fetchFiles, token, `api/files?firmId=${firmId}`);

  const allFiles = filesQ.data ?? [];

  const docTypes = useMemo(() => {
    const set = new Set<string>();
    for (const f of allFiles) {
      if (f.documentType) set.add(f.documentType);
    }
    return Array.from(set).sort();
  }, [allFiles]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: allFiles.length };
    for (const dt of docTypes) {
      result[dt] = allFiles.filter((f) => f.documentType === dt).length;
    }
    return result;
  }, [allFiles, docTypes]);

  const visible = useMemo(() => {
    let list = allFiles;
    if (filter !== "all") {
      list = list.filter((f) => f.documentType === filter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (f) =>
          (f.originalName || "").toLowerCase().includes(term) ||
          (f.documentType || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [allFiles, filter, q]);

  const tabOptions = [
    { value: "all" as Filter, label: "All", count: counts.all || 0 },
    ...docTypes.map((dt) => ({
      value: dt as Filter,
      label: humanDocType(dt),
      count: counts[dt] || 0,
    })),
  ];

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Documents"
        subtitle="Files uploaded across all cases."
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          options={tabOptions}
        />
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search file name"
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
        <SectionCard title="Files" count={visible.length}>
          {filesQ.loading && <LoadingRows rows={5} />}
          {filesQ.error && <ErrorRow message={filesQ.error} />}
          {!filesQ.loading && !filesQ.error && visible.length === 0 && (
            <EmptyRow
              message={
                allFiles.length === 0
                  ? "No files uploaded yet."
                  : "No files match this filter."
              }
            />
          )}
          {!filesQ.loading && !filesQ.error && visible.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-500 bg-ink-100/40">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">File Name</th>
                    <th className="text-left font-medium px-5 py-2.5">Type</th>
                    <th className="text-left font-medium px-5 py-2.5">Size</th>
                    <th className="text-right font-medium px-5 py-2.5">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {visible.map((f) => (
                    <tr key={f.id} className="hover:bg-ink-100/40">
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink-900 truncate max-w-[320px]">
                          {f.originalName}
                        </div>
                        <div className="text-xs text-ink-500 mt-0.5">{f.mimeType}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="badge bg-ink-100 text-ink-700 capitalize">
                          {humanDocType(f.documentType)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-700">{formatBytes(f.sizeBytes)}</td>
                      <td className="px-5 py-3 text-right text-ink-500 text-xs whitespace-nowrap">
                        {relativeTime(f.createdAt)}
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
