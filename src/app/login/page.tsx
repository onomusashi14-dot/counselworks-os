"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import type { ApiError } from "@/lib/api";
import type { UserRole } from "@/lib/session";
import { useAuth } from "@/components/AuthProvider";

const ROLE_TABS: { id: UserRole; label: string; hint: string }[] = [
  {
    id: "attorney",
    label: "Attorney",
    hint: "Full access — approvals, drafts, and case ownership.",
  },
  {
    id: "staff",
    label: "Staff",
    hint: "Intake, drafting, and support workflows.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [role, setRole] = useState<UserRole>("attorney");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      const s = await login(email.trim(), password);
      if (s.user.role !== role) {
        setError(
          `This account is registered as ${s.user.role}. Switch the role tab or use the correct login.`
        );
        setSubmitting(false);
        return;
      }
      setSession(s);
      router.replace("/dashboard");
    } catch (e) {
      const err = e as ApiError;
      setError(
        err?.code === "INVALID_CREDENTIALS"
          ? "Invalid email or password."
          : err?.message || "Unable to sign in. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <section className="hidden md:flex flex-col justify-between bg-brand-900 text-white p-10">
        <div>
          <div className="flex items-center gap-2 text-brand-100">
            <div className="h-8 w-8 rounded-lg bg-brand-500 grid place-items-center font-bold">
              C
            </div>
            <span className="font-semibold tracking-tight text-white">
              CounselWorks OS
            </span>
          </div>
          <h1 className="mt-16 text-4xl font-semibold leading-tight">
            Legal operations,
            <br />
            one coherent workspace.
          </h1>
          <p className="mt-4 text-brand-100 max-w-md">
            Never miss a lead. See every case status instantly. Surface blockers
            the moment they appear. Route every approval to the attorney of
            record.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-brand-100">
          <li>— No lead missed</li>
          <li>— Instant case status visibility</li>
          <li>— Blockers visible at all times</li>
          <li>— Attorney controls all approvals</li>
        </ul>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 text-ink-900 mb-8">
            <div className="h-8 w-8 rounded-lg bg-brand-600 grid place-items-center font-bold text-white">
              C
            </div>
            <span className="font-semibold tracking-tight">
              CounselWorks OS
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-ink-900">Sign in</h2>
          <p className="mt-1 text-sm text-ink-500">
            Access your firm&rsquo;s operations dashboard.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-ink-100">
            {ROLE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRole(t.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  role === t.id
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-ink-500 hover:text-ink-700"
                }`}
                aria-pressed={role === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500">
            {ROLE_TABS.find((t) => t.id === role)?.hint}
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@firm.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : `Sign in as ${role}`}
            </button>
          </form>

          <p className="mt-6 text-xs text-ink-500">
            Having trouble signing in? Contact your firm administrator.
          </p>
        </div>
      </section>
    </main>
  );
}
