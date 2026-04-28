"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M3 12 12 4l9 8M5 10v10h14V10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/leads",
    label: "Leads",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/cases",
    label: "Cases",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 7h16v12H4zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/requests",
    label: "Requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 5h16v11H7l-3 3zM8 10h8M8 13h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/drafts",
    label: "Drafts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M7 3h8l5 5v13H7zM15 3v5h5M9 13h6M9 17h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function initials(name?: string, email?: string) {
  const src = (name || email || "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, ready, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center text-ink-500 text-sm">
        Loadingâ¦
      </div>
    );
  }
  if (!session) return null;

  const user = session.user;

  return (
    <div className="min-h-screen flex bg-ink-100/40">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-brand-900 text-brand-100">
        <div className="flex items-center gap-2 px-5 py-5 text-white">
          <div className="h-8 w-8 rounded-lg bg-brand-500 grid place-items-center font-bold">
            C
          </div>
          <span className="font-semibold tracking-tight">CounselWorks</span>
        </div>
        <nav className="px-3 py-2 grid gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-brand-700 text-white"
                    : "text-brand-100 hover:bg-brand-800 hover:text-white"
                }`}
              >
                <span className="opacity-90">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <div className="rounded-lg bg-brand-800/60 p-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-500 grid place-items-center text-white font-semibold">
                {initials(user.name, user.email)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-white">
                  {user.name || user.email}
                </div>
                <div className="truncate text-brand-200 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="mt-3 w-full rounded-md border border-brand-700 bg-brand-800 px-2 py-1.5 text-brand-100 hover:bg-brand-700 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile drawer */}
      {sidebarOpen && (
        <aside className="fixed left-0 top-0 bottom-0 w-60 z-50 flex flex-col bg-brand-900 text-brand-100 lg:hidden">
          <div className="flex items-center justify-between px-5 py-5 text-white">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500 grid place-items-center font-bold">
                C
              </div>
              <span className="font-semibold tracking-tight">CounselWorks</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-brand-200 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <nav className="px-3 py-2 grid gap-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-brand-700 text-white"
                      : "text-brand-100 hover:bg-brand-800 hover:text-white"
                  }`}
                >
                  <span className="opacity-90">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-3">
            <div className="rounded-lg bg-brand-800/60 p-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-500 grid place-items-center text-white font-semibold">
                  {initials(user.name, user.email)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-white">
                    {user.name || user.email}
                  </div>
                  <div className="truncate text-brand-200 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="mt-3 w-full rounded-md border border-brand-700 bg-brand-800 px-2 py-1.5 text-brand-100 hover:bg-brand-700 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-ink-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="text-ink-700 hover:text-ink-900 mr-1">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <div className="h-7 w-7 rounded-md bg-brand-600 grid place-items-center text-white font-bold">
              C
            </div>
            <span className="font-semibold text-ink-900">CounselWorks</span>
          </div>
          <button onClick={signOut} className="text-sm text-ink-500">
            Sign out
          </button>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
