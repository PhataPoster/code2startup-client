"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/use-session";

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const { user } = useSession();
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [u, s, o, p] = await Promise.all([
        api.get("/users"),
        api.get("/startups"),
        api.get("/opportunities?limit=200"),
        api.get("/payments/admin").catch(() => []),
      ]);
      setUsers(u?.users || u || []);
      setStartups(s?.startups || s || []);
      setOpportunities(o?.opportunities || o || []);
      setPayments(Array.isArray(p) ? p : p?.payments || []);
    } catch (err) {
      setError(err?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [fetchAll]);

  const updateUserRole = useCallback(
    async (userId, role) => {
      await api.put(`/users/${userId}/role`, { role });
      await fetchAll();
    },
    [fetchAll]
  );

  const toggleStartupStatus = useCallback(
    async (startup) => {
      const next = startup.status === "active" ? "paused" : "active";
      await api.put(`/startups/${startup._id}/status`, { status: next });
      await fetchAll();
    },
    [fetchAll]
  );

  const moderateOpportunity = useCallback(
    async (opp) => {
      const next = opp.status === "open" ? "closed" : "open";
      await api.put(`/opportunities/${opp._id}/status`, { status: next });
      await fetchAll();
    },
    [fetchAll]
  );

  const stats = {
    users: users.length,
    founders: users.filter((u) => u.role === "founder").length,
    startups: startups.length,
    opportunities: opportunities.length,
    revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  return (
    <AdminDataContext.Provider
      value={{
        users,
        startups,
        opportunities,
        payments,
        stats,
        loading,
        error,
        refresh: fetchAll,
        updateUserRole,
        toggleStartupStatus,
        moderateOpportunity,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside <AdminDataProvider>");
  return ctx;
}