'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BrowseStartups = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${apiUrl}/startups`);
        const { data } = await res.json();
        setStartups(data || []);
      } catch (error) {
        console.error('Error fetching startups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading startups...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Browse Startups</h1>
          <p className="mt-2 text-zinc-400">Explore all startups on the platform</p>
        </div>

        {startups.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <Link
                key={startup._id}
                href={`/startup/${startup._id}`}
              >
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
                    <p className="mt-3 flex-1 text-sm leading-5 text-zinc-300">{startup.description || 'No description'}</p>
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
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
            <p className="text-zinc-300">No startups found</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default BrowseStartups;
