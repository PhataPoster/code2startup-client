"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/use-session";

const CollabDataContext = createContext(null);

export function CollabDataProvider({ children }) {
  const { user } = useSession();
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [myApps, open] = await Promise.all([
        api.get("/applications/me"),
        api.get("/opportunities?status=open&limit=50"),
      ]);
      setApplications(myApps?.applications || myApps || []);
      setOpportunities(open?.opportunities || open || []);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [fetchAll]);

  const submitApplication = useCallback(
    async ({ opportunity_id, cover_note }) => {
      const res = await api.post("/applications", { opportunity_id, cover_note });
      await fetchAll();
      return res;
    },
    [fetchAll]
  );

  const withdrawApplication = useCallback(
    async (app) => {
      await api.delete(`/applications/${app._id}`);
      await fetchAll();
    },
    [fetchAll]
  );

  const stats = {
    active: applications.filter((a) => a.status === "pending" || a.status === "reviewing")
      .length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    total: applications.length,
  };

  return (
    <CollabDataContext.Provider
      value={{
        applications,
        opportunities,
        stats,
        loading,
        error,
        refresh: fetchAll,
        submitApplication,
        withdrawApplication,
      }}
    >
      {children}
    </CollabDataContext.Provider>
  );
}

export function useCollabData() {
  const ctx = useContext(CollabDataContext);
  if (!ctx) throw new Error("useCollabData must be used inside <CollabDataProvider>");
  return ctx;
}