"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserCircle2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { api } from "@/lib/api";

function getInitials(name = "", email = "") {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ROLE_BADGE = {
  founder: { label: "Founder", className: "border-orange-400/30 bg-orange-500/10 text-orange-200" },
  admin: { label: "Admin", className: "border-rose-400/30 bg-rose-500/10 text-rose-200" },
  collaborator: {
    label: "Collaborator",
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect to /login if not signed in.
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/profile")}`
      );
    }
  }, [user, sessionLoading, router]);

  // Pull the freshest record from the API.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/users/me");
        if (!cancelled) setProfile(res.data || user);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setProfile(user); // fall back to session
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const display = profile || user || {};
  const role = display.role || "collaborator";
  const badge = ROLE_BADGE[role] || ROLE_BADGE.collaborator;
  const initials = useMemo(
    () => getInitials(display.name, display.email),
    [display.name, display.email]
  );

  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "founder"
      ? "/dashboard/founder"
      : "/dashboard/collaborator";

  if (sessionLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href={dashboardHref}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
          {/* Hero / cover */}
          <div className="relative h-32 bg-linear-to-r from-orange-500 via-amber-400 to-rose-500 sm:h-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
          </div>

          <div className="px-6 pb-8 sm:px-8">
            {/* Avatar + name */}
            <div className="-mt-14 flex flex-col items-start gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-zinc-950 bg-linear-to-br from-orange-500 to-amber-400 text-2xl font-black text-white shadow-xl shadow-orange-500/30 sm:h-28 sm:w-28 sm:text-3xl">
                  {display.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={display.image}
                      alt={display.name || "Profile"}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {display.name || display.email || "Your profile"}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                    Member of Code2Startup
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.className}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {badge.label}
                {role === "founder" && (
                  <Crown className="ml-1 h-3.5 w-3.5 text-amber-300" />
                )}
              </span>
            </div>

            {/* Details grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <DetailCard
                icon={UserCircle2}
                label="Display name"
                value={display.name || "Not set"}
              />
              <DetailCard icon={Mail} label="Email" value={display.email || "—"} />
              <DetailCard
                icon={ShieldCheck}
                label="Role"
                value={badge.label}
              />
              <DetailCard
                icon={Loader2}
                label="Status"
                value={display.isBlocked ? "Blocked" : "Active"}
              />
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Couldn&apos;t reach the server for fresh profile data ({error}). Showing cached values.
              </div>
            )}

            {loading && !profile && (
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                Loading latest profile…
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
              >
                Go to dashboard
              </Link>
              <Link
                href="/browse-startups"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                Browse startups
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 break-words text-base font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
