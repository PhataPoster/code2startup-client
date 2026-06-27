"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  UserCircle2,
  Users,
  DollarSign,
  Search,
  LogOut,
  Crown,
  Menu,
  X,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand-mark";
import { toast } from "@/lib/toast";

// Inline Plus icon — keeps this file self-contained and avoids another
// lucide import at the top of the list.
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

// Each role gets a list of side-nav items. Every item is a real route so
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

// ===== Drawer state context =====
//
// The sidebar (lg+) and slide-in drawer (<lg) share state via this context.
// Layouts wrap their tree in <DashboardSideNavProvider> and can drop a
// <DashboardSideNavTrigger /> anywhere inside to open the drawer.

const SideNavDrawerContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function useSideNavDrawer() {
  return useContext(SideNavDrawerContext);
}

/**
 * Provides drawer state to the rest of the dashboard tree. Must wrap
 * both <DashboardSideNav /> and any <DashboardSideNavTrigger /> buttons.
 */
export function DashboardSideNavProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "/";
  const pathRef = useRef(pathname);

  const open = useCallback(() => {
    pathRef.current = pathname;
    setIsOpen(true);
  }, [pathname]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Close on route change so a navigation inside the drawer doesn't
  // leave it open over the new page. The ref tracks the path we last
  // acted on, so setState only fires when it actually changed (and not
  // on initial mount, which would cause a cascading render).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      if (isOpen) setIsOpen(false);
    }
  }, [pathname, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Escape closes; body scroll is locked while the drawer is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );

  return (
    <SideNavDrawerContext.Provider value={value}>
      {children}
    </SideNavDrawerContext.Provider>
  );
}

/**
 * Hamburger button that toggles the mobile drawer. Visible only on screens
 * smaller than lg. Place it in a top bar above the page content so the
 * user has somewhere obvious to tap to reach the drawer.
 */
export function DashboardSideNavTrigger({ className = "" }) {
  const { isOpen, toggle } = useSideNavDrawer();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/70 lg:hidden ${className}`}
      aria-label={isOpen ? "Close dashboard navigation" : "Open dashboard navigation"}
      aria-expanded={isOpen}
      aria-controls="dashboard-mobile-drawer"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}

// ===== Reusable menu bits =====

function SideNavMenuItems({ items, role, isActive, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <button
            key={item.id}
            onClick={onNavigate(item)}
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
  );
}

function SideNavFooterActions({ onLogout }) {
  return (
    <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
      <Link
        href="/browse-opportunities"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        <Search className="h-4 w-4 text-zinc-400" />
        Browse public site
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}

function SideNavUserChip({ user, loading, initials }) {
  return (
    <Link
      href="/profile"
      className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-orange-500 to-amber-400 text-sm font-black text-white shadow-lg shadow-orange-500/30">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user?.name || user?.email || "Profile"}
            width={40}
            height={40}
            unoptimized
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
        <span className="block truncate text-xs text-zinc-400">{user?.email}</span>
      </span>
      <UserCircle2 className="h-4 w-4 text-zinc-500" />
    </Link>
  );
}

function SideNavBrand({ role }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-2xl px-2 py-1 transition hover:bg-white/5"
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
  );
}

/**
 * The role-aware navigation surface. On lg+ this is a sticky left sidebar;
 * on smaller screens it becomes a slide-in drawer. The drawer auto-closes
 * on route change and on Escape, and locks body scroll while open.
 *
 * Must be rendered inside <DashboardSideNavProvider> so its trigger and
 * backdrop buttons can share the same open/close state.
 */
export function DashboardSideNav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, loading } = useSession();
  const { close } = useSideNavDrawer();
  const role = user?.role || "collaborator";
  const items = useMemo(() => MENUS[role] || MENUS.collaborator, [role]);
  const initials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );

  const isActive = (item) => {
    if (!item.href) return false;
    if (
      item.href === "/dashboard/founder" ||
      item.href === "/dashboard/collaborator" ||
      item.href === "/dashboard/admin"
    ) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const navigateAndClose = useCallback(
    (item) => (e) => {
      e?.preventDefault?.();
      close();
      if (item?.href) router.push(item.href);
    },
    [router, close]
  );

  const handleLogout = useCallback(async () => {
    close();
    try {
      await signOut();
      toast.success("Signed out.");
    } catch (err) {
      console.error("Sign-out failed:", err);
      toast.error("Sign-out failed. Try again.");
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
  }, [router, close]);

  return (
    <>
      {/* Sticky left sidebar — visible from lg upward. */}
      <aside
        className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-white/10 bg-zinc-950/95 px-4 py-6 lg:flex lg:flex-col"
        aria-label="Dashboard navigation"
      >
        <div className="mb-6">
          <SideNavBrand role={role} />
        </div>
        <SideNavUserChip user={user} loading={loading} initials={initials} />
        <SideNavMenuItems
          items={items}
          role={role}
          isActive={isActive}
          onNavigate={navigateAndClose}
        />
        <SideNavFooterActions onLogout={handleLogout} />
      </aside>

      <MobileDrawer
        role={role}
        user={user}
        loading={loading}
        initials={initials}
        items={items}
        isActive={isActive}
        navigateAndClose={navigateAndClose}
        handleLogout={handleLogout}
      />
    </>
  );
}

function MobileDrawer({
  role,
  user,
  loading,
  initials,
  items,
  isActive,
  navigateAndClose,
  handleLogout,
}) {
  const { isOpen, close } = useSideNavDrawer();

  return (
    <div className="lg:hidden" aria-hidden={!isOpen}>
      {/* Backdrop — clicking it closes the drawer. */}
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
        aria-label="Close dashboard navigation"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* The drawer panel itself. */}
      <aside
        id="dashboard-mobile-drawer"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-zinc-950 px-4 py-6 shadow-2xl shadow-black/60 transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="mb-6 flex items-center justify-between gap-2">
          <SideNavBrand role={role} />
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/70"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SideNavUserChip user={user} loading={loading} initials={initials} />
        <SideNavMenuItems
          items={items}
          role={role}
          isActive={isActive}
          onNavigate={navigateAndClose}
        />
        <SideNavFooterActions onLogout={handleLogout} />
      </aside>
    </div>
  );
}
