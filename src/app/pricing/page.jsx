"use client";

// /pricing — Stripe Checkout quickstart (hosted page, server-driven).
// We follow the pattern from https://docs.stripe.com/checkout/quickstart
// (lang=node, client=next): the client never talks to Stripe directly,
// it just POSTs to our own backend which creates a Checkout Session and
// returns a redirect URL. The browser then navigates to that URL.

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Sparkles,
  Loader2,
  ShieldCheck,
  Infinity as InfinityIcon,
  Users,
  BarChart3,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { api } from "@/lib/api";

// Free-tier cap the rest of the app already uses.
const FREE_OPP_LIMIT = 3;

const PREMIUM_AMOUNT_USD = 19; // mirrors the server default in /payments/create-checkout-session

const features = [
  {
    icon: InfinityIcon,
    title: "Unlimited opportunities",
    body: `Free accounts are capped at ${FREE_OPP_LIMIT}. Premium removes the cap.`,
  },
  {
    icon: Users,
    title: "Priority listing",
    body: "Premium startups appear above free ones in the public directory.",
  },
  {
    icon: BarChart3,
    title: "Application analytics",
    body: "See views, apply-through, and accept/reject rates per opportunity.",
  },
  {
    icon: ShieldCheck,
    title: "Verified badge",
    body: "A 'Premium' badge on your public profile and each listing.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading } = useSession();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  // Banner derived from the URL query — no effect, no setState needed.
  const banner = useMemo(() => {
    const status = searchParams.get("payment");
    if (status === "cancel")
      return {
        type: "info",
        text: "Checkout cancelled — you haven't been charged. Try again any time.",
      };
    if (status === "success")
      return {
        type: "success",
        text: "Payment successful! It can take a few seconds for premium to activate.",
      };
    return null;
  }, [searchParams]);

  // Pull current premium status from the server so we can show the right CTA.
  // Derived "checked" flag: once the auth query settles, we either know the
  // user is premium (effect ran) or we don't have a user (no fetch needed).
  // Either way the CTA is safe to render.
  const hasCheckedStatus = !sessionLoading;
  useEffect(() => {
    if (sessionLoading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/payments/status");
        if (!cancelled) setIsPremium(!!res?.data?.isPremium);
      } catch {
        if (!cancelled) setIsPremium(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, sessionLoading]);

  // If Stripe sent the user back via the success URL, refresh the local
  // premium flag in case the webhook has already landed.
  useEffect(() => {
    if (searchParams.get("payment") !== "success" || !user) return;
    let cancelled = false;
    api
      .get("/payments/status")
      .then((r) => {
        if (!cancelled) setIsPremium(!!r?.data?.isPremium);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [searchParams, user]);

  const startCheckout = async () => {
    setCheckoutError(null);
    if (!user) {
      // Not signed in — bounce to login first, then come back here.
      router.push("/login?next=/pricing");
      return;
    }
    if (user.role && user.role !== "founder") {
      setCheckoutError(
        "Only founder accounts can purchase premium. Switch to a founder account or sign up as a founder."
      );
      return;
    }
    setCheckoutLoading(true);
    try {
      console.log("[checkout] POST", api.base + "/payments/create-checkout-session");
      const res = await api.post("/payments/create-checkout-session", {
        amount: PREMIUM_AMOUNT_USD * 100, // server expects cents
      });
      console.log("[checkout] response:", res);
      // Normalize response shape: server returns { success, url, sessionId }
      // (top level), but tolerate { data: { ... } } wrappers too.
      const url = res?.url || res?.data?.url;
      const sessionId = res?.sessionId || res?.data?.sessionId;
      if (!url) {
        // Diagnostic log so we can see exactly what the server returned.
        console.error("[checkout] no url in response:", res);
        throw new Error(
          "Server did not return a Stripe checkout URL. Check that STRIPE_SECRET_KEY is set on the server and that the request reached /payments/create-checkout-session."
        );
      }
      // Stash the session id so the success page can poll if needed.
      if (sessionId) sessionStorage.setItem("lastStripeSessionId", sessionId);
      window.location.href = url;
    } catch (err) {
      console.error("[checkout] failed to start:", err);
      setCheckoutError(
        err?.message || "Could not start checkout. Please try again."
      );
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200">
          <Sparkles className="h-3.5 w-3.5" />
          StartupForge Premium
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Find the right collaborators,
          <br className="hidden sm:block" /> faster.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
          Free accounts can post up to {FREE_OPP_LIMIT} opportunities. Premium
          removes the cap, promotes your listings, and unlocks analytics.
        </p>
      </header>

      {banner && (
        <div
          role="status"
          className={`mx-auto mt-8 max-w-xl rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-sky-400/30 bg-sky-500/10 text-sky-100"
          }`}
        >
          {banner.text}
        </div>
      )}

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        {/* Free tier */}
        <article className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-lg font-semibold text-zinc-200">Free</h2>
          <p className="mt-1 text-sm text-zinc-400">
            For founders just getting started.
          </p>
          <p className="mt-6 text-4xl font-black">
            $0
            <span className="text-base font-medium text-zinc-400">
              {" "}
              / month
            </span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
              Up to {FREE_OPP_LIMIT} opportunities
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
              Standard directory listing
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
              Email notifications
            </li>
          </ul>
          <button
            type="button"
            disabled
            className="mt-8 w-full cursor-default rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-400"
          >
            Current plan
          </button>
        </article>

        {/* Premium tier */}
        <article className="relative flex flex-col rounded-2xl border border-orange-400/40 bg-linear-to-br from-orange-500/15 via-rose-500/10 to-purple-500/10 p-8 shadow-xl shadow-orange-500/10">
          <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
            Recommended
          </span>
          <h2 className="text-lg font-semibold text-white">Premium</h2>
          <p className="mt-1 text-sm text-zinc-300">
            For founders ready to scale their team.
          </p>
          <p className="mt-6 text-4xl font-black text-white">
            ${PREMIUM_AMOUNT_USD}
            <span className="text-base font-medium text-zinc-300">
              {" "}
              / one-time
            </span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-zinc-200">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
              Unlimited opportunities
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
              Priority placement in the directory
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
              Application analytics per opportunity
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
              Verified Premium badge
            </li>
          </ul>

          {!hasCheckedStatus ? (
            <button
              type="button"
              disabled
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your plan…
            </button>
          ) : isPremium ? (
            <div className="mt-8 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
              You already have Premium. Thanks for supporting StartupForge.
            </div>
          ) : (
            <button
              type="button"
              onClick={startCheckout}
              disabled={checkoutLoading}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to Stripe…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Premium — ${PREMIUM_AMOUNT_USD}
                </>
              )}
            </button>
          )}

          {checkoutError && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"
            >
              {checkoutError}
            </p>
          )}

          <p className="mt-3 text-center text-[11px] text-zinc-400">
            Secure checkout by Stripe. You can pay with any test card — no
            real charge is made in development.
          </p>
        </article>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-400">
          What you get
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <Icon className="h-5 w-5 text-orange-300" />
              <p className="mt-2 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm text-zinc-400">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() =>
            user
              ? router.push("/dashboard/founder")
              : router.push("/login?next=/pricing")
          }
          className="text-orange-300 underline-offset-2 hover:underline"
        >
          {user ? "Go to your dashboard" : "Sign in"}
        </button>
        .
      </p>
    </main>
  );
}
