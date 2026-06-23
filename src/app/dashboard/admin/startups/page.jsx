"use client";

import StartupModerationCard from "../_components/StartupModerationCard";
import { useAdminData } from "../_components/admin-data";

export default function AdminStartupsPage() {
  const {
    startups,
    opportunities,
    toggleStartupStatus,
    moderateOpportunity,
    loading,
    error,
  } = useAdminData();

  if (loading) return <p className="text-sm text-zinc-400">Loading startups…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Startups</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {startups.length} startups · {opportunities.length} opportunities
        </p>
      </div>

      {startups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          No startups to moderate yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {startups.map((s) => {
            const opps = opportunities.filter(
              (o) => o.startup_id === s._id || o.startup?._id === s._id
            );
            return (
              <StartupModerationCard
                key={s._id}
                startup={s}
                opportunities={opps}
                onToggle={() => toggleStartupStatus(s)}
                onToggleOpp={(opp) => moderateOpportunity(opp)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}