"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { mockCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import type { CaseStatus } from "@/types";

const statusFilters: { label: string; value: CaseStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Intake", value: "intake" },
  { label: "Active", value: "active" },
  { label: "Discovery", value: "discovery" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Litigation", value: "litigation" },
  { label: "Settled", value: "settled" },
  { label: "Closed", value: "closed" },
];

export default function CasesPage() {
  const [filter, setFilter] = useState<CaseStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockCases.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="mt-1 text-sm text-gray-500">{mockCases.length} total cases</p>
        </div>
        <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors">
          + New Case
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cases..."
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

      {/* Cases Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Case</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Court Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <Link href={`/cases/${c.id}`} className="group">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-brand-700">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.caseNumber}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{c.clientName}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{c.caseType}</td>
                <td className="px-5 py-4"><StatusBadge status={c.status} type="case" /></td>
                <td className="px-5 py-4 text-sm text-gray-700">{c.assignedToName}</td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {c.courtDate
                    ? new Date(c.courtDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "\u2014"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500">No cases found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
