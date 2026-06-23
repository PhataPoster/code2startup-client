"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Loader2,
  Briefcase,
  Building2,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const INDUSTRIES = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "AI/ML",
  "SaaS",
  "E-commerce",
  "General",
];

export default function BrowseOpportunities({ onApply, appliedIds = new Set() }) {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("");
  const [industry, setIndustry] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOpps = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (workType) params.set("work_type", workType);
      if (industry) params.set("industry", industry);
      params.set("page", String(page));
      params.set("limit", "9");

      const res = await api.get(`/opportunities?${params.toString()}`);
      setOpps(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workType, industry, page]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchOpps();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <section className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Search role title or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <Select
            value={workType}
            onChange={setWorkType}
            placeholder="All work types"
            options={WORK_TYPES}
          />
          <Select
            value={industry}
            onChange={setIndustry}
            placeholder="All industries"
            options={INDUSTRIES}
          />
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setWorkType("");
              setIndustry("");
              setPage(1);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            <Filter size={13} /> Reset
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
        </div>
      ) : opps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
          <p className="text-sm text-zinc-400">
            No opportunities match your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opps.map((o) => {
            const already = appliedIds.has(String(o._id));
            const expired =
              o.deadline && new Date(o.deadline) < new Date();
            return (
              <article
                key={o._id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-400/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-bold text-white">
                    {o.role_title}
                  </h3>
                  <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    {o.work_type}
                  </span>
                </div>

                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-400">
                  <Building2 size={12} />
                  {o.startup?.startup_name || "Startup"}
                </p>

                {o.required_skills && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {o.required_skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-200"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={12} /> {o.industry || "General"}
                  </span>
                  <span>
                    {o.deadline
                      ? `Closes ${new Date(o.deadline).toLocaleDateString()}`
                      : "Open"}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`/opportunity/${o._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    View
                  </a>
                  {already ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 opacity-60"
                    >
                      ✓ Applied
                    </button>
                  ) : expired ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 opacity-60"
                    >
                      Expired
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApply(o)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600"
                    >
                      Apply <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-xs text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-white focus:border-orange-400 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
