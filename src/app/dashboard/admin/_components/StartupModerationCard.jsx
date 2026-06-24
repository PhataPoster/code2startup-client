"use client";

import { Check, X, ExternalLink, Loader2, Building2, RotateCcw } from "lucide-react";

const STATUS_STYLES = {
  Active: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  Pending: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  Removed: "border-rose-400/30 bg-rose-500/15 text-rose-200",
};

export default function StartupModerationCard({
  startup,
  opportunities = [],
  onApprove,
  onRemove,
  onReactivate,
  onToggleOpp,
  busy,
  busyOppId,
}) {
  return (
    <div
      aria-busy={busy || undefined}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-400/30 aria-busy:bg-white/3"
    >
      <div className="flex items-start gap-4">
        {startup.logoURL || startup.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={startup.logoURL || startup.logo}
            alt={startup.startup_name}
            className="h-12 w-12 shrink-0 rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-orange-500/15">
            <Building2 size={18} className="text-orange-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">
            {startup.startup_name}
          </h3>
          <p className="truncate text-xs text-zinc-400">
            {startup.founder_email}
          </p>
          <p className="truncate text-sm text-zinc-300">
            {startup.industry || "General"} · {startup.funding_stage || "Idea"}
          </p>
          <span
            className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              STATUS_STYLES[startup.status] || STATUS_STYLES.Pending
            }`}
          >
            {startup.status || "Pending"}
          </span>
        </div>
      </div>

      {startup.description && (
        <p className="mt-3 line-clamp-3 text-sm text-zinc-300">
          {startup.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`/startup/${startup._id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          <ExternalLink size={12} /> View
        </a>
        {startup.status === "Removed" && onReactivate ? (
          <button
            type="button"
            onClick={() => onReactivate(startup)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RotateCcw size={12} />
            )}
            Reactivate
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onApprove(startup)}
              disabled={busy || startup.status === "Active"}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              {startup.status === "Active" ? "Active" : "Approve"}
            </button>
            <button
              type="button"
              onClick={() => onRemove(startup)}
              disabled={busy || startup.status === "Removed"}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <X size={12} />
              )}
              {startup.status === "Removed" ? "Removed" : "Remove"}
            </button>
          </>
        )}
      </div>

      {opportunities.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Opportunities ({opportunities.length})
          </p>
          <ul className="space-y-1.5">
            {opportunities.map((opp) => {
              const isBusy = busyOppId === opp._id;
              const isOpen = opp.status === "open";
              return (
                <li
                  key={opp._id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-zinc-900/50 px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {opp.title || "Untitled"}
                    </p>
                    <p
                      className={`text-[10px] uppercase tracking-wider ${
                        isOpen ? "text-emerald-300" : "text-zinc-500"
                      }`}
                    >
                      {opp.status || "open"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleOpp?.(opp)}
                    disabled={isBusy}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white transition hover:border-orange-400 disabled:opacity-60"
                  >
                    {isBusy ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : isOpen ? (
                      "Close"
                    ) : (
                      "Reopen"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
