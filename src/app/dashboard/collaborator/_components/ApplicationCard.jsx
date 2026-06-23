"use client";

import { ExternalLink, X, Briefcase, Calendar } from "lucide-react";

const STATUS_STYLES = {
  Pending: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  Accepted: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  Rejected: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export default function ApplicationCard({
  application,
  opportunity,
  onWithdraw,
  busy,
}) {
  const startup = opportunity?.startup || opportunity?.startup_snapshot;
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-400/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">
            {opportunity?.role_title || `Opportunity #${application.opportunity_id}`}
          </h3>
          {startup?.startup_name && (
            <p className="truncate text-sm text-zinc-400">
              at {startup.startup_name}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            STATUS_STYLES[application.status] || STATUS_STYLES.Pending
          }`}
        >
          {application.status}
        </span>
      </div>

      {opportunity?.work_type && (
        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-200">
          <Briefcase size={11} /> {opportunity.work_type}
        </span>
      )}

      {application.motivation && (
        <p className="mt-3 line-clamp-3 text-sm text-zinc-300">
          “{application.motivation}”
        </p>
      )}

      {application.portfolio_link && (
        <a
          href={application.portfolio_link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex w-fit items-center gap-1 text-xs text-orange-300 hover:text-orange-200"
        >
          <ExternalLink size={11} /> Portfolio
        </a>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={12} />
          Applied {new Date(application.applied_at || Date.now()).toLocaleDateString()}
        </span>
        {opportunity?._id && (
          <a
            href={`/opportunity/${opportunity._id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200"
          >
            <ExternalLink size={11} /> View
          </a>
        )}
      </div>

      {application.status === "Pending" && onWithdraw && (
        <button
          type="button"
          onClick={() => onWithdraw(application)}
          disabled={busy}
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
        >
          <X size={12} /> Withdraw
        </button>
      )}
    </div>
  );
}
