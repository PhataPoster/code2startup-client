"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import { useSession } from "@/lib/use-session";
import {
  DashboardSideNav,
  DashboardSideNavProvider,
  DashboardSideNavTrigger,
} from "@/components/dashboard/SideNavbar";
import { AdminDataProvider } from "./_components/admin-data";

export default function AdminLayout({ children }) {
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

  if (user.role !== "admin") {
    // Send the user to a dedicated "no access" page so they understand
    // *why* they were redirected rather than being silently shipped to
    // their own dashboard.
    const from =
      typeof window !== "undefined"
        ? encodeURIComponent(window.location.pathname + window.location.search)
        : "";
    router.replace(`/unauthorized?from=${from}`);
    return <DashboardSkeleton />;
  }

  const payment = searchParams.get("payment");

  return (
    <AdminDataProvider>
      <DashboardSideNavProvider>
        <div className="flex min-h-screen bg-zinc-950 text-white">
          <DashboardSideNav />
          <div className="flex min-w-0 flex-1 flex-col">
            {payment === "success" && (
              <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200 sm:px-6">
                Payment received.
              </div>
            )}
            <header className="flex items-center gap-3 border-b border-white/10 bg-zinc-950/60 px-4 py-3 backdrop-blur sm:px-6">
              <DashboardSideNavTrigger />
              <Shield className="h-5 w-5 shrink-0 text-rose-300" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Admin workspace
                </p>
                <p className="truncate font-bold">{user.name || user.email}</p>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </DashboardSideNavProvider>
    </AdminDataProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
    </div>
  );
}