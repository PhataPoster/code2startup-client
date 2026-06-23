"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Briefcase,
  DollarSign,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { api, clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import UserRow from "./_components/UserRow";
import StartupModerationCard from "./_components/StartupModerationCard";
import TransactionRow from "./_components/TransactionRow";
import Pagination from "@/components/Pagination";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "startups", label: "Startups" },
  { id: "transactions", label: "Transactions" },
];

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardInner />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
    </div>
  );
}

function AdminDashboardInner() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [startupFilter, setStartupFilter] = useState("all");

  // Pagination
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersMeta, setUsersMeta] = useState({ total: 0, pages: 1 });
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit, setPaymentsLimit] = useState(10);
  const [paymentsMeta, setPaymentsMeta] = useState({ total: 0, pages: 1 });

  // ===== Auth / Role gate =====
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/dashboard/admin")}`);
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, sessionLoading, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ===== Data fetch =====
  const fetchAll = async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    setError("");
    try {
      const usersQs = `page=${usersPage}&limit=${usersLimit}${
        userSearch ? `&q=${encodeURIComponent(userSearch)}` : ""
      }`;
      const [usersRes, startupsRes, oppsRes, paymentsRes] = await Promise.all([
        api.get(`/users?${usersQs}`),
        api.get("/startups?limit=200"),
        api.get("/opportunities?limit=200"),
        api.get(`/payments?page=${paymentsPage}&limit=${paymentsLimit}`),
      ]);
      setUsers(usersRes.data || []);
      setStartups(startupsRes.data || []);
      setOpportunities(oppsRes.data || []);
      setPayments(paymentsRes.data || []);
      setUsersMeta({ total: usersRes.total ?? 0, pages: usersRes.pages ?? 1 });
      setPaymentsMeta({ total: paymentsRes.total ?? 0, pages: paymentsRes.pages ?? 1 });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, usersPage, usersLimit, paymentsPage, paymentsLimit]);

  // Debounced refetch on user search.
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const t = setTimeout(() => {
      setUsersPage(1);
      fetchAll();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch]);

  // ===== Stats =====
  const totalRevenue = useMemo(
    () =>
      payments
        .filter(
          (p) => p.payment_status === "completed" || p.payment_status === "paid"
        )
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );

  const stats = useMemo(
    () => ({
      users: users.length,
      startups: startups.length,
      pendingStartups: startups.filter((s) => s.status === "Pending").length,
      opportunities: opportunities.length,
      revenue: totalRevenue,
    }),
    [users, startups, opportunities, totalRevenue]
  );

  // ===== Filtered lists =====
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredStartups = useMemo(() => {
    if (startupFilter === "all") return startups;
    return startups.filter((s) => (s.status || "Pending") === startupFilter);
  }, [startups, startupFilter]);

  // ===== Handlers =====
  const handleBlockUser = async (u) => {
    setBusy(true);
    try {
      await api.put(`/users/${u.email}/block`, { isBlocked: !u.isBlocked });
      setToast({
        type: "success",
        message: u.isBlocked
          ? `Unblocked ${u.email}`
          : `Blocked ${u.email}`,
      });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleApproveStartup = async (s) => {
    setBusy(true);
    try {
      await api.put(`/admin/startups/${s._id}/status`, { status: "Active" });
      setToast({ type: "success", message: `Approved ${s.startup_name}` });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRejectStartup = async (s) => {
    if (
      !confirm(
        `Reject "${s.startup_name}"? It will be hidden from public listings.`
      )
    )
      return;
    setBusy(true);
    try {
      await api.put(`/admin/startups/${s._id}/status`, { status: "Rejected" });
      setToast({ type: "success", message: `Rejected ${s.startup_name}` });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
    clearAuthToken();
    router.push("/login");
  };

  if (sessionLoading) return <DashboardSkeleton />;
  if (!user || user.role !== "admin") return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-zinc-400">
              Platform overview · Signed in as {user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut size={14} /> Sign out
          </button>
        </header>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              toast.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-amber-400/30 bg-amber-500/10 text-amber-200"
            }`}
          >
            <CheckCircle2 size={16} /> {toast.message}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Users} label="Users" value={stats.users} />
          <StatCard
            icon={Building2}
            label="Startups"
            value={stats.startups}
            sub={`${stats.pendingStartups} pending`}
          />
          <StatCard
            icon={Briefcase}
            label="Opportunities"
            value={stats.opportunities}
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={`$${stats.revenue.toFixed(2)}`}
            accent="emerald"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold capitalize transition ${
                tab === t.id
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.label}
              {t.id === "startups" && stats.pendingStartups > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">
                  {stats.pendingStartups}
                </span>
              )}
              {tab === t.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-linear-to-r from-orange-500 to-amber-400" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {/* ===== Overview ===== */}
            {tab === "overview" && (
              <section className="grid gap-4 sm:grid-cols-2">
                <Panel title="Recent Users" count={users.slice(0, 5).length}>
                  {users.slice(0, 5).map((u) => (
                    <div
                      key={u.email}
                      className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {u.name || u.email}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {u.email}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-200">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </Panel>
                <Panel title="Recent Transactions" count={payments.slice(0, 5).length}>
                  {payments.slice(0, 5).map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-sm"
                    >
                      <p className="truncate font-semibold text-white">
                        {p.user_email}
                      </p>
                      <p className="text-xs font-bold text-emerald-300">
                        ${Number(p.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </Panel>
              </section>
            )}

            {/* ===== Users ===== */}
            {tab === "users" && (
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">Manage Users</h2>
                  <div className="relative">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      placeholder="Search name / email / role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="rounded-lg border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                  <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/2">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-sm text-zinc-400"
                          >
                            No users match.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <UserRow
                            key={u.email}
                            user={u}
                            onBlock={handleBlockUser}
                            busy={busy}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={usersPage}
                  pages={usersMeta.pages}
                  total={usersMeta.total}
                  limit={usersLimit}
                  onPage={setUsersPage}
                  onLimit={setUsersLimit}
                  busy={busy || loading}
                />
              </section>
            )}

            {/* ===== Startups ===== */}
            {tab === "startups" && (
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">Moderate Startups</h2>
                  <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                    {["all", "Pending", "Active", "Rejected"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setStartupFilter(f)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                          startupFilter === f
                            ? "bg-orange-500 text-white"
                            : "text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        {f === "all" ? "All" : f}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredStartups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-zinc-400">
                    No startups in this filter.
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredStartups.map((s) => (
                      <StartupModerationCard
                        key={s._id}
                        startup={s}
                        onApprove={handleApproveStartup}
                        onRemove={handleRejectStartup}
                        busy={busy}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ===== Transactions ===== */}
            {tab === "transactions" && (
              <section>
                <h2 className="mb-4 text-xl font-bold">Transactions</h2>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                  <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/2">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-sm text-zinc-400"
                          >
                            No transactions yet.
                          </td>
                        </tr>
                      ) : (
                        payments.map((p) => (
                          <TransactionRow key={p._id} payment={p} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={paymentsPage}
                  pages={paymentsMeta.pages}
                  total={paymentsMeta.total}
                  limit={paymentsLimit}
                  onPage={setPaymentsPage}
                  onLimit={setPaymentsLimit}
                  busy={busy || loading}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, accent = null, sub = null }) {
  const accentClass =
    accent === "emerald"
      ? "border-emerald-400/30 bg-emerald-500/10"
      : "border-white/10 bg-white/5";
  return (
    <div className={`rounded-2xl border p-5 ${accentClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        {Icon && <Icon size={14} className="text-zinc-500" />}
      </div>
      <p className="mt-1.5 text-3xl font-black">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-zinc-400">{sub}</p>}
    </div>
  );
}

function Panel({ title, count, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 py-2">
      <div className="flex items-center justify-between px-5 py-2">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
