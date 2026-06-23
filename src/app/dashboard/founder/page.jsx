"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  LogOut,
  Crown,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { api, clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import StartupForm from "./_components/StartupForm";
import StartupCard from "./_components/StartupCard";
import OpportunityForm from "./_components/OpportunityForm";
import OpportunityCard from "./_components/OpportunityCard";
import ApplicationRow from "./_components/ApplicationRow";

const TABS = [
  { id: "startups", label: "Startups" },
  { id: "opportunities", label: "Opportunities" },
  { id: "applications", label: "Applications" },
];

const FREE_OPP_LIMIT = 3;

export default function FounderDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <FounderDashboardInner />
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

function FounderDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading, refresh: refreshSession } = useSession();

  const [tab, setTab] = useState("startups");
  const [startups, setStartups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Premium status
  const [isPremium, setIsPremium] = useState(false);

  // Form modes
  const [startupFormMode, setStartupFormMode] = useState("closed"); // "closed" | "new" | { startup }
  const [oppFormMode, setOppFormMode] = useState("closed");
  const [busy, setBusy] = useState(false);

  // Application viewer
  const [selectedOpp, setSelectedOpp] = useState(null);

  // ===== Auth / Role gate =====
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent("/dashboard/founder")}`
      );
      return;
    }
    if (user.role !== "founder") {
      router.push("/dashboard");
    }
  }, [user, sessionLoading, router]);

  // ===== Toast for payment return =====
  const paymentStatus = searchParams.get("payment");
  const [toast, setToast] = useState(
    paymentStatus === "success"
      ? { type: "success", message: "Payment successful — Premium unlocked!" }
      : paymentStatus === "cancel"
      ? { type: "warning", message: "Payment cancelled." }
      : null
  );
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // ===== Data fetching =====
  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [startupsRes, appsRes, premiumRes] = await Promise.all([
        api.get("/startups"),
        // Fetch a large slice so per-opp views have full data.
        // Server still returns pagination metadata for free.
        api.get("/applications/founder?limit=100"),
        api.get("/payments/status").catch(() => ({ data: { isPremium: false } })),
      ]);
      const mine = (startupsRes.data || []).filter(
        (s) => s.founder_email === user.email
      );
      setStartups(mine);
      setApplications(appsRes.data || []);
      setIsPremium(!!premiumRes?.data?.isPremium);

      // Fetch opportunities for each of my startups
      const oppResults = await Promise.all(
        mine.map((s) =>
          api
            .get(`/opportunities?startup_id=${s._id}&limit=50`)
            .then((r) => (r.data || []).map((o) => ({ ...o, startup: s })))
            .catch(() => [])
        )
      );
      setOpportunities(oppResults.flat());
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "founder") fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ===== Counts =====
  const stats = useMemo(
    () => ({
      startups: startups.length,
      opportunities: opportunities.length,
      pendingApps: applications.filter((a) => a.status === "Pending").length,
      totalApps: applications.length,
    }),
    [startups, opportunities, applications]
  );

  const oppCountByStartup = useMemo(() => {
    const map = {};
    for (const o of opportunities) {
      const k = String(o.startup_id);
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [opportunities]);

  const totalOppCount = opportunities.length;
  const hitsFreeLimit = totalOppCount >= FREE_OPP_LIMIT;

  // ===== Startup handlers =====
  const submitStartup = async (payload) => {
    setBusy(true);
    setError("");
    try {
      if (startupFormMode === "new") {
        await api.post("/startups", payload);
        setToast({ type: "success", message: "Startup created!" });
      } else if (typeof startupFormMode === "object" && startupFormMode?._id) {
        await api.put(`/startups/${startupFormMode._id}`, payload);
        setToast({ type: "success", message: "Startup updated!" });
      }
      setStartupFormMode("closed");
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteStartup = async (startup) => {
    if (!confirm(`Delete "${startup.startup_name}" and all its opportunities?`))
      return;
    setBusy(true);
    try {
      await api.delete(`/startups/${startup._id}`);
      setToast({ type: "success", message: "Startup deleted" });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ===== Opportunity handlers =====
  const submitOpportunity = async (payload) => {
    setBusy(true);
    setError("");
    try {
      if (oppFormMode === "new") {
        await api.post("/opportunities", payload);
        setToast({ type: "success", message: "Opportunity posted!" });
      } else if (typeof oppFormMode === "object" && oppFormMode?._id) {
        await api.put(`/opportunities/${oppFormMode._id}`, payload);
        setToast({ type: "success", message: "Opportunity updated!" });
      }
      setOppFormMode("closed");
      await fetchAll();
    } catch (err) {
      // 402 PREMIUM_REQUIRED
      if (err.status === 402) {
        setError(
          "Free plan limit reached. Upgrade to Premium to post unlimited opportunities."
        );
        setTimeout(() => router.push("/pricing"), 1500);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteOpportunity = async (opp) => {
    if (!confirm(`Delete opportunity "${opp.role_title}"?`)) return;
    setBusy(true);
    try {
      await api.delete(`/opportunities/${opp._id}`);
      setToast({ type: "success", message: "Opportunity deleted" });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ===== Application handlers =====
  const onAppChanged = (appId, newStatus) => {
    setApplications((apps) =>
      apps.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );
    if (newStatus !== "Pending") {
      setToast({
        type: "success",
        message: `Application ${newStatus.toLowerCase()}.`,
      });
    }
  };

  const appsForSelected = useMemo(() => {
    if (!selectedOpp) return [];
    return applications.filter(
      (a) => String(a.opportunity_id) === String(selectedOpp._id)
    );
  }, [applications, selectedOpp]);

  // ===== Logout =====
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
  if (!user || user.role !== "founder") return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
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

        {/* Premium banner */}
        {!isPremium && (
          <div
            className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
              hitsFreeLimit
                ? "border-amber-400/40 bg-amber-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Crown
                className={hitsFreeLimit ? "text-amber-300" : "text-zinc-400"}
                size={22}
              />
              <div>
                <p className="font-bold">
                  {hitsFreeLimit
                    ? "Free limit reached"
                    : "Free plan in use"}
                </p>
                <p className="text-xs text-zinc-400">
                  {totalOppCount} / {isPremium ? "∞" : FREE_OPP_LIMIT} opportunities
                  posted
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/pricing")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:from-amber-400 hover:to-orange-400"
            >
              <Crown size={14} /> Upgrade to Premium
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Startups" value={stats.startups} />
          <StatCard label="Opportunities" value={stats.opportunities} />
          <StatCard
            label="Pending Apps"
            value={stats.pendingApps}
            accent={stats.pendingApps > 0 ? "amber" : null}
          />
          <StatCard label="Total Apps" value={stats.totalApps} />
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
              {t.id === "applications" && stats.pendingApps > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">
                  {stats.pendingApps}
                </span>
              )}
              {tab === t.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-linear-to-r from-orange-500 to-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* ===== Startups tab ===== */}
        {tab === "startups" && (
          <section className="space-y-6">
            {startupFormMode !== "closed" && (
              <StartupForm
                initial={typeof startupFormMode === "object" ? startupFormMode : null}
                onSubmit={submitStartup}
                onCancel={() => setStartupFormMode("closed")}
                busy={busy}
              />
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">My Startups</h2>
              {startupFormMode === "closed" && (
                <button
                  onClick={() => setStartupFormMode("new")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  <Plus size={14} /> Add Startup
                </button>
              )}
            </div>

            {startups.length === 0 ? (
              <EmptyState
                title="No startups yet"
                body="Create your first startup to start posting opportunities."
                cta="Add Startup"
                onCta={() => setStartupFormMode("new")}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {startups.map((s) => (
                  <StartupCard
                    key={s._id}
                    startup={s}
                    onEdit={(x) => setStartupFormMode(x)}
                    onDelete={deleteStartup}
                    busy={busy}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ===== Opportunities tab ===== */}
        {tab === "opportunities" && (
          <section className="space-y-6">
            {oppFormMode !== "closed" && (
              <OpportunityForm
                initial={typeof oppFormMode === "object" ? oppFormMode : null}
                startups={startups}
                onSubmit={submitOpportunity}
                onCancel={() => setOppFormMode("closed")}
                busy={busy}
              />
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">My Opportunities</h2>
              {oppFormMode === "closed" && (
                <button
                  onClick={() => {
                    if (hitsFreeLimit && !isPremium) {
                      setError(
                        "Free plan limit reached. Please upgrade to Premium."
                      );
                      setTimeout(() => router.push("/pricing"), 1200);
                      return;
                    }
                    if (startups.length === 0) {
                      setError(
                        "Create a startup first before posting opportunities."
                      );
                      setTab("startups");
                      return;
                    }
                    setOppFormMode("new");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  <Plus size={14} /> Post Opportunity
                </button>
              )}
            </div>

            {opportunities.length === 0 ? (
              <EmptyState
                title="No opportunities yet"
                body="Post your first role to start receiving applications."
                cta="Post Opportunity"
                onCta={() => {
                  if (startups.length === 0) {
                    setTab("startups");
                    return;
                  }
                  setOppFormMode("new");
                }}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((o) => {
                  const appCount = applications.filter(
                    (a) => String(a.opportunity_id) === String(o._id)
                  ).length;
                  return (
                    <OpportunityCard
                      key={o._id}
                      opportunity={o}
                      appCount={appCount}
                      onEdit={(x) => setOppFormMode(x)}
                      onDelete={deleteOpportunity}
                      onViewApps={(x) => {
                        setSelectedOpp(x);
                        setTab("applications");
                      }}
                      busy={busy}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ===== Applications tab ===== */}
        {tab === "applications" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Applications</h2>
              {selectedOpp && (
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  ← Show all
                </button>
              )}
            </div>

            {selectedOpp && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <span className="text-zinc-400">Filtering by:</span>{" "}
                <span className="font-bold text-white">
                  {selectedOpp.role_title}
                </span>{" "}
                <span className="text-zinc-500">·</span>{" "}
                <span className="text-zinc-300">
                  {selectedOpp.startup?.startup_name}
                </span>
              </div>
            )}

            {applications.length === 0 ? (
              <EmptyState
                title="No applications yet"
                body="Once collaborators apply to your opportunities, they'll show up here."
              />
            ) : (
              <div className="space-y-3">
                {appsForSelected.length === 0 && selectedOpp ? (
                  <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                    No applications for this opportunity yet.
                  </p>
                ) : (
                  appsForSelected.map((a) => (
                    <ApplicationRow
                      key={a._id}
                      application={a}
                      onChanged={onAppChanged}
                    />
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent = null }) {
  const accentClass =
    accent === "amber"
      ? "border-amber-400/30 bg-amber-500/10"
      : "border-white/10 bg-white/5";
  return (
    <div className={`rounded-2xl border p-5 ${accentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
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
          <Plus size={14} /> {cta}
        </button>
      )}
    </div>
  );
}
