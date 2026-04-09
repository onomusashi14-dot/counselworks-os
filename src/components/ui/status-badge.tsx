"use client";

type StatusBadgeProps = {
  status: string;
  variant?: "case" | "request" | "priority";
};

const caseStatusStyles: Record<string, string> = {
  intake: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  discovery: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  negotiation: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  litigation: "bg-red-500/10 text-red-400 border border-red-500/20",
  settled: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  closed: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

const requestStatusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  completed: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  denied: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const priorityStyles: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  high: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  urgent: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function StatusBadge({ status, variant = "case" }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(" ", "_");
  let styles = "";

  if (variant === "case") {
    styles = caseStatusStyles[key] || caseStatusStyles.active;
  } else if (variant === "request") {
    styles = requestStatusStyles[key] || requestStatusStyles.pending;
  } else {
    styles = priorityStyles[key] || priorityStyles.medium;
  }

  const label = status.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide ${styles}`}>
      {label}
    </span>
  );
}
