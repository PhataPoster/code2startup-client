"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { Crown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { DashboardSideNav } from "@/components/dashboard/SideNavbar";
import { FounderDataProvider, useFounderData } from "./_components/founder-data";

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
    </div>
  );
}

export default function FounderLayout({ children }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <FounderLayoutInner>{children}</FounderLayoutInner>
    </Suspense>
  );
}

function FounderLayoutInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: sessionLoading } = useSession();
  const [toast, setToast] = useState(null);

  // ===== Auth / Role gate =====
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== "founder") {
      router.push("/dashboard");
    }
  }, [user, sessionLoading, router, pathname]);

  // ===== Toast for payment return =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      setToast({ type: "success", message: "Payment successful — Premium unlocked!" });
    } else if (paymentStatus === "cancel") {
      setToast({ type: "warning", message: "Payment cancelled." });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  if (sessionLoading || !user || user.role !== "founder") {
    return <DashboardSkeleton />;
  }

  return (
    <FounderDataProvider user={user}>
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <DashboardSideNav />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <DashboardHeader />
            {toast && <Toast tone={toast.type}>{toast.message}</Toast>}
            <ErrorBanner />
            {children}
          </div>
        </main>
      </div>
    </FounderDataProvider>
  );
}

function DashboardHeader() {
  const { user, isPremium } = useFounderData();
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Founder Dashboard
        </h1>
        <p className="mt-1 flex items-center gap-2 text-zinc-400">
          Welcome back, {user.name || "Founder"}
          {isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
              <Crown size={11} /> Premium
            </span>
          )}
        </p>
      </div>
    </header>
  );
}

function Toast({ tone, children }) {
  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
        tone === "success"
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : "border-amber-400/30 bg-amber-500/10 text-amber-200"
      }`}
    >
      {tone === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {children}
    </div>
  );
}

function ErrorBanner() {
  const { error } = useFounderData();
  if (!error) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
      <AlertCircle size={16} /> {error}
    </div>
  );
}

