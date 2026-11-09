"use client";

import { useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";

interface UserNavProps {
  readonly session: SessionPayload | null;
}

export function UserNav({ session }: UserNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      // Ignore network errors on logout
    }
  };

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Masuk
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.role === "ADMIN" && (
        <a
          href="/admin/moderation"
          className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-950/80 dark:text-amber-300"
        >
          Moderasi
        </a>
      )}

      <a
        href="/my-reports"
        className="text-xs font-medium text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400"
      >
        Laporan Saya
      </a>

      <span className="hidden text-xs text-slate-600 sm:inline dark:text-slate-400">
        {session.email}
      </span>

      <button
        onClick={handleLogout}
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Keluar
      </button>
    </div>
  );
}
