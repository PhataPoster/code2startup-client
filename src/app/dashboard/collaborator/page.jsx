'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CollaboratorDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'collaborator') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
      fetchApplications(parsedUser.email);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchApplications = async (email) => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${apiUrl}/applications/user/${email}`);
      const { data } = await res.json();
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
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

  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const acceptedApps = applications.filter(a => a.status === 'Accepted').length;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Collaborator Dashboard</h1>
          <p className="mt-2 text-zinc-400">Welcome back, {user?.name || 'Collaborator'}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-zinc-400">Total Applications</p>
            <p className="mt-2 text-3xl font-bold">{applications.length}</p>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <p className="text-sm font-semibold text-yellow-200">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-200">{pendingApps}</p>
          </div>
          <div className="rounded-2xl border border-green-400/20 bg-green-500/10 p-6">
            <p className="text-sm font-semibold text-green-200">Accepted</p>
            <p className="mt-2 text-3xl font-bold text-green-200">{acceptedApps}</p>
          </div>
        </div>

        {/* My Applications */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">My Applications</h2>

          {applications.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {applications.map((app) => (
                <div key={app._id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Opportunity {app.opportunity_id}</h3>
                      <p className="mt-1 text-sm text-zinc-400">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      app.status === 'Accepted' ? 'bg-green-500/10 text-green-200' :
                      app.status === 'Rejected' ? 'bg-red-500/10 text-red-200' :
                      'bg-yellow-500/10 text-yellow-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.portfolio_link && (
                    <p className="mt-3 text-sm">
                      <a href={app.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                        View Portfolio →
                      </a>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-zinc-300">{app.motivation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
              <p className="text-zinc-300">No applications yet. Start exploring opportunities!</p>
            </div>
          )}
        </div>

        {/* Browse Opportunities Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/browse-opportunities')}
            className="rounded-lg bg-orange-500 px-6 py-2 font-bold text-white transition hover:bg-orange-600"
          >
            Browse Opportunities
          </button>
        </div>
      </div>
    </main>
  );
};

export default CollaboratorDashboard;
