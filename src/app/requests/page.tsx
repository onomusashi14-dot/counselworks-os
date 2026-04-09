"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";
import { mockRequests } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RequestStatus } from "@/types";

const statusFilters: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Denied", value: "denied" },
];

export default function RequestsPage() {
  const { isAttorney } = useAuth();
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockRequests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            {mockRequests.length} total requests &middot;{" "}
            {mockRequests.filter((r) => r.status === "pending").length} pending approval
          </p>
        </div>
        <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors">
          + New Request
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requests..."
          className="w-full sm:w-80 rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-brand-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{r.title}</h3>
                  <StatusBadge status={r.priority} type="priority" />
                  <StatusBadge status={r.status} type="request" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{r.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {r.caseTitle && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
                      </svg>
                      {r.caseTitle}
                    </span>
                  )}
                  <span>Requested by {r.requestedByName}</span>
                  <span>
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {r.assignedToName && <span>Assigned to {r.assignedToName}</span>}
                </div>
              </div>

              {/* Attorney approval controls */}
              {isAttorney && r.status === "pending" && (
                <div className="flex items-center gap-2 ml-4">
                  <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors">
                    Approve
                  </button>
                  <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Deny
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
            No requests found.
          </div>
        )}
      </div>
    </AppShell>
  );
}
