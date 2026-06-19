"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  LogIn,
  Menu,
  Search,
  X,
  BriefcaseBusiness,
  Home,
} from "lucide-react";
import { BrandMark } from "./brand-mark";

const publicLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse-startups", label: "Browse Startups", icon: BriefcaseBusiness },
  { href: "/browse-opportunities", label: "Browse Opportunities", icon: Search },
];

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(() => publicLinks, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link
            href="/browse-opportunities"
            className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
          >
            Get Started
            <ChevronDown className="h-4 w-4" />
          </Link>
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
            >
              <BrandMark className="h-9 w-9" />
              <span className="flex flex-col leading-none">
                <span className="text-base font-semibold tracking-tight text-white">
                  Code2Startup
                </span>
                <span className="text-xs text-zinc-400">Startup team builder platform</span>
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

            <div className="mt-6 grid gap-3 border-t border-white/10 pt-6">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/browse-opportunities"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                Get Started
                <ChevronDown className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </header>
  );
}
