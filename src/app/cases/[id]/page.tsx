"use client";

import { use, useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import StatusBadge from "@/components/ui/status-badge";
import { mockCases, mockDocuments, mockRequests } from "@/lib/mock-data";
import { Case, Document, Request } from "@/types";
import { ArrowLeft, Calendar, User, Briefcase, FileText, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const found = mockCases.find((c) => c.id === id);
    if (found) {
      setCaseData(found);
      setDocuments(mockDocuments.filter((d) => d.caseId === id));
      setRequests(mockRequests.filter((r) => r.caseId === id));
    }
  }, [id]);

  if (!caseData) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Case not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/cases" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-gold transition-colors">
          <ArrowLeft size={14} />
          Cases
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-300">{caseData.caseNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{caseData.title}</h1>
            <StatusBadge status={caseData.status} variant="case" />
          </div>
          <p className="text-slate-400 text-sm">{caseData.caseNumber} &middot; {caseData.type}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: User, label: "Client", value: caseData.client },
          { icon: Briefcase, label: "Assigned Attorney", value: caseData.assignedAttorney },
          {
            icon: Calendar,
            label: "Court Date",
            value: caseData.courtDate
              ? new Date(caseData.courtDate).toLocaleDateString()
              : "Not scheduled",
          },
          {
            icon: Calendar,
            label: "Opened",
            value: new Date(caseData.createdAt).toLocaleDateString(),
          },
        ].map((item) => (
          <div key={item.label} className="bg-navy-800 border border-navy-500 p-4">
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={14} className="text-slate-500" strokeWidth={1.8} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="text-sm font-medium text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-navy-800 border border-navy-500">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-navy-500">
            <FileText size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white">Documents ({documents.length})</h2>
          </div>
          {documents.length > 0 ? (
            <div className="divide-y divide-navy-600/50">
              {documents.map((doc) => (
                <div key={doc.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-navy-700/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.category} &middot; {doc.uploadedBy}</p>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-slate-500">No documents for this case.</div>
          )}
        </div>

        {/* Requests */}
        <div className="bg-navy-800 border border-navy-500">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-navy-500">
            <ClipboardList size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white">Requests ({requests.length})</h2>
          </div>
          {requests.length > 0 ? (
            <div className="divide-y divide-navy-600/50">
              {requests.map((req) => (
                <div key={req.id} className="px-5 py-3.5 hover:bg-navy-700/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">{req.title}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.priority} variant="priority" />
                      <StatusBadge status={req.status} variant="request" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{req.assignedTo || "Unassigned"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-slate-500">No requests for this case.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
