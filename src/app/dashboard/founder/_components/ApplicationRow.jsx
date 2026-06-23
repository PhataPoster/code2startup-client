"use client";

import { useState } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const STATUS_STYLES = {
  Pending: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  Accepted: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  Rejected: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export default function ApplicationRow({ application, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const setStatus = async (status) => {
    setBusy(true);
    setError("");
    try {
      await api.put(`/applications/${application._id}/status`, { status });
      onChanged?.(application._id, status);
    } catch (err) {
      setError(err.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white">{application.applicant_email}</p>
          {application.portfolio_link && (
            <a
              href={application.portfolio_link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200"
            >
              <ExternalLink size={11} /> Portfolio
            </a>
          )}
          {application.motivation && (
            <p className="mt-2 line-clamp-3 text-sm text-zinc-300">
              {application.motivation}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              STATUS_STYLES[application.status] || STATUS_STYLES.Pending
            }`}
          >
            {application.status}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-300">{error}</p>
      )}

      {application.status === "Pending" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatus("Accepted")}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Accept
          </button>
          <button
            type="button"
            onClick={() => setStatus("Rejected")}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
          >
            <X size={12} /> Reject
          </button>
        </div>
      )}

      <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">
        Applied {new Date(application.applied_at).toLocaleString()}
      </p>
    </div>
  );
}