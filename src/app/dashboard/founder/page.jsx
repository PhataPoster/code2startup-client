'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FounderDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [startups, setStartups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStartup, setShowAddStartup] = useState(false);
  const [startupForm, setStartupForm] = useState({
    startup_name: '',
    logoURL: '',
    industry: '',
    description: '',
    funding_stage: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'founder') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
      fetchData(parsedUser.email);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchData = async (email) => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    try {
      const [startupsRes] = await Promise.all([
        fetch(`${apiUrl}/startups`),
      ]);
      const startupsData = await startupsRes.json();
      const founderStartups = startupsData.data?.filter(s => s.founder_email === email) || [];
      setStartups(founderStartups);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStartup = async (e) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${apiUrl}/startups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...startupForm,
          founder_email: user.email,
        }),
      });
      if (res.ok) {
        alert('Startup created successfully!');
        setShowAddStartup(false);
        setStartupForm({
          startup_name: '',
          logoURL: '',
          industry: '',
          description: '',
          funding_stage: '',
        });
        fetchData(user.email);
      }
    } catch (error) {
      console.error('Error creating startup:', error);
      alert('Failed to create startup');
    }
  };

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

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Founder Dashboard</h1>
          <p className="mt-2 text-zinc-400">Welcome back, {user?.name || 'Founder'}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-zinc-400">Total Startups</p>
            <p className="mt-2 text-3xl font-bold">{startups.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-zinc-400">Total Opportunities</p>
            <p className="mt-2 text-3xl font-bold">{opportunities.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-zinc-400">Applications</p>
            <p className="mt-2 text-3xl font-bold">{applications.length}</p>
          </div>
        </div>

        {/* Create Startup Form */}
        {showAddStartup && (
          <div className="mb-8 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-8">
            <h2 className="text-2xl font-bold">Create New Startup</h2>
            <form onSubmit={handleCreateStartup} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Startup Name"
                value={startupForm.startup_name}
                onChange={(e) => setStartupForm({ ...startupForm, startup_name: e.target.value })}
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Logo URL"
                value={startupForm.logoURL}
                onChange={(e) => setStartupForm({ ...startupForm, logoURL: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Industry"
                value={startupForm.industry}
                onChange={(e) => setStartupForm({ ...startupForm, industry: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
              />
              <textarea
                placeholder="Description"
                value={startupForm.description}
                onChange={(e) => setStartupForm({ ...startupForm, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
                rows="4"
              />
              <select
                value={startupForm.funding_stage}
                onChange={(e) => setStartupForm({ ...startupForm, funding_stage: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
              >
                <option>Select Funding Stage</option>
                <option>Idea</option>
                <option>Seed</option>
                <option>Series A</option>
                <option>Series B</option>
              </select>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-bold text-white transition hover:bg-orange-600"
                >
                  Create Startup
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStartup(false)}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 font-bold text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Startups */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Startups</h2>
            <button
              onClick={() => setShowAddStartup(!showAddStartup)}
              className="rounded-lg bg-orange-500 px-4 py-2 font-bold text-white transition hover:bg-orange-600"
            >
              {showAddStartup ? 'Hide Form' : 'Add Startup'}
            </button>
          </div>

          {startups.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((startup) => (
                <div key={startup._id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xl font-bold">{startup.startup_name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{startup.industry}</p>
                  <p className="mt-3 text-sm text-zinc-300">{startup.description}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20">
                      Edit
                    </button>
                    <button className="flex-1 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
              <p className="text-zinc-300">No startups created yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default FounderDashboard;
