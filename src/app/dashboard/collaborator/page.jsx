"use client";

import Link from "next/link";
import { ArrowRight, FileText, CheckCircle2, Search } from "lucide-react";
import { useCollabData } from "./_components/collab-data";

export default function CollaboratorOverviewPage() {
  const { stats, applications, loading } = useCollabData();

  if (loading)
    return <p className="text-sm text-zinc-400">Loading dashboard…</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active" value={stats.active} accent="amber" />
        <StatCard label="Accepted" value={stats.accepted} accent="emerald" />
        <StatCard label="Total applied" value={stats.total} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/collaborator/applications"
          className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-orange-400/30 hover:bg-white/10"
        >
          <FileText className="text-orange-300" />
          <h3 className="mt-2 font-bold">My Applications</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Track the status of every role you&apos;ve applied for.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-300 opacity-0 transition group-hover:opacity-100">
            Open <ArrowRight size={12} />
          </span>
        </Link>
        <Link
          href="/dashboard/collaborator/browse"
          className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-orange-400/30 hover:bg-white/10"
        >
          <Search className="text-orange-300" />
          <h3 className="mt-2 font-bold">Browse Opportunities</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Discover open roles at startups that match your skills.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-300 opacity-0 transition group-hover:opacity-100">
            Browse <ArrowRight size={12} />
          </span>
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-bold">Recent applications</h2>
        {applications.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
            No applications yet. Browse open opportunities to get started.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {applications.slice(0, 5).map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {a.opportunity?.role_title || "Role"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {a.opportunity?.startup?.startup_name || "—"}
                  </p>
                </div>
                <StatusPill status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent = null }) {
  const accentClass =
    accent === "amber"
      ? "border-amber-400/30 bg-amber-500/10"
      : accent === "emerald"
      ? "border-emerald-400/30 bg-emerald-500/10"
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

function StatusPill({ status }) {
  const map = {
    pending: "bg-amber-500/20 text-amber-200",
    reviewing: "bg-sky-500/20 text-sky-200",
    accepted: "bg-emerald-500/20 text-emerald-200",
    rejected: "bg-red-500/20 text-red-200",
    withdrawn: "bg-zinc-500/20 text-zinc-300",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        map[status] || map.pending
      }`}
    >
      {status || "pending"}
    </span>
  );
}
