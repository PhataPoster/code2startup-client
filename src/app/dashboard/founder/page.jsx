"use client";

import Link from "next/link";
import { Crown, ArrowRight, ClockAlert, TrendingUp, Briefcase, Building2, FileCheck2, CheckCircle2 } from "lucide-react";
import { useFounderData } from "./_components/founder-data";
import {
  FounderOverviewCharts,
  Sparkline,
} from "./_components/FounderCharts";

export default function FounderOverviewPage() {
  const {
    stats,
    opportunities,
    applications,
    startups,
    trend,
    isPremium,
    hitsFreeLimit,
    FREE_OPP_LIMIT,
    hasApprovedStartup,
    pendingStartups,
    loading,
  } = useFounderData();

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

      {/* Admin-approval gate banner */}
      {pendingStartups > 0 && !hasApprovedStartup && (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
          <div className="flex items-start gap-3">
            <ClockAlert size={22} className="mt-0.5 shrink-0 text-amber-300" />
            <div>
              <p className="font-bold">Awaiting admin review</p>
              <p className="mt-0.5 text-xs text-amber-200/80">
                {pendingStartups} startup{pendingStartups === 1 ? " is" : "s are"}{" "}
                pending approval. You can post opportunities once an admin
                approves your startup. You can still edit your startup profile
                in the meantime.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/founder/startups"
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
          >
            View startups <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Startups"
          value={stats.startups}
          icon={Building2}
          accent="blue"
        />
        <StatCard
          label="Opportunities"
          value={stats.opportunities}
          icon={Briefcase}
          accent="orange"
        />
        <StatCard
          label="Applications"
          value={stats.totalApps}
          icon={FileCheck2}
          accent="violet"
          badge={stats.pendingApps > 0 ? `${stats.pendingApps} pending` : null}
        />
        <StatCard
          label="Accept rate"
          value={`${stats.acceptRate}%`}
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      {/* Trend + charts */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
                <TrendingUp size={16} />
              </div>
              <h2 className="text-lg font-bold">Activity overview</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              How your workspace has trended over the last six months.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <TrendLegend
              color="#fb923c"
              label="Opportunities"
              series={trend.opportunities}
              labels={trend.months}
            />
            <TrendLegend
              color="#a78bfa"
              label="Applications"
              series={trend.applications}
              labels={trend.months}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
          </div>
        ) : (
          <FounderOverviewCharts
            opportunities={opportunities}
            applications={applications}
            startups={startups}
          />
        )}
      </section>

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

function StatCard({ label, value, accent = null, icon: Icon, badge = null }) {
  const accentMap = {
    orange: {
      ring: "border-orange-400/30 bg-orange-500/10",
      icon: "bg-orange-500/15 text-orange-300",
    },
    blue: {
      ring: "border-sky-400/30 bg-sky-500/10",
      icon: "bg-sky-500/15 text-sky-300",
    },
    violet: {
      ring: "border-violet-400/30 bg-violet-500/10",
      icon: "bg-violet-500/15 text-violet-300",
    },
    emerald: {
      ring: "border-emerald-400/30 bg-emerald-500/10",
      icon: "bg-emerald-500/15 text-emerald-300",
    },
    amber: {
      ring: "border-amber-400/30 bg-amber-500/10",
      icon: "bg-amber-500/15 text-amber-300",
    },
  };
  const a = accentMap[accent] || {
    ring: "border-white/10 bg-white/5",
    icon: "bg-white/5 text-zinc-300",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${a.ring}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300/80">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-black text-white">{value}</p>
          {badge && (
            <p className="mt-1 text-[11px] font-semibold text-zinc-300/80">
              {badge}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.icon}`}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
    </div>
  );
}

function TrendLegend({ color, label, series, labels }) {
  const total = series.reduce((a, b) => a + b, 0);
  const last = series[series.length - 1] || 0;
  const prev = series[series.length - 2] || 0;
  const delta = last - prev;
  const deltaText =
    series.length < 2
      ? "—"
      : delta > 0
      ? `+${delta} vs last month`
      : delta < 0
      ? `${delta} vs last month`
      : "flat vs last month";
  return (
    <div className="flex items-center gap-2">
      <Sparkline values={series} color={color} />
      <div className="leading-tight">
        <p className="font-semibold text-zinc-200">{label}</p>
        <p className="text-[10px] text-zinc-500">
          {total} total · {deltaText}
        </p>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-2 w-full animate-pulse rounded-full bg-white/5" />
          </div>
        ))}
      </div>
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
