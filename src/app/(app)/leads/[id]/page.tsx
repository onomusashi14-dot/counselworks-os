"use client";

import Link from "next/link";
import { useCallback } from "react";
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
import { leadsApi } from "@/lib/modules";
import { leadDisplayTitle, updatedAt } from "@/lib/types";
import { humanStatus, relativeTime } from "@/lib/format";

export default function LeadDetailPage() {
  const { session } = useAuth();
  const params = useParams<{ id: string }>();
  const token = session?.token ?? null;
  const id = params.id;

  const fetchLead = useCallback((t: string) => leadsApi.get(t, id), [id]);
  const leadQ = useAuthedQuery(fetchLead, token, `firms/me/leads/${id}`);

  const l = leadQ.data;

  if (leadQ.loading) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <LoadingRows rows={4} />
      </div>
    );
  }
  if (leadQ.error || !l) {
    return (
      <div className="px-6 py-6 md:px-8 md:py-8">
        <PageHeader
          title="Lead not found"
          crumbs={[{ href: "/leads", label: "Leads" }, { label: id }]}
        />
        <div className="mt-4 card p-5">
          <ErrorRow message={leadQ.error || "This lead could not be loaded."} />
          <Link href="/leads" className="mt-4 inline-block btn-secondary">
            &larr; Back to leads
          </Link>
        </div>
      </div>
    );
  }

  const status = (l.status || "").toLowerCase();
  const assignee = l.assigneeId || l.assignee_id || null;
  const isNew = status === "open";

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title={leadDisplayTitle(l)}
        subtitle={
          l.clientName || l.client_name || l.email
            ? `From ${l.clientName || l.client_name || l.email}`
            : undefined
        }
        crumbs={[
          { href: "/leads", label: "Leads" },
          { label: leadDisplayTitle(l) },
        ]}
        right={
          <span className={`badge ${statusTone(l.status)} capitalize`}>
            {humanStatus(l.status)}
          </span>
        }
      />

      {isNew && (
        <div
          role="region"
          aria-label="New lead"
          className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-sm">
            <span className="font-semibold text-brand-700">New lead.</span>{" "}
            <span className="text-ink-700">
              This intake has not been triaged yet.
            </span>
          </div>
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-6">
          <SectionCard title="Message" padded>
            <div className="text-sm text-ink-900 whitespace-pre-wrap">
              {l.note || l.message || l.body || (
                <span className="text-ink-500">No message provided.</span>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Details" padded>
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="col-span-1 text-ink-500">Status</dt>
              <dd className="col-span-2">
                <span className={`badge ${statusTone(l.status)} capitalize`}>
                  {humanStatus(l.status)}
                </span>
              </dd>
              <dt className="col-span-1 text-ink-500">Client</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {l.clientName || l.client_name || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Email</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {l.email || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Phone</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {l.phone || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Source</dt>
              <dd className="col-span-2 text-ink-700 capitalize">
                {l.source || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Case type</dt>
              <dd className="col-span-2 text-ink-700 capitalize">
                {l.caseType || l.case_type || "—"}
              </dd>
              <dt className="col-span-1 text-ink-500">Assignee</dt>
              <dd className="col-span-2 text-ink-900 truncate">
                {assignee || "Unassigned"}
              </dd>
              <dt className="col-span-1 text-ink-500">Received</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(l.createdAt || l.created_at)}
              </dd>
              <dt className="col-span-1 text-ink-500">Updated</dt>
              <dd className="col-span-2 text-ink-700">
                {relativeTime(updatedAt(l))}
              </dd>
            </dl>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
