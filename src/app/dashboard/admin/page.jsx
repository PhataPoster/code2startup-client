"use client";

import Link from "next/link";
import { ArrowRight, Users, Building2, Briefcase, DollarSign } from "lucide-react";
import { useAdminData } from "./_components/admin-data";

export default function AdminOverviewPage() {
  const { stats, loading } = useAdminData();

  if (loading) return <p className="text-sm text-zinc-400">Loading…</p>;

  const cards = [
    { label: "Users", value: stats.users, icon: Users, href: "/dashboard/admin/users" },
    {
      label: "Startups",
      value: stats.startups,
      icon: Building2,
      href: "/dashboard/admin/startups",
    },
    {
      label: "Opportunities",
      value: stats.opportunities,
      icon: Briefcase,
      href: "/dashboard/admin/startups",
    },
    {
      label: "Revenue",
      value: `$${(stats.revenue / 100).toFixed(2)}`,
      icon: DollarSign,
      href: "/dashboard/admin/transactions",
      accent: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href, accent }) => (
          <Link
            key={label}
            href={href}
            className={`group rounded-2xl border p-5 transition hover:border-orange-400/30 ${
              accent === "emerald"
                ? "border-emerald-400/20 bg-emerald-500/5"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <Icon className="text-orange-300" />
              <ArrowRight
                size={14}
                className="text-zinc-500 opacity-0 transition group-hover:opacity-100"
              />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {label}
            </p>
            <p className="mt-1 text-3xl font-black">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/admin/users"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
        >
          <h3 className="font-bold">Manage users</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Update roles, deactivate accounts, and audit access.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/startups"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
        >
          <h3 className="font-bold">Moderate startups</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Pause listings that violate policy and review opportunities.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/transactions"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
        >
          <h3 className="font-bold">View transactions</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Reconcile Stripe payments and refund where appropriate.
          </p>
        </Link>
      </div>
    </div>
  );
}
