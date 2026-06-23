"use client";

import { Pencil, Trash2, Users, Clock } from "lucide-react";

export default function OpportunityCard({
  opportunity,
  appCount = 0,
  onEdit,
  onDelete,
  onViewApps,
  busy,
}) {
  const startup = opportunity.startup;
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">
            {opportunity.role_title}
          </h3>
          {startup && (
            <p className="truncate text-sm text-zinc-400">
              at {startup.startup_name}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
          {opportunity.work_type || "Full-time"}
        </span>
      </div>

      {opportunity.required_skills && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opportunity.required_skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 5)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-200"
              >
                {skill}
              </span>
            ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} /> {appCount} application{appCount === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} />
          {opportunity.deadline
            ? `Closes ${new Date(opportunity.deadline).toLocaleDateString()}`
            : "Open"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onViewApps(opportunity)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          <Users size={13} /> Applications
        </button>
        <button
          type="button"
          onClick={() => onEdit(opportunity)}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:opacity-60"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(opportunity)}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}