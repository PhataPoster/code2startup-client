"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OpportunityForm from "../../_components/OpportunityForm";
import { useFounderData } from "../../_components/founder-data";

// Deep-link target from the side-nav's "Add Opportunity" item.
export default function FounderNewOpportunityPage() {
  const router = useRouter();
  const {
    opportunities,
    startups,
    hitsFreeLimit,
    submitOpportunity,
    loading,
  } = useFounderData();

  useEffect(() => {
    // Premium-only guard for the new-opportunity deep link.
    if (!loading && hitsFreeLimit) {
      router.replace("/pricing?from=opportunities");
    }
  }, [hitsFreeLimit, loading, router]);

  if (loading) return <p className="text-sm text-zinc-400">Loading…</p>;
  if (startups.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200">
        <p className="font-bold">Create a startup first</p>
        <p className="mt-1 text-sm">
          Opportunities must belong to a startup on your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post a new opportunity</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {opportunities.length} active listing
          {opportunities.length === 1 ? "" : "s"} on your account.
        </p>
      </div>
      <OpportunityForm
        initial={null}
        startups={startups}
        onCancel={() => router.push("/dashboard/founder/opportunities")}
        onSubmit={async (payload) => {
          await submitOpportunity("new", payload);
          router.push("/dashboard/founder/opportunities");
        }}
      />
    </div>
  );
}
