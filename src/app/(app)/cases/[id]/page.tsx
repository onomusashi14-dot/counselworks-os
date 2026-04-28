"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  EmptyRow,
  ErrorRow,
  LoadingRows,
  PageHeader,
  SectionCard,
  statusTone,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import { casesApi, draftsApi, requestsApi } from "@/lib/modules";
import {
  caseDisplayName,
  draftDisplayTitle,
  requestDisplayTitle,
  updatedAt,
  type Draft,
  type ClientRequest,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

function caseIdOf(x: { caseId?: string | null; case_id?: string | null }) {
  return x.caseId ?? x.case_id ?? null;
}

export default function CaseDetailPage() {
  const { session } = useAuth();
  const params = useParams<{ id: string }>();
  const token = session?.token ?? null;
  const id = params.id;

  const fetchCase = useCallback(
    (t: string) => casesApi.get(t, id),
    [id]
  );

  const caseQ = useAuthedQuery(fetchCase, token, `firms/me/cases/${id}`);
  const requestsQ = useAuthedQuery(requestsApi.list, token, "firms/me/requests");
  const draftsQ = useAuthedQuery(draftsApi.list, token, "firms/me/drafts");

  const relatedRequests = useMemo<ClientRequest[]>(
    () => (requestsQ.data ?? []).filter((r) => caseIdOf(r) === id),
    [requestsQ.data, id]
  );
  const relatedDrafts = useMemo<Draft[]>(
    () => (draftsQ.data ?? []).filter((d) => caseIdOf(d) === id),
    [draftsQ.data, id]
  );

  const c = caseQ.data;
  const blocked = c && ["blocked", "awaiting_client", "on_hold"].includes(
    (c.status || "").toLowerCase()
  );

  if (caseQ.loading) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <LoadingRows rows={4} />
      </div>
    );
  }
  if (caseQ.error || !c) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <PageHeader
          title="Case not found"
          crumbs={[{ href: "/cases", label: "Cases" }, { label: id }]}
        />
        <div className="mt-4 card p-5">
          <ErrorRow message={caseQ.error || "This case could not be loaded."} />
          <Link href="/cases" className="mt-4 inline-block btn-secondary">
            ← Back to cases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title={caseDisplayName(c)}
        subtitle={
          c.clientName || c.client_name
            ? `Client: ${c.clientName || c.client_name}`
            : undefined
        }
        crumbs={[
          { href: "/cases", label: "Cases" },
          { label: caseDisplayName(c) },
        ]}
        right={
          <span className={`badge ${statusTone(c.status)} capitalize`}>
            {humanStatus(c.status)}
          </span>
        }
      />

      {blocked && c.blocker && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-risk flex items-start gap-2"
        >
          <span className="font-semibold">⚠ Blocker:</span>
          <span className="text-ink-700">{c.blocker}</span>
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-6">
          <SectionCard
            title="Open requests"
            count={relatedRequests.length}
            action={
              <Link
                href="/requests"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                All requests
              </Link>
            }
          >
            {requestsQ.loading && <LoadingRows />}
            {requestsQ.error && <ErrorRow message={requestsQ.error} />}
            {!requestsQ.loading &&
              !requestsQ.error &&
              relatedRequests.length === 0 && (
                <EmptyRow message="No requests tied to this case." />
              )}
            {relatedRequests.map((r) => (
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
                    {r.clientName || r.client_name || r.email || "—"} {"·"} updated{" "}
                    {relativeTime(updatedAt(r))}
                  </div>
                </div>
                <span className={`badge ${statusTone(r.status)} capitalize`}>
                  {humanStatus(r.status)}
                </span>
              </Link>
            ))}
          </SectionCard>

          <SectionCard
            title="Drafts"
            count={relatedDrafts.length}
            action={
              <Link
                href="/documents"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                All documents
              </Link>
            }
          >
            {draftsQ.loading && <LoadingRows />}
            {draftsQ.error && <ErrorRow message={draftsQ.error} />}
            {!draftsQ.loading &&
              !draftsQ.error &&
              relatedDrafts.length === 0 && (
                <EmptyRow message="No drafts tied to this case." />
              )}
            {relatedDrafts.map((d) => (
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
                  </div>
                </div>
                <span className={`badge ${statusTone(d.status)} capitalize`}>
                  {humanStatus(d.status)}
                </span>
              </Link>
            ))}
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Details" padded>
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="col-span-1 text-ink-500">Status</dt>
              <dd className="col-span-2">
                <span className={`badge ${statusTone(c.status)} capitalize`}>
                  {humanStatus(c.status)}
                </span>
              </dd>
              <dt className="col-span-1 text-ink-500">Priority</dt>
              <dd className="col-span-2 capitalize text-ink-900">
                {c.priority || "normal"}
              </dd>
              <dt className="col-span-1 text-ink-500">Client</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {c.clientName || c.client_name || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Attorney</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {c.primaryAttorney?.fullName || c.primaryAttorney?.full_name || c.primaryAttorneyId || c.primary_attorney_id || c.attorneyId || c.attorney_id || "Unassigned"}
              </dd>
              <dt className="col-span-1 text-ink-500">Opened</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(c.createdAt || c.created_at)}
              </dd>
              <dt className="col-span-1 text-ink-500">Updated</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(updatedAt(c))}
              </dd>
            </dl>
          </SectionCard>

          <SectionCard title="At a glance" padded>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-ink-500">Open requests</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {c.openRequests ?? c.open_requests ?? relatedRequests.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-500">Pending drafts</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {c.pendingDrafts ??
                    c.pending_drafts ??
                    relatedDrafts.filter(
                      (d) =>
                        (d.status || "").toLowerCase() === "pending_approval"
                    ).length}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
