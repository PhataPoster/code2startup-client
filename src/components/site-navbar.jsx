"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  LogIn,
  Menu,
  Search,
  X,
  BriefcaseBusiness,
  Home,
  LogOut,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { authClient } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/api";

const publicLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse-startups", label: "Browse Startups", icon: BriefcaseBusiness },
  { href: "/browse-opportunities", label: "Browse Opportunities", icon: Search },
];

// Routes where the dashboard side-nav takes over and the top public links
// would be redundant.
const DASHBOARD_PREFIXES = ["/dashboard"];

function getInitials(name = "", email = "") {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function isActiveRoute(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ href, label, icon: Icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex whitespace-nowrap items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          : "text-zinc-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function SiteNavbar() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the live Better Auth session and keep it in sync across tabs
  // and after the user signs in / out from any page in this tab.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Show the cached user immediately so the navbar doesn't flash to
      // "logged out" on every page load before the network call returns.
      try {
        const cached = localStorage.getItem("user");
        if (cached && !cancelled) setUser(JSON.parse(cached));
      } catch {}

      try {
        // Prefer the live session so we always show fresh data.
        const res = await authClient.getSession();
        if (cancelled) return;
        const sessionUser = res?.data?.user ?? null;
        if (sessionUser) {
          const normalized = {
            name: sessionUser.name || sessionUser.email?.split("@")[0] || "User",
            email: sessionUser.email,
            role: sessionUser.role || "collaborator",
            image: sessionUser.image || "",
          };
          setUser(normalized);
          try {
            localStorage.setItem("user", JSON.stringify(normalized));
          } catch {}
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const onAuthChange = () => load();
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "better-auth.session_token") load();
    };

    window.addEventListener("auth-change", onAuthChange);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("auth-change", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
    // Re-run whenever the route changes so the navbar always reflects
    // the session for the page the user is on (login redirect, dashboard, etc).
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
    clearAuthToken();
    try {
      localStorage.removeItem("user");
    } catch {}
    setUser(null);
    setMobileOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const links = useMemo(() => publicLinks, []);

  // Inside a dashboard route the side-nav drives navigation, so the top
  // public links become redundant noise. Hide them.
  const onDashboardRoute = DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const showPublicLinks = !onDashboardRoute;

  const initials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-2xl px-1 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
        >
          <BrandMark className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-base font-semibold tracking-tight text-white transition group-hover:text-orange-200 sm:text-lg">
              Code2Startup
            </span>
            <span className="hidden text-xs text-zinc-400 lg:block">
              Startup team builder platform
            </span>
          </span>
        </Link>

        {showPublicLinks && (
          <div className="hidden flex-1 justify-center lg:flex">
            <nav
              className="flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              aria-label="Primary navigation"
            >
              {links.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActiveRoute(pathname, link.href)}
                />
              ))}
            </nav>
          </div>
        )}

        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          {!loading && user ? (
            <>
              <Link
                href="/profile"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-sm font-medium text-zinc-100 transition hover:-translate-y-0.5 hover:bg-white/10"
                aria-label="Open your profile"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-amber-400 text-xs font-black text-white shadow-md shadow-orange-500/30">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <span className="hidden flex-col leading-tight sm:flex">
                  <span className="text-sm font-semibold text-white">
                    {user.name || user.email}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                    {user.role}
                  </span>
                </span>
                <UserCircle2 className="h-4 w-4 text-zinc-500 transition group-hover:text-orange-300" />
              </Link>
              {!onDashboardRoute && (
                <Link
                  href="/dashboard"
                  className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-orange-500/30 bg-linear-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:-translate-y-0.5 hover:bg-rose-500/10 hover:text-rose-200"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-orange-500/30 bg-linear-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
              >
                Sign Up
                <ChevronDown className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-dvh w-full max-w-sm border-l border-white/10 bg-zinc-950/98 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-1 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              onClick={() => setMobileOpen(false)}
            >
              <BrandMark className="h-9 w-9" />
              <span className="flex flex-col leading-none">
                <span className="text-base font-semibold tracking-tight text-white">
                  Code2Startup
                </span>
                <span className="text-xs text-zinc-400">Startup team builder</span>
              </span>
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Navigation
            </p>

            {showPublicLinks && (
              <div className="space-y-2">
                {links.map((link) => (
                  <NavItem
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                    active={isActiveRoute(pathname, link.href)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 grid gap-3 border-t border-white/10 pt-6">
              {!loading && user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-amber-400 text-sm font-black text-white shadow-md shadow-orange-500/30">
                      {getInitials(user.name, user.email)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">
                        {user.name || user.email}
                      </span>
                      <span className="block truncate text-xs text-orange-200">
                        {user.role}
                      </span>
                    </span>
                    <UserCircle2 className="h-4 w-4 text-zinc-500" />
                  </Link>
                  {!onDashboardRoute && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
                  >
                    Sign Up
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </header>
  );
}
