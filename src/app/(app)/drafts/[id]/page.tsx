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
import { draftsApi, casesApi } from "@/lib/modules";
import {
  caseDisplayName,
  draftDisplayTitle,
  updatedAt,
  type Case,
} from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";
import type { ApiError } from "@/lib/api";

export default function DraftDetailPage() {
  const { session } = useAuth();
  const params = useParams<{ id: string }>();
  const token = session?.token ?? null;
  const id = params.id;

  const fetchDraft = useCallback((t: string) => draftsApi.get(t, id), [id]);
  const draftQ = useAuthedQuery(fetchDraft, token, `firms/me/drafts/${id}`);
  const casesQ = useAuthedQuery(casesApi.list, token, "firms/me/cases");

  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const d = draftQ.data;

  async function doApprove() {
    if (!token || !d) return;
    setActing("approve");
    setError(null);
    setNotice(null);
    try {
      await draftsApi.approve(token, d.id);
      setNotice("Draft approved.");
      draftQ.reload();
    } catch (e) {
      const err = e as ApiError;
      setError(err?.message || "Unable to approve draft.");
    } finally {
      setActing(null);
    }
  }

  async function doReject() {
    if (!token || !d) return;
    setActing("reject");
    setError(null);
    setNotice(null);
    try {
      await draftsApi.reject(token, d.id, rejectReason.trim() || undefined);
      setNotice("Draft rejected.");
      setRejectOpen(false);
      setRejectReason("");
      draftQ.reload();
    } catch (e) {
      const err = e as ApiError;
      setError(err?.message || "Unable to reject draft.");
    } finally {
      setActing(null);
    }
  }

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
          title="Draft not found"
          crumbs={[{ href: "/drafts", label: "Drafts" }, { label: id }]}
        />
        <div className="mt-4 card p-5">
          <ErrorRow message={draftQ.error || "This draft could not be loaded."} />
          <Link href="/drafts" className="mt-4 inline-block btn-secondary">
            &larr; Back to drafts
          </Link>
        </div>
      </div>
    );
  }

  const status = (d.status || "").toLowerCase();
  const isPending = ["pending_approval", "in_review"].includes(status);
  const isRejected = status === "rejected";
  const caseId = d.caseId || d.case_id || null;
  const caseObj: Case | undefined = caseId
    ? (casesQ.data ?? []).find((c) => c.id === caseId)
    : undefined;
  const dType = d.draftType || d.draft_type || d.type || "";

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title={draftDisplayTitle(d)}
        subtitle={dType ? humanStatus(dType) : undefined}
        crumbs={[
          { href: "/drafts", label: "Drafts" },
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
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-sm">
            <span className="font-semibold text-amber-700">Awaiting approval.</span>{" "}
            <span className="text-ink-700">
              Review the draft below, then approve or reject.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              disabled={acting !== null}
              className="btn-secondary"
            >
              {acting === "reject" ? "Rejecting\u2026" : "Reject"}
            </button>
            <button
              type="button"
              onClick={doApprove}
              disabled={acting !== null}
              className="btn-primary"
            >
              {acting === "approve" ? "Approving\u2026" : "Approve"}
            </button>
          </div>
        </div>
      )}

      {isRejected && d.rejectionReason || d.rejection_reason ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-risk"
        >
          <span className="font-semibold">Rejection reason:</span>{" "}
          {d.rejectionReason || d.rejection_reason}
        </div>
      ) : null}

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
          <SectionCard title="Content" padded>
            <div className="text-sm text-ink-900 whitespace-pre-wrap">
              {d.body || d.content || (
                <span className="text-ink-500">No content available.</span>
              )}
            </div>
          </SectionCard>

          {d.summary && (
            <SectionCard title="Summary" padded>
              <div className="text-sm text-ink-700 whitespace-pre-wrap">
                {d.summary}
              </div>
            </SectionCard>
          )}
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
              <dt className="col-span-1 text-ink-500">Type</dt>
              <dd className="col-span-2 text-ink-900 capitalize">
                {dType ? humanStatus(dType) : "â"}
              </dd>
              <dt className="col-span-1 text-ink-500">Author</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {d.authorName || d.author_name || d.authorId || d.author_id || "â"}
              </dd>
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
                  <span className="text-ink-500">â</span>
                )}
              </dd>
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

          {isPending && (
            <SectionCard title="Actions" padded>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={doApprove}
                  disabled={acting !== null}
                  className="btn-primary w-full"
                >
                  {acting === "approve" ? "Approving\u2026" : "Approve draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  disabled={acting !== null}
                  className="btn-secondary w-full"
                >
                  Reject draft
                </button>
              </div>
            </SectionCard>
          )}
        </div>
      </section>

      {rejectOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/50 grid place-items-center p-4"
          onClick={() => setRejectOpen(false)}
        >
          <div
            className="card w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink-900">Reject draft</h2>
            <p className="text-sm text-ink-500 mt-1">
              Provide a reason so the author knows what to fix.
            </p>
            <div className="mt-4">
              <label className="label" htmlFor="reason">
                Reason (optional)
              </label>
              <textarea
                id="reason"
                className="input min-h-[80px]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="btn-secondary"
                disabled={acting !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doReject}
                className="btn-primary"
                disabled={acting !== null}
              >
                {acting === "reject" ? "Rejecting\u2026" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
