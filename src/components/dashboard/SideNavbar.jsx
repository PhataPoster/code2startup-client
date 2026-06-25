"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  UserCircle2,
  Users,
  DollarSign,
  Search,
  Settings2,
  LogOut,
  Crown,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand-mark";

// Each role gets a list of side-nav items. Every item is now a real route so
// Next.js performs an actual navigation (and re-mount) when the user clicks.
const MENUS = {
  founder: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard/founder" },
    { id: "my-startup", label: "My Startup", icon: Building2, href: "/dashboard/founder/startups" },
    { id: "add-opportunity", label: "Add Opportunity", icon: Plus, href: "/dashboard/founder/opportunities/new" },
    { id: "manage-opportunities", label: "Manage Opportunities", icon: Briefcase, href: "/dashboard/founder/opportunities" },
    { id: "applications", label: "Applications", icon: FileText, href: "/dashboard/founder/applications" },
  ],
  collaborator: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard/collaborator" },
    { id: "my-applications", label: "My Applications", icon: FileText, href: "/dashboard/collaborator/applications" },
    { id: "browse", label: "Browse Opportunities", icon: Search, href: "/dashboard/collaborator/browse" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
    { id: "manage-users", label: "Manage Users", icon: Users, href: "/dashboard/admin/users" },
    { id: "manage-startups", label: "Manage Startups", icon: Building2, href: "/dashboard/admin/startups" },
    { id: "transactions", label: "Transactions", icon: DollarSign, href: "/dashboard/admin/transactions" },
  ],
};

function getInitials(name = "", email = "") {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * DashboardSideNav — role-aware left sidebar shown on every dashboard page.
 * Hides itself on small screens (use the top navbar for mobile).
 */
export function DashboardSideNav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, loading } = useSession();
  const role = user?.role || "collaborator";
  const items = MENUS[role] || MENUS.collaborator;

  // An item is active when the current path matches its href, or is a child
  // of it (e.g. /dashboard/founder/opportunities/new is a child of .../opportunities).
  const isActive = (item) => {
    if (!item.href) return false;
    if (item.href === "/dashboard/founder" || item.href === "/dashboard/collaborator" || item.href === "/dashboard/admin") {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const handleClick = (item) => (e) => {
    e.preventDefault();
    if (item.href) router.push(item.href);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
    clearAuthToken();
    try {
      localStorage.removeItem("user");
    } catch {}
    setTimeout(() => {
      try {
        window.dispatchEvent(new Event("auth-change"));
      } catch {}
      router.push("/");
    }, 0);
  };

  const initials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-white/10 bg-zinc-950/95 px-4 py-6 lg:flex lg:flex-col"
      aria-label="Dashboard navigation"
    >
      {/* Brand */}
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 rounded-2xl px-2 py-1 transition hover:bg-white/5"
      >
        <BrandMark className="h-9 w-9" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-white">
            Code2Startup
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-orange-300">
            {role} workspace
          </span>
        </span>
      </Link>

      {/* User chip — shows the profile image if one is set, otherwise
          falls back to initials. Mirrors the pattern in site-navbar. */}
      <Link
        href="/profile"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-orange-500 to-amber-400 text-sm font-black text-white shadow-lg shadow-orange-500/30">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user?.name || user?.email || "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">
            {loading ? "Loading…" : user?.name || user?.email || "Guest"}
          </span>
          <span className="block truncate text-xs text-zinc-400">
            {user?.email}
          </span>
        </span>
        <UserCircle2 className="h-4 w-4 text-zinc-500" />
      </Link>

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.id}
              onClick={handleClick(item)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`h-4 w-4 transition ${
                  active ? "text-orange-300" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === "manage-opportunities" && role === "founder" && (
                <Crown className="h-3.5 w-3.5 text-orange-300/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
        <Link
          href="/browse-opportunities"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
        >
          <Search className="h-4 w-4 text-zinc-400" />
          Browse public site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

// Inline icon used by the founder "Add Opportunity" entry to keep this file
// self-contained without dragging in another lucide import at the top.
function Plus(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
