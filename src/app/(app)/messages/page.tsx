"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  EmptyRow,
  ErrorRow,
  LoadingRows,
  PageHeader,
  SectionCard,
  Tabs,
} from "@/components/ui";
import { useAuthedQuery } from "@/lib/useAuthed";
import { notificationsApi } from "@/lib/modules";
import type { Notification } from "@/lib/types";
import { relativeTime } from "@/lib/format";

type Filter = "unread" | "all";

function isUnread(n: Notification): boolean {
  return !n.readAt && !n.read_at;
}

function notifIcon(kind?: string): string {
  const k = (kind || "").toLowerCase();
  if (k.includes("draft") || k.includes("document")) return "\u{1F4DD}";
  if (k.includes("case")) return "\u{1F4BC}";
  if (k.includes("request") || k.includes("lead")) return "\u{1F4E8}";
  if (k.includes("assign")) return "\u{1F464}";
  if (k.includes("approve") || k.includes("approved")) return "\u2705";
  if (k.includes("reject")) return "\u274C";
  return "\u{1F514}";
}

export default function MessagesPage() {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [filter, setFilter] = useState<Filter>("unread");
  const [q, setQ] = useState("");

  const { data, error, loading } = useAuthedQuery(
    notificationsApi.list,
    token,
    "notifications"
  );

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      unread: list.filter(isUnread).length,
      all: list.length,
    };
  }, [data]);

  const visible = useMemo(() => {
    let list = data ?? [];
    if (filter === "unread") list = list.filter(isUnread);
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((n) => {
      return (
        (n.title || "").toLowerCase().includes(term) ||
        (n.message || n.body || "").toLowerCase().includes(term) ||
        (n.kind || n.type || "").toLowerCase().includes(term)
      );
    });
  }, [data, filter, q]);

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Messages"
        subtitle="Internal notifications and activity feed."
        right={
          counts.unread > 0 ? (
            <span className="badge bg-brand-100 text-brand-700">
              {counts.unread} unread
            </span>
          ) : undefined
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "unread", label: "Unread", count: counts.unread },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages"
            className="input w-64 pl-9"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="mt-5">
        <SectionCard title="Inbox" count={visible.length}>
          {loading && <LoadingRows rows={5} />}
          {error && <ErrorRow message={error} />}
          {!loading && !error && visible.length === 0 && (
            <EmptyRow
              message={
                filter === "unread"
                  ? "All caught up. No unread messages."
                  : (data?.length ?? 0) === 0
                  ? "No messages yet."
                  : "No messages match your search."
              }
            />
          )}
          {!loading && !error && visible.length > 0 && (
            <div>
              {visible.map((n) => {
                const unread = isUnread(n);
                const kind = n.kind || n.type || "";
                const link = n.url || n.link || null;
                const Wrapper = link ? "a" : "div";
                const wrapperProps = link
                  ? { href: link, className: "block" }
                  : {};
                return (
                  <Wrapper key={n.id} {...wrapperProps}>
                    <div
                      className={`flex items-start gap-3 px-5 py-4 ${
                        unread ? "bg-brand-50/40" : ""
                      } hover:bg-ink-100/40 transition`}
                    >
                      <div className="text-lg mt-0.5 shrink-0">
                        {notifIcon(kind)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={`text-sm ${
                              unread
                                ? "font-semibold text-ink-900"
                                : "text-ink-700"
                            }`}
                          >
                            {n.title || "Notification"}
                          </div>
                          <div className="text-xs text-ink-500 whitespace-nowrap shrink-0">
                            {relativeTime(n.createdAt || n.created_at)}
                          </div>
                        </div>
                        {(n.message || n.body) && (
                          <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                            {n.message || n.body}
                          </div>
                        )}
                        {kind && (
                          <div className="text-xs text-ink-400 mt-1 capitalize">
                            {kind.replace(/[_-]/g, " ")}
                          </div>
                        )}
                      </div>
                      {unread && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
