"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogOut, Shield } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import { DashboardSideNav } from "@/components/dashboard/SideNavbar";
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
    router.replace(`/dashboard/${user.role || "collaborator"}`);
    return <DashboardSkeleton />;
  }

  const payment = searchParams.get("payment");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("sign-out failed", e);
    }
    clearAuthToken();
    try {
      localStorage.removeItem("user");
    } catch {}
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  return (
    <AdminDataProvider>
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <DashboardSideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          {payment === "success" && (
            <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-6 py-2.5 text-sm text-emerald-200">
              Payment received.
            </div>
          )}
          <header className="flex items-center justify-between border-b border-white/10 bg-zinc-950/60 px-6 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-rose-300" />
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Admin workspace
                </p>
                <p className="font-bold">{user.name || user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/5"
            >
              <LogOut size={14} /> Sign out
            </button>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
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