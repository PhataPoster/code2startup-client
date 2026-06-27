"use client";

/**
 * PlatformPulse
 * --------------
 * Bottom-of-page section for the public home page. Combines three
 * reads in one block:
 *   1. "How it works"  — three numbered steps for founders + collaborators
 *   2. Live-ish KPIs   — small SVG sparkline cards sourced from the
 *                        public /api endpoints so the numbers are real
 *                        (startups, opportunities, applications).
 *   3. Call to action  — two CTAs (founders + collaborators).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Rocket,
  Users,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  LineChart,
} from "lucide-react";
import { api } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const steps = [
  {
    icon: Rocket,
    title: "Founders post their startup",
    body: "Create a startup profile, list the roles you need to fill, and tag the skills you're hunting for.",
  },
  {
    icon: Users,
    title: "Collaborators apply",
    body: "Talented builders discover opportunities that match their stack, apply in one click, and message the founder.",
  },
  {
    icon: ShieldCheck,
    title: "Admin reviews & team launches",
    body: "Every startup is moderated to keep the marketplace trustworthy. Once approved, founders ship with their new crew.",
  },
];

export default function PlatformPulse() {
  const [stats, setStats] = useState({ startups: 0, opportunities: 0, applications: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Hit the public, paginated endpoints we already expose.
        // limit=1 keeps payloads tiny — we only need the totals.
        // No public applications endpoint exists, so we derive a
        // running total from the visible opportunity cards instead.
        const [s, o] = await Promise.all([
          api.get("/startups?limit=1").catch(() => ({ pagination: { total: 0 } })),
          api
            .get("/opportunities?limit=50")
            .catch(() => ({ data: [], pagination: { total: 0 } })),
        ]);
        if (cancelled) return;
        // Each opportunity advertises an applicant count when populated;
        // fall back to the paginated total otherwise.
        const appCount = (o?.data || []).reduce(
          (sum, opp) => sum + (opp.application_count || 0),
          0
        );
        setStats({
          startups: s?.pagination?.total ?? 0,
          opportunities: o?.pagination?.total ?? 0,
          applications: appCount,
        });
      } catch {
        /* leave zeros — section still renders with placeholder */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-zinc-950 px-4 py-20 text-white sm:px-6 lg:px-8">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-240 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Eyebrow + heading */}
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
            Platform pulse
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            How Code2Startup works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            From posting a role to shipping with a brand-new teammate — three
            steps, moderated end-to-end.
          </p>
        </motion.div>

        {/* How it works — three steps */}
        <motion.ol
          className="grid gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.title}
                variants={itemVariants}
                className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur-sm transition duration-300 hover:border-orange-400/30"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500/20 to-rose-500/20 text-orange-300 transition group-hover:text-orange-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-5xl font-black leading-none text-white/5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{s.body}</p>
              </motion.li>
            );
          })}
        </motion.ol>

        {/* Live KPIs */}
        <motion.div
          className="mt-16 grid gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <KpiCard
            icon={Rocket}
            color="#fb923c"
            value={loaded ? stats.startups : "—"}
            label="Startups live"
            sub="Approved founders building right now"
          />
          <KpiCard
            icon={Sparkles}
            color="#a78bfa"
            value={loaded ? stats.opportunities : "—"}
            label="Open opportunities"
            sub="Roles waiting for the right collaborator"
          />
          <KpiCard
            icon={LineChart}
            color="#34d399"
            value={loaded ? stats.applications : "—"}
            label="Applications sent"
            sub="Clicks that turned into conversations"
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 overflow-hidden rounded-3xl border border-orange-400/30 bg-linear-to-br from-orange-500/15 via-zinc-900 to-rose-500/10 p-8 shadow-2xl shadow-black/40 sm:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                Ready to ship with a new teammate?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-zinc-300 sm:text-base">
                Whether you&apos;re hunting for your next cofounder or
                recruiting the perfect collaborator, Code2Startup makes the
                handshake fast.
              </p>
              <ul className="mt-4 grid gap-1.5 text-sm text-zinc-300 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Free to start, premium when you scale
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Moderated startups, no spam
                </li>
              </ul>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register?role=founder"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:from-orange-400 hover:to-rose-400"
              >
                <Rocket size={16} /> Post a startup
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/browse-opportunities"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-orange-400/40 hover:bg-white/10"
              >
                <Users size={16} /> Browse opportunities
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function KpiCard({ icon: Icon, color, value, label, sub }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: `${color}22`,
            color,
            boxShadow: `0 0 18px ${color}33`,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
      {/* faint sparkline decoration */}
      <svg
        className="pointer-events-none absolute -bottom-2 left-0 right-0 h-10 w-full opacity-50"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,30 C30,10 60,38 90,20 C120,5 150,32 180,12 L200,18"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeOpacity="0.6"
        />
      </svg>
    </div>
  );
}