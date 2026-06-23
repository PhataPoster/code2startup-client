'use client';

import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Large 404 */}
          <div className="mb-8">
            <h1 className="text-[120px] font-black leading-none sm:text-[150px] lg:text-[200px]">
              <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                404
              </span>
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Page Not Found
            </h2>
            <p className="mt-3 text-lg text-zinc-400 sm:text-xl">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Illustration */}
          <div className="mb-12 flex h-48 w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8">
            <svg
              className="h-32 w-32 text-orange-500/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-16 border-t border-white/10 pt-12">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Quick Links
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/browse-startups"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-200"
              >
                Browse Startups
              </Link>
              <Link
                href="/browse-opportunities"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-200"
              >
                Browse Opportunities
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-200"
              >
                Login / Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
