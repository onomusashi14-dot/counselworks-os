"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import StatusBadge from "@/components/ui/status-badge";
import { mockCases } from "@/lib/mock-data";
import { Case } from "@/types";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

const statuses = ["All", "Intake", "Active", "Discovery", "Negotiation", "Litigation", "Settled", "Closed"];

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setCases(mockCases);
  }, []);

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || c.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cases</h1>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} total cases</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-400 text-navy-900 text-sm font-semibold transition-colors">
          <Plus size={16} strokeWidth={2} />
          New Case
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-500 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "text-slate-400 hover:text-white border border-transparent hover:border-navy-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-800 border border-navy-500 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-500">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Case</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Court Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-600/50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-navy-700/30 transition-colors">
                <td className="px-5 py-4">
                  <Link href={`/cases/${c.id}`} className="group">
                    <p className="text-sm font-medium text-white group-hover:text-gold transition-colors">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.caseNumber}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">{c.client}</td>
                <td className="px-5 py-4 text-sm text-slate-400">{c.type}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={c.status} variant="case" />
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">{c.assignedAttorney}</td>
                <td className="px-5 py-4 text-sm text-slate-400">
                  {c.courtDate ? new Date(c.courtDate).toLocaleDateString() : <span className="text-slate-600">&mdash;</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">No cases found matching your criteria.</div>
        )}
      </div>
    </AppShell>
  );
}
