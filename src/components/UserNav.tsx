"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
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
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {session.role === "ADMIN" && (
        <Link
          href="/admin/moderation"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Moderasi
        </Link>
      )}

      <Link
        href="/my-reports"
        className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        Laporan Saya
      </Link>

      <span className="hidden text-xs text-muted-foreground md:inline">{session.email}</span>

      <button
        onClick={handleLogout}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        Keluar
      </button>
    </div>
  );
}
