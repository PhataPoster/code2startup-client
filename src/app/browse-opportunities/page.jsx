'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BrowseOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRole, setSearchRole] = useState('');
  const [searchSkills, setSearchSkills] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchOpportunities = async (pg = 1) => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pg);
      params.append('limit', 9);
      if (searchRole) params.append('role_title', searchRole);
      if (searchSkills) params.append('required_skills', searchSkills);
      if (filterWorkType) params.append('work_type', filterWorkType);

      const res = await fetch(`${apiUrl}/opportunities?${params}`);
      const result = await res.json();
      setOpportunities(result.data || []);
      setPagination(result.pagination || {});
      setPage(pg);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(1);
  }, [searchRole, searchSkills, filterWorkType]);

  const handlePageChange = (newPage) => {
    fetchOpportunities(newPage);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Browse Opportunities</h1>
          <p className="mt-2 text-zinc-400">Find the perfect opportunity to collaborate</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-4">
          <input
            type="text"
            placeholder="Search by role..."
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 transition focus:border-orange-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Search by skills..."
            value={searchSkills}
            onChange={(e) => setSearchSkills(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 transition focus:border-orange-400 focus:outline-none"
          />
          <select
            value={filterWorkType}
            onChange={(e) => setFilterWorkType(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white transition focus:border-orange-400 focus:outline-none"
          >
            <option value="">All Work Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <button
            onClick={() => {
              setSearchRole('');
              setSearchSkills('');
              setFilterWorkType('');
            }}
            className="rounded-lg bg-orange-500/20 px-4 py-2 font-semibold text-orange-200 transition hover:bg-orange-500/30"
          >
            Reset Filters
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500"></div>
          </div>
        ) : opportunities.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <Link key={opp._id} href={`/opportunity/${opp._id}`}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 cursor-pointer">
                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-6">
                      <h3 className="text-center text-lg font-bold text-orange-300">{opp.role_title}</h3>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-1 text-xs font-semibold text-orange-200">
                          {opp.work_type}
                        </span>
                        <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">
                          {opp.commitment_level}
                        </span>
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
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 disabled:opacity-50 hover:border-orange-400/30"
                >
                  Previous
                </button>
                <span className="text-zinc-400">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 disabled:opacity-50 hover:border-orange-400/30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
            <p className="text-zinc-300">No opportunities found matching your search</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default BrowseOpportunities;
