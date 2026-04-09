type Variant = "info" | "success" | "warning" | "danger" | "neutral";

const variantStyles: Record<Variant, string> = {
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  success: "bg-green-50 text-green-700 ring-green-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  neutral: "bg-gray-50 text-gray-600 ring-gray-500/20",
};

const caseStatusVariant: Record<string, Variant> = {
  intake: "info",
  active: "success",
  discovery: "warning",
  negotiation: "info",
  litigation: "danger",
  settled: "success",
  closed: "neutral",
};

const requestStatusVariant: Record<string, Variant> = {
  pending: "warning",
  approved: "success",
  denied: "danger",
  in_progress: "info",
  completed: "success",
};

const priorityVariant: Record<string, Variant> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

export function StatusBadge({ status, type = "case" }: { status: string; type?: "case" | "request" | "priority" }) {
  const map = type === "request" ? requestStatusVariant : type === "priority" ? priorityVariant : caseStatusVariant;
  const variant = map[status] || "neutral";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantStyles[variant]}`}
    >
      {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
