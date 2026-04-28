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
import { casesApi, requestsApi } from "@/lib/modules";
import type { RequestCreate } from "@/lib/modules";
import {
  caseDisplayName,
  requestDisplayTitle,
  updatedAt,
  type Case,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";
import type { ApiError } from "@/lib/api";

type Filter =
  | "new"
  | "triaged"
  | "assigned"
  | "waiting_client"
  | "closed"
  | "all";

const FILTERS: Filter[] = [
  "new",
  "triaged",
  "assigned",
  "waiting_client",
  "closed",
  "all",
];

const NEW_LIKE = new Set(["new", "unassigned"]);
const ASSIGNED_LIKE = new Set(["assigned", "in_progress"]);

function matchesFilter(s: string | undefined, f: Filter) {
  const status = (s || "").toLowerCase();
  if (f === "all") return true;
  if (f === "new") return NEW_LIKE.has(status);
  if (f === "assigned") return ASSIGNED_LIKE.has(status);
  return status === f;
}

function NewRequestDialog({
  onClose,
  onCreated,
  token,
}: {
  onClose: () => void;
  onCreated: () => void;
  token: string;
}) {
  const [form, setForm] = useState<RequestCreate>({ subject: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim()) {
      setError("Subject is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestsApi.create(token, {
        subject: form.subject.trim(),
        clientName: form.clientName?.trim() || undefined,
        email: form.email?.trim() || undefined,
        note: form.note?.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (e) {
      const err = e as ApiError;
      setError(err?.message || "Unable to create request.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-ink-900/50 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-ink-900">New intake</h2>
        <p className="text-sm text-ink-500">
          Log a lead now so it doesn&rsquo;t slip.
        </p>
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <div>
            <label className="label" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              className="input"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="client">
              Client name
            </label>
            <input
              id="client"
              className="input"
              value={form.clientName ?? ""}
              onChange={(e) =>
                setForm({ ...form, clientName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="note">
              Note
            </label>
            <textarea
              id="note"
              className="input min-h-[80px]"
              value={form.note ?? ""}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-status-risk">
              {error}
            </div>
          )}
          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Logging…" : "Log intake"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequestsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const token = session?.token ?? null;

  const initial = params.get("filter") as Filter | null;
  const [filter, setFilter] = useState<Filter>(
    initial && FILTERS.includes(initial) ? initial : "new"
  );
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);

  const requests = useAuthedQuery(requestsApi.list, token, "firms/me/requests");
  const cases = useAuthedQuery(casesApi.list, token, "firms/me/cases");

  useEffect(() => {
    const current = params.get("filter");
    if (filter !== current) {
      const next = new URLSearchParams(params.toString());
      if (filter === "new") next.delete("filter");
      else next.set("filter", filter);
      const qs = next.toString();
      router.replace(qs ? `/requests?${qs}` : "/requests", { scroll: false });
    }
  }, [filter, params, router]);

  const caseById = useMemo(() => {
    const map = new Map<string, Case>();
    for (const c of cases.data ?? []) map.set(c.id, c);
    return map;
  }, [cases.data]);

  const counts = useMemo(() => {
    const list = requests.data ?? [];
    return FILTERS.reduce(
      (acc, f) => ({
        ...acc,
        [f]: list.filter((r) => matchesFilter(r.status, f)).length,
      }),
      {} as Record<Filter, number>
    );
  }, [requests.data]);

  const visible = useMemo(() => {
    const list = (requests.data ?? []).filter((r) =>
      matchesFilter(r.status, filter)
    );
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((r) => {
      const caseName =
        (r.caseId || r.case_id) && caseById.get((r.caseId || r.case_id)!)
          ? caseDisplayName(caseById.get((r.caseId || r.case_id)!)!)
          : "";
      return (
        requestDisplayTitle(r).toLowerCase().includes(term) ||
        (r.clientName || r.client_name || "").toLowerCase().includes(term) ||
        (r.email || "").toLowerCase().includes(term) ||
        caseName.toLowerCase().includes(term) ||
        (r.status || "").toLowerCase().includes(term)
      );
    });
  }, [requests.data, filter, q, caseById]);

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Requests"
        subtitle="Every client request — no lead missed."
        right={
          <>
            {counts.new > 0 && (
              <span className="badge bg-brand-100 text-brand-700">
                {counts.new} unhandled
              </span>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCreating(true)}
            >
              + New intake
            </button>
          </>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <div className="overflow-x-auto -mx-1 px-1">
          <Tabs<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: "new", label: "New", count: counts.new },
              { value: "triaged", label: "Triaged", count: counts.triaged },
              { value: "assigned", label: "Assigned", count: counts.assigned },
              {
                value: "waiting_client",
                label: "Waiting client",
                count: counts.waiting_client,
              },
              { value: "closed", label: "Closed", count: counts.closed },
              { value: "all", label: "All", count: counts.all },
            ]}
          />
        </div>
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject, client, email, case"
            className="input w-full md:w-72 pl-9"
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
        <SectionCard title="Inbox" count={visible.length}>
          {requests.loading && <LoadingRows rows={5} />}
          {requests.error && <ErrorRow message={requests.error} />}
          {!requests.loading &&
            !requests.error &&
            visible.length === 0 && (
              <EmptyRow
                message={
                  filter === "new"
                    ? "Inbox zero. Every lead is handled."
                    : (requests.data?.length ?? 0) === 0
                    ? "No requests yet."
                    : "No requests match this filter."
                }
              />
            )}
          {!requests.loading && !requests.error && visible.length > 0 && (
            <>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase tracking-wide text-ink-500 bg-ink-100/40">
                      <tr>
                        <th className="text-left font-medium px-5 py-2.5">Request</th>
                        <th className="text-left font-medium px-5 py-2.5">Client</th>
                        <th className="text-left font-medium px-5 py-2.5">Status</th>
                        <th className="text-left font-medium px-5 py-2.5">Case</th>
                        <th className="text-right font-medium px-5 py-2.5">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {visible.map((r) => {
                        const caseId = r.caseId || r.case_id || null;
                        const caseObj = caseId ? caseById.get(caseId) : undefined;
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-ink-100/40 cursor-pointer"
                            onClick={() => router.push(`/requests/${r.id}`)}
                          >
                            <td className="px-5 py-3">
                              <Link
                                href={`/requests/${r.id}`}
                                className="font-medium text-ink-900 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {requestDisplayTitle(r)}
                              </Link>
                            </td>
                            <td className="px-5 py-3 text-ink-700 truncate max-w-[200px]">
                              {r.clientName || r.client_name || r.email || "—"}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`badge ${statusTone(r.status)} capitalize`}>
                                {humanStatus(r.status)}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {caseObj ? (
                                <Link
                                  href={`/cases/${caseObj.id}`}
                                  className="text-brand-700 hover:underline truncate max-w-[200px] inline-block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {caseDisplayName(caseObj)}
                                </Link>
                              ) : (
                                <span className="text-ink-500">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right text-ink-500 text-xs whitespace-nowrap">
                              {relativeTime(updatedAt(r))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="block md:hidden divide-y divide-ink-100">
                {visible.map((r) => (
                  <Link key={r.id} href={`/requests/${r.id}`} className="block px-4 py-3 hover:bg-ink-100/40">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-ink-900 truncate">{requestDisplayTitle(r)}</div>
                      <span className={`badge ${statusTone(r.status)} capitalize`}>{humanStatus(r.status)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span>Client: {r.clientName || r.client_name || r.email || "—"}</span>
                      <span>Received: {relativeTime(updatedAt(r))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {creating && token && (
        <NewRequestDialog
          token={token}
          onClose={() => setCreating(false)}
          onCreated={requests.reload}
        />
      )}
    </div>
  );
}
