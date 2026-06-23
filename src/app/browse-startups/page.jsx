'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const INDUSTRIES = [
  '',
  'FinTech',
  'HealthTech',
  'EdTech',
  'AI/ML',
  'SaaS',
  'E-commerce',
  'General',
];
const FUNDING_STAGES = [
  '',
  'Idea',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Bootstrapped',
];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
];

const BrowseStartups = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState('');

  // Debounce text search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStartups = useCallback(
    async (pg = 1) => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        params.append('page', pg);
        params.append('limit', 9);
        params.append('sort', sort);
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (filterIndustry) params.append('industry', filterIndustry);
        if (filterStage) params.append('funding_stage', filterStage);

        const res = await fetch(`${apiUrl}/startups?${params.toString()}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to load');
        setStartups(result.data || []);
        setPagination(result.pagination || {});
        setPage(pg);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Error fetching startups:', err);
        setError(err.message);
        setStartups([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterIndustry, filterStage, sort]
  );

  useEffect(() => {
    fetchStartups(1);
  }, [fetchStartups]);

  const handleReset = () => {
    setSearch('');
    setFilterIndustry('');
    setFilterStage('');
    setSort('newest');
  };

  const hasFilters = useMemo(
    () => Boolean(search || filterIndustry || filterStage) || sort !== 'newest',
    [search, filterIndustry, filterStage, sort]
  );

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
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Browse Startups</h1>
          <p className="mt-2 text-zinc-400">Explore all startups on the platform</p>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search by name, description, or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-white placeholder-zinc-500 transition focus:border-orange-400 focus:outline-none"
              />
            </div>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white transition focus:border-orange-400 focus:outline-none"
            >
              {INDUSTRIES.map((i) => (
                <option key={i || 'all'} value={i}>
                  {i ? `Industry: ${i}` : 'All industries'}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white transition focus:border-orange-400 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white transition focus:border-orange-400 focus:outline-none sm:max-w-xs"
            >
              {FUNDING_STAGES.map((f) => (
                <option key={f || 'all'} value={f}>
                  {f ? `Funding: ${f}` : 'All funding stages'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result meta */}
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
          <span>
            {loading
              ? 'Loading…'
              : pagination.total != null
                ? `${pagination.total} startup${pagination.total === 1 ? '' : 's'} found`
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
        ) : startups.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((startup) => (
                <Link key={startup._id} href={`/startup/${startup._id}`}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 cursor-pointer">
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-6">
                      {startup.logoURL ? (
                        <img
                          src={startup.logoURL}
                          alt={startup.startup_name}
                          className="h-24 w-24 rounded-lg border border-white/10 bg-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-lg font-black text-orange-300">
                          {startup.startup_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-bold text-white">{startup.startup_name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{startup.founder_email}</p>
                      <p className="mt-3 flex-1 text-sm leading-5 text-zinc-300">
                        {startup.description || 'No description'}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                          {startup.industry}
                        </span>
                        <span className="text-xs text-zinc-400">{startup.funding_stage}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
              >
                <button
                  onClick={() => fetchStartups(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold transition hover:border-orange-400/30 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                {pageList.map((p, idx) =>
                  p === '…' ? (
                    <span key={`e-${idx}`} className="px-2 text-zinc-500" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => fetchStartups(p)}
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
                  onClick={() => fetchStartups(page + 1)}
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
            <p className="text-zinc-300">No startups match your filters.</p>
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

export default BrowseStartups;
