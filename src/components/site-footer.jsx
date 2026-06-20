"use client";

import Link from "next/link";
import {
  Heart,
  Mail,
  ArrowRight,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { BrandMark } from "./brand-mark";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Browse Startups", href: "/browse-startups" },
      { label: "Browse Opportunities", href: "/browse-opportunities" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
    ],
  },
];

const socialLinks = [
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn", isFa: true },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", isFa: true },
  { icon: FaGithub, href: "https://github.com", label: "GitHub", isFa: true },
  { icon: Mail, href: "mailto:hello@code2startup.com", label: "Email" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 sm:gap-12 lg:gap-16">
          {/* Top Section: Brand + Description + Newsletter */}
          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            <div className="space-y-6">
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-2xl px-1 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              >
                <BrandMark className="h-10 w-10" />
                <span className="flex flex-col leading-tight">
                  <span className="text-lg font-semibold tracking-tight text-white">
                    Code2Startup
                  </span>
                  <span className="text-xs text-zinc-400">
                    Startup team builder platform
                  </span>
                </span>
              </Link>

              <p className="max-w-xs text-sm text-zinc-300 leading-relaxed">
                Connect founders with talented collaborators. Build your dream
                team and turn your startup ideas into reality.
              </p>

              <div className="flex items-center gap-4">
                {socialLinks.map(({ icon: Icon, href, label, isFa }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-zinc-300 transition hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-300"
                  >
                    <Icon className={isFa ? "h-4 w-4" : "h-4 w-4"} />
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  Stay Updated
                </h3>
                <p className="text-xs text-zinc-400">
                  Get notified about new startups and opportunities.
                </p>
              </div>

              <form className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
                >
                  Subscribe
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid gap-8 sm:grid-cols-3 lg:gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-300 transition hover:text-orange-300 hover:translate-x-1 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Bottom Section: Copyright + Made With Love */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-zinc-400">
              &copy; 2026 Code2Startup. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <p className="text-xs text-zinc-400">
                Made with{" "}
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3 text-orange-400" />
                  for founders
                </span>
              </p>
            </div>

            <div className="flex gap-4 text-xs text-zinc-400">
              <Link
                href="/privacy"
                className="transition hover:text-white"
              >
                Privacy
              </Link>
              <span className="text-white/20">•</span>
              <Link
                href="/terms"
                className="transition hover:text-white"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
