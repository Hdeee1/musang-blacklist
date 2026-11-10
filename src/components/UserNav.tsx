"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert, UserCheck } from "lucide-react";
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
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-subtle transition hover:bg-secondary"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-subtle transition hover:opacity-95"
        >
          Daftar
        </Link>
      </div>
    );
  }

  const userInitial = session.email.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {session.role === "ADMIN" && (
        <Link
          href="/admin/moderation"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Moderasi</span>
        </Link>
      )}

      <Link
        href="/my-reports"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
      >
        <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">Laporan Saya</span>
      </Link>

      <div
        className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground"
        title={session.email}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
          {userInitial}
        </span>
        <span className="max-w-[120px] truncate">{session.email}</span>
      </div>

      <button
        onClick={handleLogout}
        aria-label="Keluar dari akun"
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </div>
  );
}
