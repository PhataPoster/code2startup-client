'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const StartupDetails = () => {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartup = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${apiUrl}/startups/${id}`);
        const { data } = await res.json();
        setStartup(data);
      } catch (error) {
        console.error('Error fetching startup:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStartup();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-white text-xl">Startup not found</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-8 sm:p-12">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {startup.logoURL ? (
                <img
                  src={startup.logoURL}
                  alt={startup.startup_name}
                  className="h-32 w-32 rounded-xl border-2 border-orange-400/30 object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-orange-400/30 bg-white/10 text-4xl font-black text-orange-300">
                  {startup.startup_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl font-black sm:text-5xl">{startup.startup_name}</h1>
                <p className="mt-2 text-lg text-zinc-400">{startup.founder_email}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-1 text-sm font-semibold text-orange-200">
                    {startup.industry}
                  </span>
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1 text-sm font-semibold text-blue-200">
                    {startup.funding_stage}
                  </span>
                  <span className="rounded-full border border-green-400/20 bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-200">
                    {startup.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 sm:p-12">
            <div>
              <h2 className="text-2xl font-bold">About</h2>
              <p className="mt-4 leading-7 text-zinc-300">{startup.description || 'No description provided'}</p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-zinc-400">INDUSTRY</h3>
                <p className="mt-2 text-xl font-bold">{startup.industry}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-zinc-400">FUNDING STAGE</h3>
                <p className="mt-2 text-xl font-bold">{startup.funding_stage}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-zinc-400">STATUS</h3>
                <p className="mt-2 text-xl font-bold">{startup.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StartupDetails;
