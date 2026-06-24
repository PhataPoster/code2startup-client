"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClockAlert } from "lucide-react";
import OpportunityForm from "../../_components/OpportunityForm";
import { useFounderData } from "../../_components/founder-data";

// Deep-link target from the side-nav's "Add Opportunity" item.
export default function FounderNewOpportunityPage() {
  const router = useRouter();
  const {
    opportunities,
    startups,
    submitOpportunity,
    loading,
    hasApprovedStartup,
    pendingStartups,
  } = useFounderData();

  // NOTE: We intentionally do NOT redirect free-plan users away from this
  // page just because they have >= FREE_OPP_LIMIT opportunities. The form
  // is always reachable; the backend enforces the limit on submit and
  // surfaces a 402 -> upgrade banner via submitOpportunity's error path.
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

  // Admin-approval gate — the server also rejects with 403 STARTUP_NOT_APPROVED,
  // but we surface the message before the user even reaches the form.
  if (!hasApprovedStartup) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-amber-100">
          <div className="flex items-start gap-3">
            <ClockAlert
              size={22}
              className="mt-0.5 shrink-0 text-amber-300"
            />
            <div>
              <p className="font-bold">Startup awaiting admin approval</p>
              <p className="mt-1 text-sm text-amber-200/80">
                {pendingStartups > 0
                  ? `Your startup${
                      pendingStartups === 1 ? " is" : "s are"
                    } pending review. You can post opportunities once an admin approves ${
                      pendingStartups === 1 ? "it" : "them"
                    }.`
                  : "None of your startups are approved yet. Once an admin approves one, you can post opportunities here."}
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/founder/startups"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-300 hover:text-orange-200"
        >
          ← Back to Startups
        </Link>
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
          // No target doc on the deep-link create page — pass null
          // to match the (targetDoc | null, payload) handler signature.
          await submitOpportunity(null, payload);
          router.push("/dashboard/founder/opportunities");
        }}
      />
    </div>
  );
}
