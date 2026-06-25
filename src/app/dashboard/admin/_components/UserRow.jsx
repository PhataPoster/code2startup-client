"use client";

import { Shield, ShieldOff, Crown, User as UserIcon, Briefcase, Loader2 } from "lucide-react";

const ROLE_ICONS = {
  admin: Crown,
  founder: Briefcase,
  collaborator: UserIcon,
};

const ROLE_STYLES = {
  admin: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  founder: "border-orange-400/30 bg-orange-500/10 text-orange-200",
  collaborator: "border-sky-400/30 bg-sky-500/10 text-sky-200",
};

export default function UserRow({ user, onBlock, onChangeRole, busy }) {
  const Icon = ROLE_ICONS[user.role] || UserIcon;
  return (
    <tr
      aria-busy={busy || undefined}
      className="border-t border-white/10 transition hover:bg-white/2 aria-busy:bg-white/3"
    >
      <td className="px-3 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-xs font-bold text-white">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <span className="font-semibold text-white">{user.name || "—"}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-zinc-300 sm:px-6">{user.email}</td>
      <td className="px-3 py-3 sm:px-6">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            ROLE_STYLES[user.role] || "border-white/10 bg-white/5 text-zinc-200"
          }`}
        >
          <Icon size={11} /> {user.role}
        </span>
      </td>
      <td className="px-3 py-3 sm:px-6">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            user.isBlocked
              ? "bg-rose-500/15 text-rose-300"
              : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      </td>
      <td className="px-3 py-3 text-right sm:px-6">
        <div className="inline-flex items-center gap-2">
          {onChangeRole && (
            <select
              aria-label={`Change role for ${user.email}`}
              value={user.role || "collaborator"}
              onChange={(e) => onChangeRole(e.target.value)}
              disabled={busy}
              className="rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-xs font-semibold text-white focus:border-orange-400 focus:outline-none disabled:opacity-60"
            >
              <option value="collaborator">Collaborator</option>
              <option value="founder">Founder</option>
              <option value="admin">Admin</option>
            </select>
          )}
          <button
            type="button"
            onClick={() => onBlock(user)}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              user.isBlocked
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                : "border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
            }`}
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" />
            ) : user.isBlocked ? (
              <Shield size={12} />
            ) : (
              <ShieldOff size={12} />
            )}
            {user.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </td>
    </tr>
  );
}
