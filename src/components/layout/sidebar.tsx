"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: Briefcase },
  { name: "Requests", href: "/requests", icon: ClipboardList },
  { name: "Documents", href: "/documents", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-navy-800 border-r border-navy-500 flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-navy-500">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="text-gold font-bold text-xs tracking-tight">CW</span>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">
            Counsel<span className="text-gold">Works</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all group ${
                isActive
                  ? "bg-gold/10 text-gold border-l-2 border-gold -ml-[1px]"
                  : "text-slate-400 hover:text-white hover:bg-navy-700/50"
              }`}
            >
              <item.icon
                size={18}
                strokeWidth={1.8}
                className={isActive ? "text-gold" : "text-slate-500 group-hover:text-slate-300"}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-t border-navy-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy-600 border border-navy-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-slate-300">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
