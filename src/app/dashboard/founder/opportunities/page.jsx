"use client";

import { useState } from "react";
import OpportunityForm from "../_components/OpportunityForm";
import OpportunityCard from "../_components/OpportunityCard";
import { useFounderData } from "../_components/founder-data";
import ConfirmDialog, { useConfirmTarget } from "@/components/confirm-dialog";
import { toast } from "@/lib/toast";

export default function FounderOpportunitiesPage() {
  const {
    opportunities,
    startups,
    hitsFreeLimit,
    isPremium,
    FREE_OPP_LIMIT,
    hasApprovedStartup,
    pendingStartups,
    submitOpportunity,
    deleteOpportunity,
    loading,
    error,
  } = useFounderData();
  const [editing, setEditing] = useState(null); // null = list, "new" = create form, opp obj = edit form
  const [busy, setBusy] = useState(false);
  const deleteTarget = useConfirmTarget();
  const [deletingId, setDeletingId] = useState(null);

  if (loading)
    return <p className="text-sm text-zinc-400">Loading opportunities…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  const performDelete = async (opp) => {
    setDeletingId(opp._id);
    const res = await deleteOpportunity(opp);
    setDeletingId(null);
    deleteTarget.clear();
    if (res?.ok) toast.success(`"${opp.role_title || opp.title}" deleted.`);
    else toast.error(res?.error?.message || "Failed to delete opportunity.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Manage Opportunities</h1>
        <button
          onClick={() => setEditing("new")}
          disabled={hitsFreeLimit || !hasApprovedStartup}
          title={
            !hasApprovedStartup
              ? "Awaiting admin approval of your startup"
              : undefined
          }
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

      {!hasApprovedStartup && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          {pendingStartups > 0
            ? `Your startup is awaiting admin approval. You can post opportunities once an admin approves it (${pendingStartups} pending).`
            : "You don't have an approved startup yet. Create one and an admin will review it before you can post opportunities."}
        </div>
      )}

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
          busy={busy}
          onSubmit={async (payload) => {
            setBusy(true);
            try {
              // editing === "new"  -> create (target=null)
              // editing === opp    -> update (target=opp)
              const target = editing === "new" ? null : editing;
              const res = await submitOpportunity(target, payload);
              if (res?.ok !== false) {
                toast.success(
                  target
                    ? `Updated "${target.role_title || target.title}".`
                    : "Opportunity posted.",
                );
                setEditing(null);
              } else {
                toast.error(res?.error?.message || "Failed to save opportunity.");
              }
            } finally {
              setBusy(false);
            }
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
              busy={deletingId === o._id}
              onEdit={() => setEditing(o)}
              onDelete={() => deleteTarget.request(o)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget.target}
        title={`Delete "${deleteTarget.target?.role_title || deleteTarget.target?.title}"?`}
        description="This permanently removes the opportunity and all its applications."
        confirmLabel="Delete opportunity"
        intent="danger"
        busy={deletingId === deleteTarget.target?._id}
        onConfirm={() => performDelete(deleteTarget.target)}
        onCancel={deleteTarget.clear}
      />
    </div>
  );
}
