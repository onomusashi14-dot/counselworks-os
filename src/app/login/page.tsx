"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Try a demo account below.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-navy-900">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-gold/0" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-gold/10 border border-gold/30 flex items-center justify-center">
              <span className="text-gold font-semibold text-sm tracking-tight">CW</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Counsel<span className="text-gold">Works</span>
            </span>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
            Legal operations,<br />
            <span className="text-gold">simplified.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            No lead missed. Instant case visibility. Blockers surfaced. Attorney-controlled approvals.
          </p>
        </div>

        <div className="relative z-10">
          {/* Decorative grid pattern */}
          <div className="flex gap-2 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-gold/20" />
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} CounselWorks. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gold/10 border border-gold/30 flex items-center justify-center">
              <span className="text-gold font-semibold text-sm">CW</span>
            </div>
            <span className="text-white font-semibold text-lg">
              Counsel<span className="text-gold">Works</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Sign in to your account</h2>
          <p className="text-slate-400 text-sm mb-8">Enter your credentials to access CounselWorks OS</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourfirm.com"
                required
                className="w-full px-4 py-3 bg-navy-800 border border-navy-500 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-navy-800 border border-navy-500 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gold hover:bg-gold-400 text-navy-900 font-semibold text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-navy-800/50 border border-navy-500">
            <p className="text-xs font-semibold text-gold/80 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Attorney:</span>
                <span className="text-slate-300 font-mono text-xs">attorney@counselintake.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Staff:</span>
                <span className="text-slate-300 font-mono text-xs">staff@counselintake.com</span>
              </div>
              <p className="text-slate-500 text-xs mt-2 pt-2 border-t border-navy-500">Any password works in demo mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
