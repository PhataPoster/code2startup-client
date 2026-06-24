"use client";

import ApplicationCard from "../_components/ApplicationCard";
import { useCollabData } from "../_components/collab-data";

export default function CollaboratorApplicationsPage() {
  const { applications, withdrawApplication, loading, error } = useCollabData();

  if (loading)
    return <p className="text-sm text-zinc-400">Loading applications…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Applications</h1>

      {applications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          You haven&apos;t applied to anything yet. Browse open opportunities and
          submit your first application.
        </p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              opportunity={app.opportunity}
              onWithdraw={async () => {
                if (!confirm("Withdraw this application?")) return;
                await withdrawApplication(app);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}