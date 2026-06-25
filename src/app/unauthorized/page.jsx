"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  ShieldAlert,
  ChevronRight,
  Lock,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { toast } from "@/lib/toast";

const ROLE_LABEL = {
  founder: "Founder",
  admin: "Admin",
  collaborator: "Collaborator",
};

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedInner />
    </Suspense>
  );
}

function UnauthorizedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSession();

  const attemptedPath = searchParams.get("from") || "";
  const userRole = user?.role || "";
  const userRoleLabel = ROLE_LABEL[userRole] || (userRole ? userRole : "Visitor");

  // One-shot toast on mount so the user gets immediate feedback even
  // if they don't read the page body. Safe to fire during SSR/loading
  // — useSession returns loading: true until the request resolves.
  useEffect(() => {
    toast.error("You don't have access to that area.");
  }, []);

  const ownDashboardHref = userRole
    ? `/dashboard/${userRole}`
    : "/login";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(ownDashboardHref);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      {/* Soft brand glow — same visual language as login / forgot-password. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(244,63,94,0.12),transparent_60%)]"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
        {/* Lock badge */}
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-300 shadow-lg shadow-rose-500/10">
          <Lock className="h-7 w-7" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
          403 · Access Denied
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          You can&apos;t open this page
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          {loading
            ? "Checking your account…"
            : user
              ? `Your account is signed in as a ${userRoleLabel}. This area is reserved for a different role, so we've sent you here instead.`
              : "You need to sign in with the right account to view this area."}
        </p>

        {attemptedPath && (
          <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-300" />
            <span className="truncate">
              Attempted:{" "}
              <code className="rounded bg-zinc-900/80 px-1.5 py-0.5 font-mono text-[11px] text-orange-200">
                {attemptedPath}
              </code>
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Link
              href={ownDashboardHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-linear-to-r from-orange-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
            >
              <LayoutDashboard className="h-5 w-5" />
              Go to my dashboard
            </Link>
          ) : (
            <Link
              href={
                attemptedPath
                  ? `/login?redirect=${encodeURIComponent(attemptedPath)}`
                  : "/login"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-linear-to-r from-orange-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
            >
              <LogIn className="h-5 w-5" />
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
        </div>

        {/* Role explainer */}
        <div className="mt-14 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Why am I seeing this?
          </p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
              <span>
                <span className="font-semibold text-white">Founder tools</span>{" "}
                (startups, opportunities, applications) are visible only to
                accounts with the <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-[11px] text-orange-200">founder</code> role.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
              <span>
                <span className="font-semibold text-white">Admin tools</span>{" "}
                (user management, moderation, transactions) are visible only to
                accounts with the <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-[11px] text-orange-200">admin</code> role.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>
                <span className="font-semibold text-white">Collaborator tools</span>{" "}
                (browse, apply, track applications) are available to every signed-in
                account.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
