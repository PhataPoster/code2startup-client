"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Users as UsersIcon, ShieldAlert, Loader2 } from "lucide-react";
import { useAdminData } from "../_components/admin-data";
import { useSession } from "@/lib/use-session";
import UserRow from "../_components/UserRow";
import ConfirmDialog, { useConfirmTarget } from "@/components/confirm-dialog";
import { toast } from "@/lib/toast";

const ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "founder", label: "Founders" },
  { value: "collaborator", label: "Collaborators" },
  { value: "admin", label: "Admins" },
];

export default function AdminUsersPage() {
  const {
    users,
    usersTotal,
    usersPage,
    usersPages,
    usersLoadingMore,
    loading,
    error,
    searchUsers,
    loadMoreUsers,
    updateUserRole,
    toggleUserBlock,
  } = useAdminData();
  const { user: currentAdmin } = useSession();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busyEmail, setBusyEmail] = useState(null);
  const blockTarget = useConfirmTarget();
  const debounceRef = useRef(null);

  // Debounced search: hits the server (not the local filter) so results stay
  // consistent with what the API actually returns. 300ms is the sweet spot
  // for typeahead without spamming the network.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchUsers(search.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchUsers]);

  // Local role filter is applied on top of the server query (the server also
  // supports ?role=, but using it would require another request cycle, and
  // the page-side filter lets the role select respond instantly).
  const visible = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const handleRoleChange = async (target, nextRole) => {
    if (target.email === currentAdmin?.email && nextRole !== "admin") {
      toast.error("You can't change your own role here. Ask another admin.");
      return;
    }
    setBusyEmail(target.email);
    const res = await updateUserRole(target, nextRole);
    setBusyEmail(null);
    if (!res?.ok) {
      toast.error(
        res?.error?.message ||
          "Failed to update role. The server may have rejected it.",
      );
    } else {
      toast.success(`Role updated to ${nextRole}.`);
    }
  };

  const handleBlock = async (target) => {
    if (target.email === currentAdmin?.email) {
      toast.error("You can't block your own account.");
      return;
    }
    setBusyEmail(target.email);
    const res = await toggleUserBlock(target);
    setBusyEmail(null);
    blockTarget.clear();
    if (!res?.ok) {
      toast.error(res?.error?.message || "Failed to update block status.");
    } else {
      toast.success(res.isBlocked ? "User blocked." : "User unblocked.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Admin · Users
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <UsersIcon className="h-6 w-6 text-orange-300" />
            Manage users
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Review users, change roles, and block abuse. Total accounts:{" "}
            <span className="font-semibold text-white">{usersTotal}</span>.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total users" value={usersTotal} />
        <StatCard
          label="Loaded"
          value={`${users.length} / ${usersTotal}`}
          hint={usersPage < usersPages ? `page ${usersPage} of ${usersPages}` : "all loaded"}
        />
        <StatCard
          label="Currently blocked"
          value={users.filter((u) => u.isBlocked).length}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role…"
            className="w-full rounded-lg border border-white/10 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
        >
          {ROLE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/50">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-white/2 text-[10px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-3 py-3 font-semibold sm:px-6">User</th>
              <th className="px-3 py-3 font-semibold sm:px-6">Email</th>
              <th className="px-3 py-3 font-semibold sm:px-6">Role</th>
              <th className="px-3 py-3 font-semibold sm:px-6">Status</th>
              <th className="px-3 py-3 text-right font-semibold sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-zinc-500"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-orange-300" />
                  <p className="mt-2">Loading users…</p>
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-zinc-500"
                >
                  No users match your search.
                </td>
              </tr>
            ) : (
              visible.map((u) => (
                <UserRow
                  key={u._id || u.email}
                  user={u}
                  busy={busyEmail === u.email}
                  onChangeRole={(nextRole) => handleRoleChange(u, nextRole)}
                  onBlock={(target) => blockTarget.request(target)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <p>
          Showing <span className="font-semibold text-white">{visible.length}</span>{" "}
          of <span className="font-semibold text-white">{usersTotal}</span>
        </p>
        {usersPage < usersPages && (
          <button
            type="button"
            onClick={loadMoreUsers}
            disabled={usersLoadingMore}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:border-orange-400 disabled:opacity-60"
          >
            {usersLoadingMore ? (
              <Loader2 size={12} className="animate-spin" />
            ) : null}
            Load more
          </button>
        )}
      </div>

      <ConfirmDialog
        open={!!blockTarget.target}
        title={
          blockTarget.target?.isBlocked
            ? `Unblock ${blockTarget.target?.name || blockTarget.target?.email}?`
            : `Block ${blockTarget.target?.name || blockTarget.target?.email}?`
        }
        description={
          blockTarget.target?.isBlocked
            ? "They'll be able to sign in and use the platform again immediately."
            : "They will be signed out and prevented from signing in until you unblock them."
        }
        confirmLabel={blockTarget.target?.isBlocked ? "Unblock user" : "Block user"}
        intent="danger"
        busy={busyEmail === blockTarget.target?.email}
        onConfirm={() => handleBlock(blockTarget.target)}
        onCancel={blockTarget.clear}
      />
    </section>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}