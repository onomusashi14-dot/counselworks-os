"use client";

import AppShell from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";
import { mockStats, mockCases, mockRequests, mockNotifications } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

const statCards = [
  { label: "Active Cases", key: "activeCases" as const, color: "bg-brand-50 text-brand-700" },
  { label: "Pending Requests", key: "pendingRequests" as const, color: "bg-amber-50 text-amber-700" },
  { label: "Docs This Week", key: "documentsThisWeek" as const, color: "bg-green-50 text-green-700" },
  { label: "Upcoming Deadlines", key: "upcomingDeadlines" as const, color: "bg-red-50 text-red-700" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const recentCases = mockCases.slice(0, 4);
  const pendingRequests = mockRequests.filter((r) => r.status === "pending" || r.status === "in_progress").slice(0, 4);
  const unreadNotifications = mockNotifications.filter((n) => !n.read);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening across your cases today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{mockStats[card.key]}</p>
          </div>
        ))}
      </div>

      {/* Notifications banner */}
      {unreadNotifications.length > 0 && (
        <div className="mb-8 space-y-2">
          {unreadNotifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                n.type === "warning"
                  ? "bg-amber-50 text-amber-800"
                  : n.type === "action"
                  ? "bg-blue-50 text-blue-800"
                  : n.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              <span className="flex-1">{n.message}</span>
              <span className="text-xs opacity-60">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Cases */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Cases</h2>
            <Link href="/cases" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">
                    {c.caseNumber} &middot; {c.clientName}
                  </p>
                </div>
                <StatusBadge status={c.status} type="case" />
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Active Requests</h2>
            <Link href="/requests" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500">
                    {r.caseTitle} &middot; {r.assignedToName || "Unassigned"}
                  </p>
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
