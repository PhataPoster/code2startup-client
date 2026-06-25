"use client";

/**
 * FounderCharts
 * --------------
 * Hand-built SVG charts used on the founder overview. Lives inside
 * `_components/` so it ships as part of the dashboard bundle. No third
 * party chart lib is required — keeps the bundle slim and the styling
 * fully aligned with the existing dark/orange design system.
 *
 * Exports:
 *   <WorkTypeBarChart data={[{label,count}, ...]} />
 *   <ApplicationStatusDonut counts={{pending,accepted,rejected,reviewing}} />
 *   <StartupStatusBar data={[{label,count}, ...]} />
 */

import { Briefcase, FileCheck2, PieChart as PieIcon } from "lucide-react";

const ORANGE = "#fb923c";
const ROSE = "#fb7185";
const SKY = "#38bdf8";
const AMBER = "#f59e0b";
const EMERALD = "#10b981";
const VIOLET = "#a78bfa";
const SLATE = "#64748b";

const PIE_COLORS = [ORANGE, EMERALD, ROSE, SKY, VIOLET, AMBER, SLATE];

/* ============================================================
 * Bar chart — horizontal bars, one per category.
 * ========================================================== */
function HBarChart({
  data,
  color = ORANGE,
  emptyMessage = "No data yet",
  icon: Icon = Briefcase,
  title,
  subtitle,
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
          <Icon size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((d) => {
            const pct = Math.round((d.count / max) * 100);
            return (
              <li key={d.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-semibold text-zinc-200">
                    {d.label || "Unspecified"}
                  </span>
                  <span className="font-black text-white">{d.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                      boxShadow: `0 0 12px ${color}55`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function WorkTypeBarChart({ opportunities = [] }) {
  const counts = opportunities.reduce((acc, o) => {
    const k = o.work_type || "Other";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  return (
    <HBarChart
      data={data}
      color={ORANGE}
      title="Opportunities by work type"
      subtitle="How your open roles are split"
      icon={Briefcase}
      emptyMessage="Post an opportunity to see this breakdown."
    />
  );
}

export function StartupStatusBar({ startups = [] }) {
  const counts = startups.reduce((acc, s) => {
    const k = s.status || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  // Stable ordering: Pending first, then Active, then others
  const order = ["Pending", "Active", "Rejected", "Suspended"];
  const data = order
    .filter((k) => counts[k] != null)
    .map((label) => ({ label, count: counts[label] }));
  Object.keys(counts)
    .filter((k) => !order.includes(k))
    .forEach((k) => data.push({ label: k, count: counts[k] }));
  return (
    <HBarChart
      data={data}
      color={SKY}
      title="Startup status overview"
      subtitle="Approval state of every startup you own"
      icon={FileCheck2}
      emptyMessage="Create a startup to see this breakdown."
    />
  );
}

/* ============================================================
 * Donut chart — application status distribution.
 * Pure SVG, no external math. Each slice is a stroked circle
 * segment on a common radius, offset by cumulative length.
 * ========================================================== */
export function ApplicationStatusDonut({ applications = [] }) {
  const counts = applications.reduce(
    (acc, a) => {
      const k = a.status || "pending";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    { pending: 0, accepted: 0, rejected: 0, reviewing: 0 }
  );
  const total = applications.length;
  const slices = [
    { key: "pending", label: "Pending", color: AMBER },
    { key: "accepted", label: "Accepted", color: EMERALD },
    { key: "reviewing", label: "Reviewing", color: SKY },
    { key: "rejected", label: "Rejected", color: ROSE },
  ].filter((s) => counts[s.key] > 0);

  const size = 168;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
          <PieIcon size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">
            Application status mix
          </h3>
          <p className="text-xs text-zinc-500">
            Across all {total} application{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">
          No applications yet — once candidates apply, you&apos;ll see a
          breakdown here.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90"
              role="img"
              aria-label="Application status donut chart"
            >
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={stroke}
              />
              {/* Slices */}
              {slices.map((s) => {
                const length = (counts[s.key] / total) * circumference;
                const dashArray = `${length} ${circumference - length}`;
                const dashOffset = -offset;
                offset += length;
                return (
                  <circle
                    key={s.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={stroke}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                    style={{
                      filter: `drop-shadow(0 0 6px ${s.color}66)`,
                      transition: "stroke-dasharray 700ms ease-out",
                    }}
                  />
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{total}</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                Total
              </span>
            </div>
          </div>

          <ul className="flex-1 space-y-2 self-stretch">
            {slices.map((s) => {
              const pct = Math.round((counts[s.key] / total) * 100);
              return (
                <li
                  key={s.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5"
                >
                  <span className="flex items-center gap-2 text-xs">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="font-semibold text-zinc-200">
                      {s.label}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-1 text-xs">
                    <span className="font-black text-white">
                      {counts[s.key]}
                    </span>
                    <span className="text-zinc-500">{pct}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Tiny sparkline — used for the "trend this month" stat card.
 * Pure SVG, no axis labels, just a stroked polyline.
 * ========================================================== */
export function Sparkline({
  values = [],
  color = ORANGE,
  width = 96,
  height = 32,
}) {
  if (!values || values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#spark-fill)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
 * Group the three chart pieces into a tidy two-column block.
 * ========================================================== */
export function FounderOverviewCharts({ opportunities, applications, startups }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WorkTypeBarChart opportunities={opportunities} />
      <ApplicationStatusDonut applications={applications} />
      <div className="lg:col-span-2">
        <StartupStatusBar startups={startups} />
      </div>
    </div>
  );
}

export { PIE_COLORS };
