"use client";

import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";
import { useFounderData } from "./_components/founder-data";

export default function FounderOverviewPage() {
  const { stats, opportunities, isPremium, hitsFreeLimit, FREE_OPP_LIMIT } =
    useFounderData();

  return (
    <div className="space-y-6">
      {/* Premium banner */}
      {!isPremium && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
            hitsFreeLimit
              ? "border-amber-400/40 bg-amber-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <Crown
              className={hitsFreeLimit ? "text-amber-300" : "text-zinc-400"}
              size={22}
            />
            <div>
              <p className="font-bold">
                {hitsFreeLimit ? "Free limit reached" : "Free plan in use"}
              </p>
              <p className="text-xs text-zinc-400">
                {stats.opportunities} / {isPremium ? "∞" : FREE_OPP_LIMIT} opportunities
                posted
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:from-amber-400 hover:to-orange-400"
          >
            <Crown size={14} /> Upgrade to Premium
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Startups" value={stats.startups} />
        <StatCard label="Opportunities" value={stats.opportunities} />
        <StatCard
          label="Pending Apps"
          value={stats.pendingApps}
          accent={stats.pendingApps > 0 ? "amber" : null}
        />
        <StatCard label="Total Apps" value={stats.totalApps} />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/dashboard/founder/startups"
          title="My Startups"
          body="Create and manage the startups attached to your account."
        />
        <QuickLink
          href="/dashboard/founder/opportunities"
          title="My Opportunities"
          body="Post roles, edit active listings, and view applicants."
        />
        <QuickLink
          href="/dashboard/founder/applications"
          title="Applications"
          body="Review and respond to collaborators who applied to your roles."
          badge={stats.pendingApps > 0 ? stats.pendingApps : null}
        />
      </div>

      {/* Recent opportunities preview */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recently posted</h2>
          <Link
            href="/dashboard/founder/opportunities"
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-300 hover:text-orange-200"
          >
            See all <ArrowRight size={12} />
          </Link>
        </div>
        {opportunities.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
            No opportunities yet. Post your first role from the Opportunities tab.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {opportunities.slice(0, 5).map((o) => (
              <li
                key={o._id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {o.role_title}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    at {o.startup?.startup_name || "Unknown startup"} · {o.work_type}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {o.industry || "General"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent = null }) {
  const accentClass =
    accent === "amber"
      ? "border-amber-400/30 bg-amber-500/10"
      : "border-white/10 bg-white/5";
  return (
    <div className={`rounded-2xl border p-5 ${accentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-black">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, body, badge = null }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-orange-400/30 hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        {badge != null && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-black text-white">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-300 opacity-0 transition group-hover:opacity-100">
        Open <ArrowRight size={12} />
      </span>
    </Link>
  );
}
