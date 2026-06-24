"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Bell, Inbox } from "lucide-react";
import StartupModerationCard from "../_components/StartupModerationCard";
import { useAdminData } from "../_components/admin-data";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "Pending", label: "Awaiting review" },
  { value: "Active", label: "Approved" },
  { value: "Removed", label: "Removed" },
];

export default function AdminStartupsPage() {
  const {
    startups,
    opportunities,
    toggleStartupStatus,
    moderateOpportunity,
    loading,
    error,
    refresh,
  } = useAdminData();

  // Track which card/opp is currently being mutated so the buttons can
  // show a spinner and stay disabled until the server responds.
  const [busyStartupId, setBusyStartupId] = useState(null);
  const [busyOppId, setBusyOppId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState(null);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto-refresh when the admin lands on this page so a freshly created
  // Pending startup shows up without a manual reload. We poll quietly every
  // 30s so long as the tab is visible — cheap, and admins usually keep this
  // page open while founders are creating new startups.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (document.hidden) return;
      try {
        await refresh();
      } catch {
        /* refresh surfaces its own error via context */
      }
    };
    const interval = setInterval(tick, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      setToast({ type: "success", message: "Refreshed." });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to refresh.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const pendingCount = useMemo(
    () => startups.filter((s) => s.status === "Pending").length,
    [startups]
  );
  const removedCount = useMemo(
    () => startups.filter((s) => s.status === "Removed").length,
    [startups]
  );
  const filteredStartups = useMemo(
    () =>
      statusFilter
        ? startups.filter((s) => (s.status || "Active") === statusFilter)
        : startups,
    [startups, statusFilter]
  );

  const handleApprove = async (startup) => {
    setBusyStartupId(startup._id);
    const res = await toggleStartupStatus(startup, "Active");
    setBusyStartupId(null);
    setToast({
      type: res?.ok ? "success" : "error",
      message: res?.ok
        ? `"${startup.startup_name}" is now Active.`
        : res?.error?.message || "Failed to approve startup.",
    });
  };

  const handleRemove = async (startup) => {
    if (!confirm(`Remove "${startup.startup_name}"? This hides it from the public.`))
      return;
    setBusyStartupId(startup._id);
    const res = await toggleStartupStatus(startup, "Removed");
    setBusyStartupId(null);
    setToast({
      type: res?.ok ? "success" : "error",
      message: res?.ok
        ? `"${startup.startup_name}" removed.`
        : res?.error?.message || "Failed to remove startup.",
    });
  };

  const handleReactivate = async (startup) => {
    setBusyStartupId(startup._id);
    const res = await toggleStartupStatus(startup, "Pending");
    setBusyStartupId(null);
    setToast({
      type: res?.ok ? "success" : "error",
      message: res?.ok
        ? `"${startup.startup_name}" returned to Pending.`
        : res?.error?.message || "Failed to update startup.",
    });
  };

  const handleToggleOpp = async (opp) => {
    setBusyOppId(opp._id);
    const res = await moderateOpportunity(opp);
    setBusyOppId(null);
    setToast({
      type: res?.ok ? "success" : "error",
      message: res?.ok
        ? `Opportunity ${opp.status === "open" ? "closed" : "reopened"}.`
        : res?.error?.message || "Failed to update opportunity.",
    });
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin text-orange-300" />
        Loading startups…
      </div>
    );

  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage Startups</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {startups.length} startups · {opportunities.length} opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200"
              title={`${pendingCount} startup${pendingCount === 1 ? "" : "s"} awaiting admin review`}
            >
              <Bell className="h-3.5 w-3.5" />
              {pendingCount} awaiting review
            </span>
          )}
          {removedCount > 0 && (
            <span className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-200">
              {removedCount} removed
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh now"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-orange-400/50 bg-orange-500/15 text-orange-200"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {filteredStartups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          {statusFilter === "Pending" ? (
            <span className="inline-flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              No startups awaiting review. Nice.
            </span>
          ) : startups.length === 0 ? (
            "No startups to moderate yet."
          ) : (
            `No startups in this view.`
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredStartups.map((s) => {
            const opps = opportunities.filter(
              (o) => o.startup_id === s._id || o.startup?._id === s._id
            );
            return (
              <StartupModerationCard
                key={s._id}
                startup={s}
                opportunities={opps}
                busy={busyStartupId === s._id}
                onApprove={() => handleApprove(s)}
                onRemove={() => handleRemove(s)}
                onReactivate={() => handleReactivate(s)}
                onToggleOpp={handleToggleOpp}
                busyOppId={busyOppId}
              />
            );
          })}
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            toast.type === "error"
              ? "border-rose-400/30 bg-rose-500/15 text-rose-100"
              : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}