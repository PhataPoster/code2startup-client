"use client";

import { useState } from "react";
import ApplicationCard from "../_components/ApplicationCard";
import { useCollabData } from "../_components/collab-data";
import ConfirmDialog, { useConfirmTarget } from "@/components/confirm-dialog";
import { toast } from "@/lib/toast";

export default function CollaboratorApplicationsPage() {
  const { applications, withdrawApplication, loading, error } = useCollabData();
  const withdrawTarget = useConfirmTarget();
  const [withdrawingId, setWithdrawingId] = useState(null);

  if (loading)
    return <p className="text-sm text-zinc-400">Loading applications…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  const performWithdraw = async (app) => {
    setWithdrawingId(app._id);
    try {
      await withdrawApplication(app);
      toast.success("Application withdrawn.");
    } catch (err) {
      toast.error(err?.message || "Failed to withdraw.");
    } finally {
      setWithdrawingId(null);
      withdrawTarget.clear();
    }
  };

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
              busy={withdrawingId === app._id}
              onWithdraw={() => withdrawTarget.request(app)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!withdrawTarget.target}
        title="Withdraw this application?"
        description="The founder will no longer see this application, and you can re-apply later if the role is still open."
        confirmLabel="Withdraw application"
        intent="warning"
        busy={withdrawingId === withdrawTarget.target?._id}
        onConfirm={() => performWithdraw(withdrawTarget.target)}
        onCancel={withdrawTarget.clear}
      />
    </div>
  );
}