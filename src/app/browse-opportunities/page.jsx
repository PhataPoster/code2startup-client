'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import FormSelect from '@/components/forms/FormSelect';
import SearchField from '@/components/forms/SearchField';
import { fetchFilterOptions } from '@/lib/fetch';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-asc', label: 'Title A→Z' },
  { value: 'title-desc', label: 'Title Z→A' },
];

const BrowseOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRole, setSearchRole] = useState('');
  const [searchSkills, setSearchSkills] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState('');

  // Live dropdown options. Static fallbacks keep the UI usable if the
  // options endpoint is briefly unreachable.
  const [workTypeOptions, setWorkTypeOptions] = useState([
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
  ]);
  const [industryOptions, setIndustryOptions] = useState([
    { value: 'FinTech', label: 'FinTech' },
    { value: 'HealthTech', label: 'HealthTech' },
    { value: 'EdTech', label: 'EdTech' },
    { value: 'AI/ML', label: 'AI/ML' },
    { value: 'SaaS', label: 'SaaS' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'General', label: 'General' },
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const opts = await fetchFilterOptions();
      if (cancelled || !opts) return;
      if (opts.opportunity?.work_type?.length) {
        setWorkTypeOptions(
          opts.opportunity.work_type.map((o) => ({ value: o.value, label: o.label }))
        );
      }
      if (opts.opportunity?.industry?.length) {
        setIndustryOptions(
          opts.opportunity.industry.map((o) => ({ value: o.value, label: o.label }))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce text searches so we don't spam the backend on every keystroke
  const [debouncedRole, setDebouncedRole] = useState('');
  const [debouncedSkills, setDebouncedSkills] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedRole(searchRole.trim()), 400);
    return () => clearTimeout(t);
  }, [searchRole]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSkills(searchSkills.trim()), 400);
    return () => clearTimeout(t);
  }, [searchSkills]);

  const fetchOpportunities = useCallback(
    async (pg = 1) => {
      // Public browse page — direct fetch to the Express backend.
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        params.append('page', pg);
        params.append('limit', 9);
        params.append('sort', sort);
        if (debouncedRole) params.append('role_title', debouncedRole);
        if (debouncedSkills) params.append('required_skills', debouncedSkills);
        if (filterWorkType) params.append('work_type', filterWorkType);
        if (filterIndustry) params.append('industry', filterIndustry);

        const res = await fetch(`${apiUrl}/opportunities?${params.toString()}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to load');
        setOpportunities(result.data || []);
        setPagination(result.pagination || {});
        setPage(pg);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError(err.message);
        setOpportunities([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    },
    [debouncedRole, debouncedSkills, filterWorkType, filterIndustry, sort]
  );

  // Re-fetch when any filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOpportunities(1);
  }, [fetchOpportunities]);

  const handleReset = () => {
    setSearchRole('');
    setSearchSkills('');
    setFilterWorkType('');
    setFilterIndustry('');
    setSort('newest');
  };

  const hasFilters = useMemo(
    () =>
      Boolean(searchRole || searchSkills || filterWorkType || filterIndustry) ||
      sort !== 'newest',
    [searchRole, searchSkills, filterWorkType, filterIndustry, sort]
  );

  // Build a compact page list (first, last, current ±1, ellipses)
  const pageList = useMemo(() => {
    const total = pagination.pages || 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, page, page - 1, page + 1]);
    const list = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < list.length; i++) {
      if (i > 0 && list[i] - list[i - 1] > 1) out.push('…');
      out.push(list[i]);
    }
    return out;
  }, [pagination.pages, page]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Browse Opportunities</h1>
          <p className="mt-2 text-zinc-400">Find the perfect opportunity to collaborate</p>
        </div>

        {/* Filter bar */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <SlidersHorizontal size={16} /> Filters
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-zinc-300 transition hover:border-rose-400/30 hover:text-rose-200"
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SearchField
              wrapperClassName="lg:col-span-2"
              placeholder="Search role title..."
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            />
            <SearchField
              wrapperClassName="lg:col-span-2"
              placeholder="Search skills (e.g. react, ml)..."
              value={searchSkills}
              onChange={(e) => setSearchSkills(e.target.value)}
            />
            <FormSelect
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort opportunities"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FormSelect
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value)}
              aria-label="Filter by work type"
            >
              <option value="">All work types</option>
              {workTypeOptions.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              aria-label="Filter by industry"
            >
              <option value="">All industries</option>
              {industryOptions.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </FormSelect>
          </div>
        </div>

        {/* Result meta */}
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
          <span>
            {loading
              ? 'Loading…'
              : pagination.total != null
                ? `${pagination.total} opportunit${pagination.total === 1 ? 'y' : 'ies'} found`
                : ''}
          </span>
          {pagination.pages > 1 && (
            <span>
              Page {page} of {pagination.pages}
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500" />
          </div>
        ) : opportunities.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <Link key={opp._id} href={`/opportunity/${opp._id}`}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 cursor-pointer">
                    <div className="flex h-32 items-center justify-center bg-linear-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-6">
                      <h3 className="text-center text-lg font-bold text-orange-300">
                        {opp.role_title}
                      </h3>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-1 text-xs font-semibold text-orange-200">
                          {opp.work_type}
                        </span>
                        {opp.industry && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                            {opp.industry}
                          </span>
                        )}
                        {opp.commitment_level && (
                          <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">
                            {opp.commitment_level}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-zinc-400">
                        <strong>Skills:</strong> {opp.required_skills || 'No specific skills'}
                      </p>
                      <p className="mt-2 flex-1 text-xs text-zinc-500">
                        Created on {new Date(opp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
              >
                <button
                  onClick={() => fetchOpportunities(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold transition hover:border-orange-400/30 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                {pageList.map((p, idx) =>
                  p === '…' ? (
                    <span
                      key={`e-${idx}`}
                      className="px-2 text-zinc-500"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => fetchOpportunities(p)}
                      aria-current={p === page ? 'page' : undefined}
                      className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        p === page
                          ? 'border-orange-400 bg-orange-500/20 text-orange-100'
                          : 'border-white/10 bg-white/5 text-zinc-300 hover:border-orange-400/30'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => fetchOpportunities(page + 1)}
                  disabled={page === pagination.pages}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold transition hover:border-orange-400/30 disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-16 text-center">
            <p className="text-zinc-300">No opportunities match your filters.</p>
            {hasFilters && (
              <button
                onClick={handleReset}
                className="mt-4 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-zinc-200 hover:border-orange-400/30"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default BrowseOpportunities;

