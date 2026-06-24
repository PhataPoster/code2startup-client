"use client";

// /pricing/cancel — Stripe sends users here if they abandon Checkout.
// We don't mutate any state — we just offer a clear way back.

import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingCancelPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <XCircle className="h-14 w-14 text-zinc-400" />
      <h1 className="mt-6 text-2xl font-bold">Checkout cancelled</h1>
      <p className="mt-2 text-sm text-zinc-400">
        No worries &mdash; you haven&rsquo;t been charged. You can try again
        any time, or head back to the dashboard.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/pricing")}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-rose-400"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/founder")}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>
    </main>
  );
}
