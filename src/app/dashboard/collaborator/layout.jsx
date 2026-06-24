"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { DashboardSideNav } from "@/components/dashboard/SideNavbar";
import { CollabDataProvider } from "./_components/collab-data";

export default function CollaboratorLayout({ children }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthShell>{children}</AuthShell>
    </Suspense>
  );
}

function AuthShell({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSession();

  if (loading) return <DashboardSkeleton />;

  if (!user) {
    const redirect =
      typeof window !== "undefined"
        ? encodeURIComponent(window.location.pathname + window.location.search)
        : "";
    router.replace(`/login?redirect=${redirect}`);
    return <DashboardSkeleton />;
  }

  if (user.role !== "collaborator") {
    router.replace(`/dashboard/${user.role || "founder"}`);
    return <DashboardSkeleton />;
  }

  const payment = searchParams.get("payment");

  return (
    <CollabDataProvider>
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <DashboardSideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          {payment === "success" && (
            <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-6 py-2.5 text-sm text-emerald-200">
              Payment successful — your premium perks are now active.
            </div>
          )}
          {payment === "cancel" && (
            <div className="border-b border-amber-400/20 bg-amber-500/10 px-6 py-2.5 text-sm text-amber-200">
              Checkout cancelled. You haven&apos;t been charged.
            </div>
          )}
          <header className="border-b border-white/10 bg-zinc-950/60 px-6 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Collaborator workspace
            </p>
            <p className="font-bold">{user.name || user.email}</p>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </CollabDataProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
    </div>
  );
}