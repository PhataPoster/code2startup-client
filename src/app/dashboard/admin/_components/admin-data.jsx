"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/use-session";

const AdminDataContext = createContext(null);

const USERS_PAGE_SIZE = 25;

export function AdminDataProvider({ children }) {
  const { user } = useSession();
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [payments, setPayments] = useState([]);

  // User list pagination state — server returns { data, page, limit, total, pages }.
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPages, setUsersPages] = useState(1);
  const [usersQuery, setUsersQuery] = useState("");
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-fetched when the search query changes (debounced in the page).
  const fetchUsers = useCallback(
    async ({ page = 1, q = "", append = false } = {}) => {
      try {
        if (append) setUsersLoadingMore(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(USERS_PAGE_SIZE));
        if (q) params.set("q", q);
        const res = await api.get(`/users?${params.toString()}`);
        const data = res?.data || [];
        const total = res?.total ?? data.length;
        const pages = res?.pages ?? 1;
        setUsers((prev) => (append ? [...prev, ...data] : data));
        setUsersTotal(total);
        setUsersPages(pages);
        setUsersPage(page);
        return { ok: true, data, total, pages };
      } catch (err) {
        setError(err?.message || "Failed to load users");
        return { ok: false, error: err };
      } finally {
        if (append) setUsersLoadingMore(false);
      }
    },
    []
  );

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [s, o, p, u] = await Promise.all([
        // Admin view — must see Pending + Removed too, not just Active.
        // The public /startups endpoint hard-filters to status=Active, so
        // we hit /admin/startups which returns the full moderation queue.
        api.get("/admin/startups"),
        // Same story: public /opportunities hides anything whose startup is
        // not Active, so admins need /admin/opportunities to see them all.
        api.get("/admin/opportunities"),
        api.get("/payments").catch(() => ({ data: [] })),
        fetchUsers({ page: 1, q: usersQuery, append: false }),
      ]);
      setStartups(s?.data || s?.startups || []);
      setOpportunities(o?.data || o?.opportunities || []);
      setPayments(p?.data || []);
      if (!u?.ok) throw u?.error || new Error("Failed to load users");
    } catch (err) {
      setError(err?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
    // usersQuery intentionally omitted from deps to avoid an infinite re-fetch
    // loop; the page calls fetchUsers directly when the search input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchUsers]);

  useEffect(() => {
    // Defer to a microtask so we don't synchronously set state during the
    // effect's first render — React 19 flags that as a cascading render.
    queueMicrotask(() => {
      fetchAll();
    });
  }, [fetchAll]);

  const updateUserRole = useCallback(
    async (targetUser, role) => {
      // Server route is keyed by email, not by id.
      const email = typeof targetUser === "string" ? targetUser : targetUser?.email;
      if (!email) return { ok: false, error: new Error("Missing user email") };
      try {
        await api.put(`/users/${encodeURIComponent(email)}/role`, { role });
        // Refresh just the users list so the rest of the dashboard isn't
        // re-fetched for a single role change.
        await fetchUsers({ page: 1, q: usersQuery, append: false });
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err };
      }
    },
    [fetchUsers, usersQuery]
  );

  const toggleUserBlock = useCallback(
    async (targetUser) => {
      const email = typeof targetUser === "string" ? targetUser : targetUser?.email;
      const current = !!targetUser?.isBlocked;
      if (!email) return { ok: false, error: new Error("Missing user email") };
      try {
        await api.put(`/users/${encodeURIComponent(email)}/block`, {
          isBlocked: !current,
        });
        // Optimistic local update so the row reflects the change instantly,
        // then re-sync with the server to keep the table authoritative.
        setUsers((prev) =>
          prev.map((u) =>
            u.email === email ? { ...u, isBlocked: !current } : u
          )
        );
        await fetchUsers({ page: 1, q: usersQuery, append: false });
        return { ok: true, isBlocked: !current };
      } catch (err) {
        return { ok: false, error: err };
      }
    },
    [fetchUsers, usersQuery]
  );

  const loadMoreUsers = useCallback(async () => {
    if (usersPage >= usersPages) return { ok: false, error: new Error("No more users") };
    return fetchUsers({ page: usersPage + 1, q: usersQuery, append: true });
  }, [fetchUsers, usersPage, usersPages, usersQuery]);

  const searchUsers = useCallback(
    async (q) => {
      setUsersQuery(q);
      return fetchUsers({ page: 1, q, append: false });
    },
    [fetchUsers]
  );

  const toggleStartupStatus = useCallback(
    async (startupOrId, explicitStatus) => {
      // Accept either (startup, nextStatus) or (startup) — defaults to a
      // binary Active/Pending toggle for callers that just want a flip.
      const target =
        typeof startupOrId === "string"
          ? { _id: startupOrId }
          : startupOrId;
      const next =
        explicitStatus ||
        (target.status === "Active" ? "Pending" : "Active");
      if (!target?._id)
        return { ok: false, error: new Error("Missing startup id") };
      if (!["Active", "Pending", "Removed"].includes(next))
        return { ok: false, error: new Error("Invalid status") };
      try {
        // Server has /admin/startups/:id/status (accepts Active|Pending|Removed)
        await api.put(`/admin/startups/${target._id}/status`, { status: next });
        // Optimistic local update so the card flips instantly.
        setStartups((prev) =>
          prev.map((s) => (s._id === target._id ? { ...s, status: next } : s))
        );
        // Then re-sync with the server (so e.g. updated_at stays accurate).
        await fetchAll();
        return { ok: true, status: next };
      } catch (err) {
        return { ok: false, error: err };
      }
    },
    [fetchAll]
  );

  const moderateOpportunity = useCallback(
    async (opp) => {
      const next = opp.status === "open" ? "closed" : "open";
      try {
        // Server has /admin/opportunities/:id/status
        await api.put(`/admin/opportunities/${opp._id}/status`, { status: next });
        await fetchAll();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err };
      }
    },
    [fetchAll]
  );

  const deleteStartup = useCallback(
    async (startup) => {
      if (!startup?._id)
        return { ok: false, error: new Error("Missing startup id") };
      try {
        // Server: DELETE /admin/startups/:id (cascades to opps + applications)
        await api.delete(`/admin/startups/${startup._id}`);
        // Optimistic local removal so the card disappears instantly.
        setStartups((prev) => prev.filter((s) => s._id !== startup._id));
        setOpportunities((prev) =>
          prev.filter((o) => o.startup_id !== startup._id)
        );
        // Re-sync with the server to pick up cascading deletes.
        await fetchAll();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err };
      }
    },
    [fetchAll]
  );

  const stats = {
    users: usersTotal,
    founders: users.filter((u) => u.role === "founder").length,
    startups: startups.length,
    opportunities: opportunities.length,
    revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  return (
    <AdminDataContext.Provider
      value={{
        users,
        usersTotal,
        usersPage,
        usersPages,
        usersLoadingMore,
        usersQuery,
        startups,
        opportunities,
        payments,
        stats,
        loading,
        error,
        refresh: fetchAll,
        searchUsers,
        loadMoreUsers,
        updateUserRole,
        toggleUserBlock,
        toggleStartupStatus,
        moderateOpportunity,
        deleteStartup,
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