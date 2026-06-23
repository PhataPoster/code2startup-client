"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-400/30 bg-rose-500/10">
          <AlertTriangle className="h-10 w-10 text-rose-400" />
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
          An unexpected error occurred while loading this page. You can retry the
          request, or head back to the homepage.
        </p>

        {error?.digest && (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-zinc-500">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset?.()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}