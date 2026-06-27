"use client";

import Image from "next/image";
import { Pencil, Trash2, ExternalLink, Briefcase } from "lucide-react";

export default function StartupCard({ startup, onEdit, onDelete, busy }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-400/30">
      <div className="flex items-start gap-4">
        {startup.logoURL || startup.logo ? (
          <Image
            src={startup.logoURL || startup.logo}
            alt={startup.startup_name}
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-orange-500/15 text-xl font-black text-orange-300">
            {startup.startup_name?.[0]?.toUpperCase() || "S"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">
            {startup.startup_name}
          </h3>
          <p className="truncate text-sm text-zinc-400">
            {startup.industry || "General"} · {startup.funding_stage || "Idea"}
          </p>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              startup.status === "Active"
                ? "bg-emerald-500/15 text-emerald-300"
                : startup.status === "Pending"
                ? "bg-amber-500/15 text-amber-300"
                : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {startup.status || "Active"}
          </span>
        </div>
      </div>

      {startup.description && (
        <p className="mt-3 line-clamp-3 text-sm text-zinc-300">
          {startup.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Briefcase size={13} /> Team: {startup.team_size || 1}
        </span>
        <span>
          Posted {new Date(startup.created_at || Date.now()).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`/startup/${startup._id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          <ExternalLink size={13} /> View
        </a>
        <button
          type="button"
          onClick={() => onEdit(startup)}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:opacity-60"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(startup)}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}