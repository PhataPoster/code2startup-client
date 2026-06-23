"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

export default function ApplyModal({ opportunity, onCancel, onApplied }) {
  const [portfolio, setPortfolio] = useState("");
  const [motivation, setMotivation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [opportunity]);

  if (!opportunity) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!motivation.trim()) {
      setError("Please share a short motivation message.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/applications", {
        opportunity_id: opportunity._id,
        portfolio_link: portfolio.trim() || undefined,
        motivation: motivation.trim(),
      });
      onApplied?.(opportunity._id);
    } catch (err) {
      setError(err.message || "Failed to apply");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
              Apply to
            </p>
            <h3 className="text-xl font-bold text-white">
              {opportunity.role_title}
            </h3>
            {opportunity.startup?.startup_name && (
              <p className="text-sm text-zinc-400">
                at {opportunity.startup.startup_name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Portfolio link (optional)
            </label>
            <input
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://github.com/you"
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Why are you a good fit? *
            </label>
            <textarea
              required
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={5}
              placeholder="Tell the founder about your experience, motivation, and what you'd contribute..."
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Submit Application
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>

        <a
          href={`/opportunity/${opportunity._id}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200"
        >
          <ExternalLink size={11} /> View full opportunity details
        </a>
      </div>
    </div>
  );
}
