"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import StatusBadge from "@/components/ui/status-badge";
import { useAuth } from "@/context/auth-context";
import { mockCases, mockRequests, mockNotifications, mockDashboardStats } from "@/lib/mock-data";
import { Case, Request, Notification, DashboardStats } from "@/types";
import { TrendingUp, Clock, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);

  useEffect(() => {
    setStats(mockDashboardStats);
    setNotifications(mockNotifications.slice(0, 3));
    setRecentCases(mockCases.slice(0, 4));
    setActiveRequests(mockRequests.filter((r) => r.status !== "completed").slice(0, 3));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = stats
    ? [
        { label: "Active Cases", value: stats.activeCases, icon: TrendingUp, accent: "text-gold" },
        { label: "Pending Requests", value: stats.pendingRequests, icon: Clock, accent: "text-amber-400" },
        { label: "Docs This Week", value: stats.documentsThisWeek, icon: FileText, accent: "text-blue-400" },
        { label: "Upcoming Deadlines", value: stats.upcomingDeadlines, icon: AlertTriangle, accent: "text-red-400" },
      ]
    : [];

  const notificationStyles: Record<string, string> = {
    warning: "border-l-amber-500 bg-amber-500/5",
    success: "border-l-emerald-500 bg-emerald-500/5",
    info: "border-l-blue-500 bg-blue-500/5",
    urgent: "border-l-red-500 bg-red-500/5",
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {greeting()}, {user?.firstName}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here&apos;s what&apos;s happening across your cases today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-navy-800 border border-navy-500 p-5 hover:border-navy-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{card.label}</span>
              <card.icon size={18} strokeWidth={1.5} className={card.accent} />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2 mb-8">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`border-l-2 px-4 py-3 flex items-center justify-between ${
                notificationStyles[n.type] || notificationStyles.info
              }`}
            >
              <span className="text-sm text-slate-300">{n.message}</span>
              <span className="text-xs text-slate-500 ml-4 flex-shrink-0">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Two columns: Recent Cases + Active Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-navy-800 border border-navy-500">
          <div className="flex items-center justify-between px-5 py-4 border-b border-navy-500">
            <h2 className="text-sm font-semibold text-white tracking-wide">Recent Cases</h2>
            <Link
              href="/cases"
              className="text-xs text-gold hover:text-gold-400 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-navy-500">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-navy-700/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.caseNumber} &middot; {c.client}
                  </p>
                </div>
                <StatusBadge status={c.status} variant="case" />
              </Link>
            ))}
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-navy-800 border border-navy-500">
          <div className="flex items-center justify-between px-5 py-4 border-b border-navy-500">
            <h2 className="text-sm font-semibold text-white tracking-wide">Active Requests</h2>
            <Link
              href="/requests"
              className="text-xs text-gold hover:text-gold-400 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-navy-500">
            {activeRequests.map((r) => (
              <div key={r.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white">{r.title}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.priority} variant="priority" />
                    <StatusBadge status={r.status} variant="request" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {r.caseName} &middot; {r.assignedTo || "Unassigned"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
