"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { api, clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import ApplicationCard from "./_components/ApplicationCard";
import BrowseOpportunities from "./_components/BrowseOpportunities";
import ApplyModal from "./_components/ApplyModal";

const TABS = [
  { id: "applications", label: "My Applications" },
  { id: "browse", label: "Browse Opportunities" },
];

export default function CollaboratorDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CollaboratorDashboardInner />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
    </div>
  );
}

function CollaboratorDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading } = useSession();

  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Apply modal
  const [applyTarget, setApplyTarget] = useState(null);
  const [toast, setToast] = useState(
    searchParams.get("applied")
      ? { type: "success", message: "Application submitted! 🎉" }
      : null
  );

  // ===== Auth / Role gate =====
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent("/dashboard/collaborator")}`
      );
      return;
    }
    if (user.role !== "collaborator") {
      router.push("/dashboard");
    }
  }, [user, sessionLoading, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // ===== Data fetch =====
  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      // /applications/user/:email is the existing server endpoint
      const appsRes = await api.get(`/applications/user/${user.email}`);
      const apps = appsRes.data || [];
      setApplications(apps);

      // Hydrate each application with the underlying opportunity
      const oppResults = await Promise.all(
        apps.map((a) =>
          api
            .get(`/opportunities/${a.opportunity_id}`)
            .then((r) => r.data)
            .catch(() => null)
        )
      );
      setOpportunities(oppResults.filter(Boolean));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "collaborator") fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ===== Stats =====
  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((a) => a.status === "Pending").length,
      accepted: applications.filter((a) => a.status === "Accepted").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
    }),
    [applications]
  );

  // Map opp_id → opportunity for quick lookup in ApplicationCard
  const opportunityById = useMemo(() => {
    const map = new Map();
    for (const o of opportunities) map.set(String(o._id), o);
    return map;
  }, [opportunities]);

  // Already-applied set (passed to BrowseOpportunities)
  const appliedIds = useMemo(
    () => new Set(applications.map((a) => String(a.opportunity_id))),
    [applications]
  );

  // ===== Handlers =====
  const handleApplied = async (oppId) => {
    setToast({ type: "success", message: "Application submitted! 🎉" });
    setApplyTarget(null);
    await fetchAll();
    setTab("applications");
  };

  const withdrawApp = async (app) => {
    if (
      !confirm(
        "Withdraw this application? This cannot be undone — you'd need to reapply."
      )
    )
      return;
    setBusy(true);
    try {
      await api.delete(`/applications/${app._id}`);
      setToast({ type: "success", message: "Application withdrawn." });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
    clearAuthToken();
    router.push("/login");
  };

  if (sessionLoading) return <DashboardSkeleton />;
  if (!user || user.role !== "collaborator") return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Collaborator Dashboard
            </h1>
            <p className="mt-1 text-zinc-400">
              Welcome back, {user.name || "Collaborator"} — discover your next
              opportunity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/browse-startups"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Search size={14} /> Browse Startups
            </a>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500/15 hover:text-rose-200"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              toast.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-amber-400/30 bg-amber-500/10 text-amber-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {toast.message}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Briefcase}
            label="Total Apps"
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            accent="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="Accepted"
            value={stats.accepted}
            accent="emerald"
          />
          <StatCard
            icon={AlertCircle}
            label="Rejected"
            value={stats.rejected}
            accent="rose"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.id
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-linear-to-r from-orange-500 to-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* ===== Applications tab ===== */}
        {tab === "applications" && (
          <section className="space-y-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                title="No applications yet"
                body="Browse open opportunities and apply to the roles that match your skills."
                cta="Browse Opportunities"
                onCta={() => setTab("browse")}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {applications.map((a) => (
                  <ApplicationCard
                    key={a._id}
                    application={a}
                    opportunity={opportunityById.get(String(a.opportunity_id))}
                    onWithdraw={withdrawApp}
                    busy={busy}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ===== Browse tab ===== */}
        {tab === "browse" && (
          <BrowseOpportunities
            onApply={(o) => setApplyTarget(o)}
            appliedIds={appliedIds}
          />
        )}

        {/* Apply modal */}
        {applyTarget && (
          <ApplyModal
            opportunity={applyTarget}
            onCancel={() => setApplyTarget(null)}
            onApplied={handleApplied}
          />
        )}
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, accent = null }) {
  const accentClass =
    accent === "amber"
      ? "border-amber-400/30 bg-amber-500/10"
      : accent === "emerald"
      ? "border-emerald-400/30 bg-emerald-500/10"
      : accent === "rose"
      ? "border-rose-400/30 bg-rose-500/10"
      : "border-white/10 bg-white/5";
  return (
    <div className={`rounded-2xl border p-5 ${accentClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        {Icon && <Icon size={14} className="text-zinc-500" />}
      </div>
      <p className="mt-1.5 text-3xl font-black">{value}</p>
    </div>
  );
}

function EmptyState({ title, body, cta, onCta }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{body}</p>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
