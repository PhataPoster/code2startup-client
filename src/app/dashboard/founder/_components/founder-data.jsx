"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const FREE_OPP_LIMIT = 3;

const FounderDataContext = createContext(null);

export function FounderDataProvider({ user, children }) {
  const router = useRouter();
  const [startups, setStartups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [startupsRes, appsRes, premiumRes] = await Promise.all([
        api.get("/startups"),
        api.get("/applications/founder?limit=100"),
        api.get("/payments/status").catch(() => ({ data: { isPremium: false } })),
      ]);
      const mine = (startupsRes.data || []).filter(
        (s) => s.founder_email === user.email
      );
      setStartups(mine);
      setApplications(appsRes.data || []);
      setIsPremium(!!premiumRes?.data?.isPremium);

      const oppResults = await Promise.all(
        mine.map((s) =>
          api
            .get(`/opportunities?startup_id=${s._id}&limit=50`)
            .then((r) => (r.data || []).map((o) => ({ ...o, startup: s })))
            .catch(() => [])
        )
      );
      setOpportunities(oppResults.flat());
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Data-fetch effect — calling setState when the response arrives is
    // exactly the "sync with external system" pattern the rule allows.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.role === "founder") fetchAll();
  }, [user, fetchAll]);

  const stats = useMemo(
    () => ({
      startups: startups.length,
      opportunities: opportunities.length,
      pendingApps: applications.filter((a) => a.status === "pending").length,
      totalApps: applications.length,
    }),
    [startups, opportunities, applications]
  );

  // Admin-approval gate (server enforces too — these are for UI affordances).
  const hasApprovedStartup = useMemo(
    () => startups.some((s) => s.status === "Active"),
    [startups]
  );
  const pendingStartups = useMemo(
    () => startups.filter((s) => s.status === "Pending").length,
    [startups]
  );

  const hitsFreeLimit = opportunities.length >= FREE_OPP_LIMIT && !isPremium;

  // ===== Startup handlers =====
  // `target` is the startup being edited, or `null` to create a new one.
  const submitStartup = useCallback(
    async (target, payload) => {
      setError("");
      try {
        if (target && target._id) {
          await api.put(`/startups/${target._id}`, payload);
        } else {
          await api.post("/startups", payload);
        }
        await fetchAll();
        return { ok: true };
      } catch (err) {
        setError(err.message);
        return { ok: false, error: err };
      }
    },
    [fetchAll]
  );

  const deleteStartup = useCallback(
    async (startup) => {
      try {
        await api.delete(`/startups/${startup._id}`);
        await fetchAll();
        return { ok: true };
      } catch (err) {
        setError(err.message);
        return { ok: false, error: err };
      }
    },
    [fetchAll]
  );

  // ===== Opportunity handlers =====
  // `target` is the opportunity being edited, or `null` to create a new one.
  const submitOpportunity = useCallback(
    async (target, payload) => {
      setError("");
      try {
        if (target && target._id) {
          await api.put(`/opportunities/${target._id}`, payload);
        } else {
          await api.post("/opportunities", payload);
        }
        await fetchAll();
        return { ok: true };
      } catch (err) {
        if (err.status === 402) {
          setError(
            "Free plan limit reached. Upgrade to Premium to post unlimited opportunities."
          );
          setTimeout(() => router.push("/pricing"), 1500);
        } else {
          setError(err.message);
        }
        return { ok: false, error: err };
      }
    },
    [fetchAll, router]
  );

  const deleteOpportunity = useCallback(
    async (opp) => {
      try {
        await api.delete(`/opportunities/${opp._id}`);
        await fetchAll();
        return { ok: true };
      } catch (err) {
        setError(err.message);
        return { ok: false, error: err };
      }
    },
    [fetchAll]
  );

  const updateApplicationStatus = useCallback((appId, newStatus) => {
    setApplications((apps) =>
      apps.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );
  }, []);

  const value = {
    // identity (consumed by layout/header subcomponents)
    user,
    // state
    startups,
    opportunities,
    applications,
    loading,
    error,
    isPremium,
    stats,
    hitsFreeLimit,
    FREE_OPP_LIMIT,
    hasApprovedStartup,
    pendingStartups,
    // actions
    refresh: fetchAll,
    submitStartup,
    deleteStartup,
    submitOpportunity,
    deleteOpportunity,
    updateApplicationStatus,
  };

  return (
    <FounderDataContext.Provider value={value}>
      {children}
    </FounderDataContext.Provider>
  );
}

export function useFounderData() {
  const ctx = useContext(FounderDataContext);
  if (!ctx) {
    throw new Error("useFounderData must be used inside <FounderDataProvider>");
  }
  return ctx;
}
