"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-navy-900">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
        <span className="text-sm text-slate-400 tracking-wide">Loading CounselWorks OS...</span>
      </div>
    </div>
  );
}
