"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  ErrorRow,
  LoadingRows,
  PageHeader,
  SectionCard,
  statusTone,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import { casesApi, requestsApi, type RequestPatch } from "@/lib/modules";
import {
  caseDisplayName,
  requestDisplayTitle,
  updatedAt,
  type Case,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";
import type { ApiError } from "@/lib/api";

export default function RequestDetailPage() {
  const { session } = useAuth();
  const params = useParams<{ id: string }>();
  const token = session?.token ?? null;
  const id = params.id;
  const currentUserId = session?.user.id;

  const fetchReq = useCallback((t: string) => requestsApi.get(t, id), [id]);
  const reqQ = useAuthedQuery(fetchReq, token, `firms/me/requests/${id}`);
  const casesQ = useAuthedQuery(casesApi.list, token, "firms/me/cases");

  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);

  const r = reqQ.data;

  const patch = async (body: RequestPatch, actionLabel: string, successMsg: string) => {
    if (!token || !r) return;
    setActing(actionLabel);
    setError(null);
    setNotice(null);
    try {
      await requestsApi.update(token, r.id, body);
      setNotice(successMsg);
      reqQ.reload();
    } catch (e) {
      const err = e as ApiError;
      setError(
        err?.status === 404
          ? "Update endpoint not yet available on the backend."
          : err?.message || "Unable to update request."
      );
    } finally {
      setActing(null);
    }
  };

  if (reqQ.loading) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <LoadingRows rows={4} />
      </div>
    );
  }
  if (reqQ.error || !r) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <PageHeader
          title="Request not found"
          crumbs={[{ href: "/requests", label: "Requests" }, { label: id }]}
        />
        <div className="mt-4 card p-5">
          <ErrorRow
            message={reqQ.error || "This request could not be loaded."}
          />
          <Link href="/requests" className="mt-4 inline-block btn-secondary">
            ← Back to requests
          </Link>
        </div>
      </div>
    );
  }

  const status = (r.status || "").toLowerCase();
  const caseId = r.caseId || r.case_id || null;
  const caseObj: Case | undefined = caseId
    ? (casesQ.data ?? []).find((c) => c.id === caseId)
    : undefined;
  const assignee = r.assigneeId || r.assignee_id || null;
  const mine = assignee && currentUserId && assignee === currentUserId;

  const isNew = ["new", "unassigned"].includes(status);
  const isClosed = status === "closed";
  const openCases = (casesQ.data ?? []).filter(
    (c) => !["closed", "archived"].includes((c.status || "").toLowerCase())
  );

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title={requestDisplayTitle(r)}
        subtitle={
          r.clientName || r.client_name || r.email
            ? `From ${r.clientName || r.client_name || r.email}`
            : undefined
        }
        crumbs={[
          { href: "/requests", label: "Requests" },
          { label: requestDisplayTitle(r) },
        ]}
        right={
          <span className={`badge ${statusTone(r.status)} capitalize`}>
            {humanStatus(r.status)}
          </span>
        }
      />

      {isNew && (
        <div
          role="region"
          aria-label="Lead actions"
          className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-sm">
            <span className="font-semibold text-brand-700">Unhandled lead.</span>{" "}
            <span className="text-ink-700">
              Triage to start the clock, assign to yourself, or close as not a fit.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                patch({ status: "triaged" }, "triage", "Request triaged.")
              }
              disabled={acting !== null}
              className="btn-secondary"
            >
              {acting === "triage" ? "Triaging…" : "Triage"}
            </button>
            <button
              type="button"
              onClick={() =>
                patch(
                  { assigneeId: currentUserId, status: "assigned" },
                  "assign",
                  "Assigned to you."
                )
              }
              disabled={acting !== null || !currentUserId}
              className="btn-primary"
            >
              {acting === "assign" ? "Assigning…" : "Assign to me"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-risk">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-status-ok">
          {notice}
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-6">
          <SectionCard title="Message" padded>
            <div className="text-sm text-ink-900 whitespace-pre-wrap">
              {(r as { note?: string; message?: string; body?: string }).note ||
                (r as { message?: string }).message ||
                (r as { body?: string }).body || (
                  <span className="text-ink-500">No body provided.</span>
                )}
            </div>
          </SectionCard>

          <SectionCard
            title="Linked case"
            action={
              !isClosed ? (
                <button
                  type="button"
                  onClick={() => setLinkOpen((v) => !v)}
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  {caseObj ? "Change" : "Link case"}
                </button>
              ) : undefined
            }
            padded
          >
            {caseObj ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/cases/${caseObj.id}`}
                    className="font-medium text-ink-900 hover:underline"
                  >
                    {caseDisplayName(caseObj)}
                  </Link>
                  <div className="text-xs text-ink-500 mt-0.5">
                    <span
                      className={`badge ${statusTone(caseObj.status)} capitalize`}
                    >
                      {humanStatus(caseObj.status)}
                    </span>
                  </div>
                </div>
                {!isClosed && (
                  <button
                    type="button"
                    onClick={() =>
                      patch(
                        { caseId: null, case_id: null },
                        "unlink",
                        "Case unlinked."
                      )
                    }
                    disabled={acting !== null}
                    className="btn-secondary"
                  >
                    {acting === "unlink" ? "Unlinking…" : "Unlink"}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-ink-500">
                Not linked to a case yet.
              </div>
            )}

            {linkOpen && !isClosed && (
              <div className="mt-4 border-t border-ink-100 pt-4">
                <label className="label" htmlFor="caselink">
                  Select a case
                </label>
                <select
                  id="caselink"
                  className="input"
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    patch(
                      { caseId: val, case_id: val },
                      "link",
                      "Case linked."
                    );
                    setLinkOpen(false);
                  }}
                  disabled={acting !== null || casesQ.loading}
                >
                  <option value="" disabled>
                    {casesQ.loading
                      ? "Loading cases…"
                      : openCases.length === 0
                      ? "No open cases"
                      : "Choose a case…"}
                  </option>
                  {openCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {caseDisplayName(c)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Details" padded>
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="col-span-1 text-ink-500">Status</dt>
              <dd className="col-span-2">
                <span className={`badge ${statusTone(r.status)} capitalize`}>
                  {humanStatus(r.status)}
                </span>
              </dd>
              <dt className="col-span-1 text-ink-500">Client</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {r.clientName || r.client_name || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Email</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {r.email || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Assignee</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {assignee ? (mine ? "You" : assignee) : "Unassigned"}
              </dd>
              <dt className="col-span-1 text-ink-500">Received</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(r.createdAt || r.created_at)}
              </dd>
              <dt className="col-span-1 text-ink-500">Updated</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(updatedAt(r))}
              </dd>
            </dl>
          </SectionCard>

          <SectionCard title="Actions" padded>
            <div className="grid gap-2">
              {!isClosed && !mine && (
                <button
                  type="button"
                  onClick={() =>
                    patch(
                      {
                        assigneeId: currentUserId,
                        assignee_id: currentUserId,
                        status:
                          status === "new" || status === "triaged"
                            ? "assigned"
                            : r.status,
                      },
                      "assign",
                      "Assigned to you."
                    )
                  }
                  disabled={acting !== null || !currentUserId}
                  className="btn-primary w-full"
                >
                  {acting === "assign" ? "Assigning…" : "Assign to me"}
                </button>
              )}

              {!isClosed && status !== "waiting_client" && (
                <button
                  type="button"
                  onClick={() =>
                    patch(
                      { status: "waiting_client" },
                      "wait",
                      "Marked waiting on client."
                    )
                  }
                  disabled={acting !== null}
                  className="btn-secondary w-full"
                >
                  {acting === "wait" ? "Updating…" : "Waiting on client"}
                </button>
              )}

              {!isClosed && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Close this request? It will be removed from the active queue."
                      )
                    )
                      patch(
                        { status: "closed" },
                        "close",
                        "Request closed."
                      );
                  }}
                  disabled={acting !== null}
                  className="btn-secondary w-full"
                >
                  {acting === "close" ? "Closing…" : "Close request"}
                </button>
              )}

              {isClosed && (
                <button
                  type="button"
                  onClick={() =>
                    patch(
                      { status: "triaged" },
                      "reopen",
                      "Request reopened."
                    )
                  }
                  disabled={acting !== null}
                  className="btn-secondary w-full"
                >
                  {acting === "reopen" ? "Reopening…" : "Reopen"}
                </button>
              )}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
