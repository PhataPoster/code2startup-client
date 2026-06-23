"use client";

import { useState } from "react";
import StartupForm from "../_components/StartupForm";
import StartupCard from "../_components/StartupCard";
import { useFounderData } from "../_components/founder-data";

export default function FounderStartupsPage() {
  const { startups, submitStartup, deleteStartup, loading, error } =
    useFounderData();
  const [editing, setEditing] = useState(null); // null = list, "new" = create form, startup obj = edit form
  const [busy, setBusy] = useState(false);

  if (loading) return <p className="text-sm text-zinc-400">Loading startups…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

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
              await submitStartup(editing === "new" ? "new" : "edit", payload);
              setEditing(null);
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
              onDelete={async () => {
                if (!confirm(`Delete "${s.startup_name}"?`)) return;
                await deleteStartup(s);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
