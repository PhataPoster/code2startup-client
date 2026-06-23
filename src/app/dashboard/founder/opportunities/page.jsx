"use client";

import { useState } from "react";
import OpportunityForm from "../_components/OpportunityForm";
import OpportunityCard from "../_components/OpportunityCard";
import { useFounderData } from "../_components/founder-data";

export default function FounderOpportunitiesPage() {
  const {
    opportunities,
    startups,
    hitsFreeLimit,
    isPremium,
    FREE_OPP_LIMIT,
    submitOpportunity,
    deleteOpportunity,
    loading,
    error,
  } = useFounderData();
  const [editing, setEditing] = useState(null);

  if (loading)
    return <p className="text-sm text-zinc-400">Loading opportunities…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Manage Opportunities</h1>
        <button
          onClick={() => setEditing("new")}
          disabled={hitsFreeLimit}
          className="rounded-lg bg-linear-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:from-orange-400 hover:to-amber-400 disabled:cursor-not-allowed disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-400"
        >
          + Add opportunity
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        {opportunities.length} {isPremium ? "" : `/ ${FREE_OPP_LIMIT} `}
        active listing{opportunities.length === 1 ? "" : "s"}.
        {hitsFreeLimit && (
          <a
            href="/pricing"
            className="ml-2 font-semibold text-orange-300 hover:text-orange-200"
          >
            Upgrade for unlimited postings →
          </a>
        )}
      </p>

      {editing !== null && startups.length === 0 ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          You need to create a startup first.
        </p>
      ) : null}

      {editing !== null && (
        <OpportunityForm
          initial={editing === "new" ? null : editing}
          startups={startups}
          onCancel={() => setEditing(null)}
          onSubmit={async (payload) => {
            await submitOpportunity(editing === "new" ? "new" : "edit", payload);
            setEditing(null);
          }}
        />
      )}

      {opportunities.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          No opportunities yet. Click &ldquo;Add opportunity&rdquo; to post your first
          role.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {opportunities.map((o) => (
            <OpportunityCard
              key={o._id}
              opportunity={o}
              onEdit={() => setEditing(o)}
              onDelete={async () => {
                if (!confirm(`Delete "${o.role_title}"?`)) return;
                await deleteOpportunity(o);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
