"use client";

import { useMemo } from "react";
import ApplicationRow from "../_components/ApplicationRow";
import { useFounderData } from "../_components/founder-data";

export default function FounderApplicationsPage() {
  const {
    applications,
    opportunities,
    updateApplicationStatus,
    loading,
    error,
  } = useFounderData();

  const grouped = useMemo(() => {
    const map = new Map();
    for (const app of applications) {
      const key = app.opportunity_id || app.opportunity?._id || "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(app);
    }
    return Array.from(map.entries()).map(([opportunityId, apps]) => {
      const opp = opportunities.find((o) => o._id === opportunityId);
      return { opportunity: opp, apps };
    });
  }, [applications, opportunities]);

  if (loading) return <p className="text-sm text-zinc-400">Loading applications…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Applications</h1>

      {applications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          No applications yet. Once collaborators apply to your roles they will
          appear here.
        </p>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ opportunity, apps }) => (
            <section
              key={opportunity?._id || "unknown"}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="font-bold text-white">
                    {opportunity?.role_title || "Unknown role"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {opportunity?.startup?.startup_name || "—"} · {apps.length}{" "}
                    applicant{apps.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  {opportunity?.work_type || "—"}
                </span>
              </header>
              <ul className="divide-y divide-white/5">
                {apps.map((app) => (
                  <ApplicationRow
                    key={app._id}
                    application={app}
                    onChanged={(id, status) =>
                      updateApplicationStatus(id, status)
                    }
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
