'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
      fetchAllData();
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchAllData = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    try {
      const [usersRes, startupsRes, paymentsRes, opportunitiesRes] = await Promise.all([
        fetch(`${apiUrl}/users`),
        fetch(`${apiUrl}/startups`),
        fetch(`${apiUrl}/payments`),
        fetch(`${apiUrl}/opportunities`),
      ]);

      const usersData = await usersRes.json();
      const startupsData = await startupsRes.json();
      const paymentsData = await paymentsRes.json();
      const opportunitiesData = await opportunitiesRes.json();

      setUsers(usersData.data || []);
      setStartups(startupsData.data || []);
      setPayments(paymentsData.data || []);
      setOpportunities(opportunitiesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (email, isBlocked) => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${apiUrl}/users/${email}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
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

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-zinc-400">Manage the platform</p>
        </div>

        {/* Overview Stats */}
        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-zinc-400">Total Users</p>
              <p className="mt-2 text-3xl font-bold">{users.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-zinc-400">Total Startups</p>
              <p className="mt-2 text-3xl font-bold">{startups.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-zinc-400">Total Opportunities</p>
              <p className="mt-2 text-3xl font-bold">{opportunities.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-zinc-400">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold">${totalRevenue}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 mt-8 flex gap-4 border-b border-white/10">
          {['overview', 'users', 'startups', 'transactions'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-semibold transition capitalize ${
                tab === t
                  ? 'border-b-2 border-orange-500 text-orange-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Manage Users</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email} className="border-t border-white/10">
                      <td className="px-6 py-3">{u.name}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">{u.role}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          u.isBlocked ? 'bg-red-500/10 text-red-200' : 'bg-green-500/10 text-green-200'
                        }`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleBlockUser(u.email, u.isBlocked)}
                          className={`rounded px-3 py-1 text-xs font-semibold ${
                            u.isBlocked
                              ? 'bg-green-500/10 text-green-200 hover:bg-green-500/20'
                              : 'bg-red-500/10 text-red-200 hover:bg-red-500/20'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Startups Tab */}
        {tab === 'startups' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Manage Startups</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {startups.map((startup) => (
                <div key={startup._id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-bold">{startup.startup_name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{startup.founder_email}</p>
                  <p className="mt-2 text-sm text-zinc-300">{startup.industry}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg border border-green-400/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-200 hover:bg-green-500/20">
                      Approve
                    </button>
                    <button className="flex-1 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === 'transactions' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Transactions</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-t border-white/10">
                      <td className="px-6 py-3">{p.user_email}</td>
                      <td className="px-6 py-3">${p.amount}</td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-200">
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-3">{new Date(p.paid_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
