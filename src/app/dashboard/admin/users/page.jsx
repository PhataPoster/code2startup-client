"use client";

import UserRow from "../_components/UserRow";
import { useAdminData } from "../_components/admin-data";

export default function AdminUsersPage() {
  const { users, updateUserRole, loading, error } = useAdminData();

  if (loading) return <p className="text-sm text-zinc-400">Loading users…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>
      <p className="text-xs text-zinc-500">{users.length} accounts total.</p>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                onChangeRole={(role) => updateUserRole(u, role)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}