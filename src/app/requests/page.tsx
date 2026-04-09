"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import StatusBadge from "@/components/ui/status-badge";
import { useAuth } from "@/context/auth-context";
import { mockRequests } from "@/lib/mock-data";
import { Request } from "@/types";
import { Search, Plus, Check, X } from "lucide-react";

const statuses = ["All", "Pending", "Approved", "In Progress", "Completed", "Denied"];

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setRequests(mockRequests);
  }, []);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.caseName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      r.status.toLowerCase().replace("_", " ") === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const isAttorney = user?.role === "attorney";

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Requests</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} total requests {pendingCount > 0 && <span className="text-gold">&middot; {pendingCount} pending approval</span>}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-400 text-navy-900 text-sm font-semibold transition-colors">
          <Plus size={16} strokeWidth={2} />
          New Request
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search requests..."
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

      {/* Request Cards */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-navy-800 border border-navy-500 p-5 hover:border-navy-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                  <StatusBadge status={r.priority} variant="priority" />
                  <StatusBadge status={r.status} variant="request" />
                </div>
                <p className="text-sm text-slate-400 mb-3">{r.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{r.caseName}</span>
                  <span>&middot;</span>
                  <span>Requested by {r.requestedBy}</span>
                  <span>&middot;</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  {r.assignedTo && (
                    <>
                      <span>&middot;</span>
                      <span>Assigned to {r.assignedTo}</span>
                    </>
                  )}
                </div>
              </div>

              {isAttorney && r.status === "pending" && (
                <div className="flex items-center gap-2 ml-6 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                    <Check size={14} />
                    Approve
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-700 border border-navy-400 text-slate-300 text-xs font-semibold hover:text-red-400 hover:border-red-500/30 transition-colors">
                    <X size={14} />
                    Deny
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-navy-800 border border-navy-500 px-5 py-12 text-center text-slate-500 text-sm">
          No requests found matching your criteria.
        </div>
      )}
    </AppShell>
  );
}
