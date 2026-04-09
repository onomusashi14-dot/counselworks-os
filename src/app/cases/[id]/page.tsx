"use client";

import { use } from "react";
import AppShell from "@/components/layout/app-shell";
import { mockCases, mockDocuments, mockRequests } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const caseData = mockCases.find((c) => c.id === id);
  const caseDocs = mockDocuments.filter((d) => d.caseId === id);
  const caseRequests = mockRequests.filter((r) => r.caseId === id);

  if (!caseData) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-gray-900">Case not found</p>
          <Link href="/cases" className="mt-2 text-sm text-brand-600 hover:text-brand-700">
            Back to Cases
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/cases" className="hover:text-brand-600">Cases</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{caseData.caseNumber}</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <StatusBadge status={caseData.status} type="case" />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {caseData.caseNumber} &middot; {caseData.caseType} &middot; {caseData.clientName}
          </p>
        </div>
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          Edit Case
        </button>
      </div>

      {/* Info grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Assigned To</p>
          <p className="mt-1 text-base font-semibold text-gray-900">{caseData.assignedToName}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Court Date</p>
          <p className="mt-1 text-base font-semibold text-gray-900">
            {caseData.courtDate
              ? new Date(caseData.courtDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : "Not scheduled"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Last Updated</p>
          <p className="mt-1 text-base font-semibold text-gray-900">
            {new Date(caseData.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Notes */}
      {caseData.notes && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{caseData.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documents */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Documents ({caseDocs.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {caseDocs.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-500 text-center">No documents yet.</p>
            )}
            {caseDocs.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.uploadedByName} &middot; {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={d.category} type="case" />
              </div>
            ))}
          </div>
        </div>

        {/* Requests */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Requests ({caseRequests.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {caseRequests.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-500 text-center">No requests yet.</p>
            )}
            {caseRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.assignedToName || "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.priority} type="priority" />
                  <StatusBadge status={r.status} type="request" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
