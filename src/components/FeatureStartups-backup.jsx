'use client';

import { useState, useEffect } from 'react';
import { fetchStartups } from '@/lib/fetch';
import Image from 'next/image';

export default function FeatureStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const loadStartups = async () => {
  //     try {
  //       const data = await fetchStartups();
  //       setStartups(data);
  //     } catch (error) {
  //       console.error('Error loading startups:', error);
  //       setStartups([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadStartups();
  // }, []);

  if (loading) {
    return (
      <section className="bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Featured Startups</h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
            Featured Startups
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Latest Startup Ideas
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Discover the newest startups looking for team members.
          </p>
        </div>

        {startups.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {startups.map((startup) => (
              <article
                key={startup._id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/30"
              >
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-6">
                  {startup.logoURL ? (
                    <Image
                      src={startup.logoURL}
                      alt={startup.startup_name}
                      className="h-28 w-28 rounded-2xl border border-white/10 bg-white/10 object-cover shadow-xl shadow-black/20"
                      width={112}
                      height={112}
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black text-orange-300">
                      {startup.startup_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{startup.startup_name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{startup.founder_email}</p>
                    </div>
                    <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                      {startup.industry}
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-6 text-zinc-300">
                    {startup.description}
                  </p>
                  <div className="mt-6 border-t border-white/10 pt-4 text-sm text-zinc-300">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200">
                      {startup.funding_stage}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-zinc-300">
            No startups found yet.
          </div>
        )}
      </div>
    </section>
  );
}
