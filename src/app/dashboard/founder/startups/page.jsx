"use client";

import { useState } from "react";
import StartupForm from "../_components/StartupForm";
import StartupCard from "../_components/StartupCard";
import { useFounderData } from "../_components/founder-data";
import ConfirmDialog, { useConfirmTarget } from "@/components/confirm-dialog";
import { toast } from "@/lib/toast";

export default function FounderStartupsPage() {
  const { startups, submitStartup, deleteStartup, loading, error } =
    useFounderData();
  const [editing, setEditing] = useState(null); // null = list, "new" = create form, startup obj = edit form
  const [busy, setBusy] = useState(false);
  const deleteTarget = useConfirmTarget();
  const [deletingId, setDeletingId] = useState(null);

  if (loading) return <p className="text-sm text-zinc-400">Loading startups…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  const performDelete = async (startup) => {
    setDeletingId(startup._id);
    const res = await deleteStartup(startup);
    setDeletingId(null);
    deleteTarget.clear();
    if (res?.ok) toast.success(`"${startup.startup_name}" deleted.`);
    else toast.error(res?.error?.message || "Failed to delete startup.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Startups</h1>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="rounded-lg bg-linear-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:from-orange-400 hover:to-amber-400"
          >
            + Add startup
          </button>
        )}
      </div>

      {editing !== null && (
        <StartupForm
          initial={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          busy={busy}
          onSubmit={async (payload) => {
            setBusy(true);
            try {
              // editing === "new"  -> create (target=null)
              // editing === startup -> update (target=startup)
              const target = editing === "new" ? null : editing;
              const res = await submitStartup(target, payload);
              if (res?.ok !== false) {
                toast.success(
                  target
                    ? `Updated "${target.startup_name}".`
                    : "Startup created.",
                );
                setEditing(null);
              } else {
                toast.error(
                  res?.error?.message || "Failed to save startup.",
                );
              }
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {startups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          You don&apos;t have any startups yet. Add your first one to start posting
          opportunities.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {startups.map((s) => (
            <StartupCard
              key={s._id}
              startup={s}
              onEdit={() => setEditing(s)}
              onDelete={() => deleteTarget.request(s)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget.target}
        title={`Delete "${deleteTarget.target?.startup_name}"?`}
        description="This permanently removes the startup and unlinks its opportunities. You can always recreate it later."
        confirmLabel="Delete startup"
        intent="danger"
        busy={deletingId === deleteTarget.target?._id}
        onConfirm={() => performDelete(deleteTarget.target)}
        onCancel={deleteTarget.clear}
      />
    </div>
  );
}
