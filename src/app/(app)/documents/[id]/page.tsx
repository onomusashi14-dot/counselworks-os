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
import { casesApi, draftsApi } from "@/lib/modules";
import {
  caseDisplayName,
  draftDisplayTitle,
  updatedAt,
  type Case,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";
import type { ApiError } from "@/lib/api";

function authorOf(d: { authorName?: string; author_name?: string; authorId?: string; author_id?: string }) {
  return d.authorName || d.author_name || d.authorId || d.author_id || "—";
}

export default function DocumentDetailPage() {
  const { session } = useAuth();
  const params = useParams<{ id: string }>();
  const token = session?.token ?? null;
  const id = params.id;
  const isAttorney = session?.user.role === "attorney";

  const fetchDraft = useCallback((t: string) => draftsApi.get(t, id), [id]);
  const draftQ = useAuthedQuery(fetchDraft, token);
  const casesQ = useAuthedQuery(casesApi.list, token);

  const [acting, setActing] = useState<"approve" | "reject" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const d = draftQ.data;

  const onApprove = async () => {
    if (!token || !d) return;
    if (
      !confirm(
        `Approve "${draftDisplayTitle(d)}"? This is an attorney sign-off and will be recorded.`
      )
    )
      return;
    setActing("approve");
    setActionError(null);
    setActionNotice(null);
    try {
      await draftsApi.approve(token, d.id);
      setActionNotice("Draft approved.");
      draftQ.reload();
    } catch (e) {
      const err = e as ApiError;
      setActionError(
        err?.status === 404
          ? "Approval endpoint not yet available on the backend."
          : err?.message || "Unable to approve draft."
      );
    } finally {
      setActing(null);
    }
  };

  const onReject = async () => {
    if (!token || !d) return;
    const reason = prompt("What needs to change? (shared with the author)");
    if (reason === null) return;
    setActing("reject");
    setActionError(null);
    setActionNotice(null);
    try {
      await draftsApi.reject(token, d.id, reason || undefined);
      setActionNotice("Changes requested — author has been notified.");
      draftQ.reload();
    } catch (e) {
      const err = e as ApiError;
      setActionError(
        err?.status === 404
          ? "Reject endpoint not yet available on the backend."
          : err?.message || "Unable to reject draft."
      );
    } finally {
      setActing(null);
    }
  };

  if (draftQ.loading) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <LoadingRows rows={4} />
      </div>
    );
  }
  if (draftQ.error || !d) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <PageHeader
          title="Document not found"
          crumbs={[{ href: "/documents", label: "Documents" }, { label: id }]}
        />
        <div className="mt-4 card p-5">
          <ErrorRow
            message={draftQ.error || "This document could not be loaded."}
          />
          <Link href="/documents" className="mt-4 inline-block btn-secondary">
            ← Back to documents
          </Link>
        </div>
      </div>
    );
  }

  const caseId = d.caseId || d.case_id || null;
  const caseObj: Case | undefined = caseId
    ? (casesQ.data ?? []).find((c) => c.id === caseId)
    : undefined;

  const status = (d.status || "").toLowerCase();
  const isPending = status === "pending_approval";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const body = d.body || d.content || d.summary;

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title={draftDisplayTitle(d)}
        subtitle={
          caseObj
            ? `Case: ${caseDisplayName(caseObj)}`
            : d.type
            ? humanStatus(d.type)
            : undefined
        }
        crumbs={[
          { href: "/documents", label: "Documents" },
          { label: draftDisplayTitle(d) },
        ]}
        right={
          <span className={`badge ${statusTone(d.status)} capitalize`}>
            {humanStatus(d.status)}
          </span>
        }
      />

      {isPending && (
        <div
          role="region"
          aria-label="Approval actions"
          className={`mt-4 rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
            isAttorney
              ? "border-amber-200 bg-amber-50"
              : "border-ink-100 bg-white"
          }`}
        >
          <div className="text-sm">
            {isAttorney ? (
              <>
                <span className="font-semibold text-status-warn">
                  Awaiting your sign-off.
                </span>{" "}
                <span className="text-ink-700">
                  Only you can approve or request changes on this draft.
                </span>
              </>
            ) : (
              <span className="text-ink-700">
                Awaiting attorney sign-off. You&rsquo;ll be notified when a
                decision is made.
              </span>
            )}
          </div>
          {isAttorney && (
            <div className="flex items-center gap-2">
              <button
                onClick={onReject}
                disabled={acting !== null}
                className="btn-secondary"
              >
                {acting === "reject" ? "Requesting…" : "Request changes"}
              </button>
              <button
                onClick={onApprove}
                disabled={acting !== null}
                className="btn-primary"
              >
                {acting === "approve" ? "Approving…" : "Approve"}
              </button>
            </div>
          )}
        </div>
      )}

      {isApproved && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-status-ok">
          Approved. Attorney sign-off recorded{" "}
          {relativeTime(updatedAt(d))}.
        </div>
      )}

      {isRejected && (d.rejectionReason || d.rejection_reason) && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <div className="font-semibold text-status-risk">
            Changes requested
          </div>
          <div className="mt-1 text-ink-700">
            {d.rejectionReason || d.rejection_reason}
          </div>
        </div>
      )}

      {actionError && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-risk">
          {actionError}
        </div>
      )}
      {actionNotice && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-status-ok">
          {actionNotice}
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Content" padded>
            {body ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-ink-900">
                {body}
              </div>
            ) : (
              <div className="text-sm text-ink-500">
                No preview content attached to this draft.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Details" padded>
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="col-span-1 text-ink-500">Status</dt>
              <dd className="col-span-2">
                <span className={`badge ${statusTone(d.status)} capitalize`}>
                  {humanStatus(d.status)}
                </span>
              </dd>
              {d.type && (
                <>
                  <dt className="col-span-1 text-ink-500">Type</dt>
                  <dd className="col-span-2 capitalize text-ink-900">
                    {humanStatus(d.type)}
                  </dd>
                </>
              )}
              <dt className="col-span-1 text-ink-500">Case</dt>
              <dd className="col-span-2">
                {caseObj ? (
                  <Link
                    href={`/cases/${caseObj.id}`}
                    className="text-brand-700 hover:underline"
                  >
                    {caseDisplayName(caseObj)}
                  </Link>
                ) : (
                  <span className="text-ink-500">—</span>
                )}
              </dd>
              <dt className="col-span-1 text-ink-500">Author</dt>
              <dd className="col-span-2 text-ink-900">{authorOf(d)}</dd>
              <dt className="col-span-1 text-ink-500">Created</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(d.createdAt || d.created_at)}
              </dd>
              <dt className="col-span-1 text-ink-500">Updated</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(updatedAt(d))}
              </dd>
            </dl>
          </SectionCard>

          <SectionCard title="Approval control" padded>
            <p className="text-sm text-ink-500">
              Only the attorney of record can approve or request changes.
              Everyone else sees the current status and author.
            </p>
            {!isAttorney && isPending && (
              <div className="mt-3 text-xs text-ink-500">
                You&rsquo;ll receive a notification the moment the attorney
                makes a decision.
              </div>
            )}
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
