"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-700 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">
              CW
            </div>
            <span className="text-2xl font-semibold">CounselWorks</span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Legal operations,
            <br />
            simplified.
          </h1>
          <p className="mt-4 text-lg text-brand-200 max-w-md">
            No lead missed. Instant case visibility. Blockers surfaced. Attorney-controlled approvals.
          </p>
        </div>
        <p className="text-sm text-brand-300">&copy; 2026 CounselWorks. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white text-lg font-bold">
              CW
            </div>
            <span className="text-2xl font-semibold text-gray-900">CounselWorks</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access CounselWorks OS
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                placeholder="you@yourfirm.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 rounded-lg bg-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Demo accounts</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Attorney:</span> attorney@counselintake.com
              </p>
              <p>
                <span className="font-medium">Staff:</span> staff@counselintake.com
              </p>
              <p className="text-xs text-gray-400 mt-1">Any password works in demo mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
