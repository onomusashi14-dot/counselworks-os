"use client";

import Link from "next/link";

const BLOCKED = new Set(["blocked", "awaiting_client", "on_hold"]);
const WARN = new Set([
  "pending_approval",
  "in_review",
  "waiting_client",
  "triaged",
]);
const OK = new Set(["active", "approved", "sent", "closed", "resolved"]);

export function statusTone(status?: string): string {
  const s = (status || "").toLowerCase();
  if (BLOCKED.has(s))
    return "bg-red-50 text-status-risk border border-red-200";
  if (WARN.has(s))
    return "bg-amber-50 text-status-warn border border-amber-200";
  if (OK.has(s))
    return "bg-emerald-50 text-status-ok border border-emerald-200";
  return "bg-ink-100 text-ink-700 border border-ink-100";
}

export function SectionCard({
  title,
  count,
  action,
  children,
  padded,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          {typeof count === "number" && (
            <span className="badge bg-ink-100 text-ink-700">{count}</span>
          )}
        </div>
        {action}
      </div>
      <div className={padded ? "p-5" : "divide-y divide-ink-100"}>
        {children}
      </div>
    </div>
  );
}

export function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-6 text-sm text-ink-500 text-center">{message}</div>
  );
}

export function ErrorRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-4 text-sm text-status-risk bg-red-50">{message}</div>
  );
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 animate-pulse">
          <div className="h-3.5 w-1/2 bg-ink-100 rounded" />
          <div className="mt-2 h-3 w-1/3 bg-ink-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  crumbs?: { href?: string; label: string }[];
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav className="text-xs text-ink-500 mb-1 flex items-center gap-1">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="hover:text-ink-700 hover:underline"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span className="text-ink-300">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold text-ink-900 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-ink-100 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            }`}
            aria-pressed={active}
          >
            <span>{o.label}</span>
            {typeof o.count === "number" && (
              <span
                className={`badge ${
                  active
                    ? "bg-brand-100 text-brand-700"
                    : "bg-white text-ink-500"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
