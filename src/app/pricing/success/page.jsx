"use client";

// /pricing/success — Stripe redirects here after a successful Checkout.
//
// Activation flow (in order of preference):
//  1) POST /payments/confirm-session with the session_id from the URL.
//     This asks Stripe directly whether the session is paid, and if so
//     records the payment server-side. Works even when the webhook is
//     unreachable (the typical dev / localhost case).
//  2) If confirm-session returns NOT_PAID or fails, poll /payments/status
//     waiting for the webhook to land (production path).
//  3) On timeout, expose a manual "I already paid — activate now" button
//     that re-runs step 1.

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { api } from "@/lib/api";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 12; // ~30 s

function SuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading } = useSession();

  const sessionId = searchParams.get("session_id");
  const [phase, setPhase] = useState("waiting"); // waiting | activated | timeout | error
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const pollsRef = useRef(0);
  const userKey = user?.email || user?.id || null;

  // Step 1: try confirming directly via Stripe. This is the dev/localhost
  // fast path — no waiting on the webhook.
  useEffect(() => {
    if (sessionLoading || !userKey || !sessionId) return;
    let cancelled = false;
    (async () => {
      setConfirming(true);
      try {
        const res = await api.post("/payments/confirm-session", {
          session_id: sessionId,
        });
        if (cancelled) return;
        if (res?.success) {
          setPhase("activated");
          return;
        }
      } catch (err) {
        // 402 NOT_PAID is expected if the user closed Stripe before paying;
        // surface that distinctly. Anything else means we should fall back
        // to polling the webhook.
        const body = err?.body;
        if (body?.code === "NOT_PAID") {
          setErrorMsg(
            "Stripe hasn't confirmed the payment yet. If you just paid, give it a few seconds."
          );
        } else if (err?.status === 401 || err?.status === 403) {
          setErrorMsg(
            "You're not signed in as the same account that started checkout. Sign in and try again."
          );
          setPhase("error");
          return;
        }
      } finally {
        if (!cancelled) setConfirming(false);
      }
      // Fall through to the webhook-polling loop below.
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionLoading, userKey, sessionId]);

  // Step 2: poll /payments/status until the webhook flips the flag.
  // Skipped once step 1 already set phase to "activated" or "error".
  useEffect(() => {
    if (sessionLoading || !userKey) return;
    if (phase === "activated" || phase === "error") return;
    let cancelled = false;

    const tick = async () => {
      pollsRef.current += 1;
      try {
        const res = await api.get("/payments/status");
        if (cancelled) return;
        if (res?.data?.isPremium) {
          setPhase("activated");
          return;
        }
      } catch {
        /* ignore — keep polling until timeout */
      }
      if (cancelled) return;
      if (pollsRef.current >= MAX_POLLS) {
        setPhase("timeout");
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [sessionLoading, userKey, phase]);

  // Manual confirm — re-runs step 1 when the user clicks "I already paid".
  const handleManualConfirm = async () => {
    if (!sessionId) return;
    setErrorMsg(null);
    setConfirming(true);
    try {
      const res = await api.post("/payments/confirm-session", {
        session_id: sessionId,
      });
      if (res?.success) {
        setPhase("activated");
        return;
      }
      setErrorMsg("Stripe still hasn't confirmed this payment.");
    } catch (err) {
      const body = err?.body;
      if (body?.code === "NOT_PAID") {
        setErrorMsg(
          "Stripe reports this checkout isn't paid yet. Complete the payment first, then come back."
        );
      } else {
        setErrorMsg(err?.message || "Could not verify the payment. Please try again.");
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      {phase === "waiting" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-orange-400" />
          <h1 className="mt-6 text-2xl font-bold">Activating your premium…</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {confirming
              ? "Verifying your payment with Stripe\u2026"
              : "Stripe confirmed your payment. We\u2019re just waiting for our server to catch up."}
          </p>
          {errorMsg && (
            <p className="mt-3 max-w-md text-xs text-amber-300">{errorMsg}</p>
          )}
        </>
      )}

      {phase === "activated" && (
        <>
          <CheckCircle2 className="h-14 w-14 text-emerald-400" />
          <h1 className="mt-6 text-2xl font-bold">You&rsquo;re premium!</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Unlimited opportunities, priority listing, and analytics are now
            unlocked on your founder account.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/founder")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-rose-400"
          >
            Go to founder dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}

      {phase === "timeout" && (
        <>
          <AlertTriangle className="h-12 w-12 text-amber-300" />
          <h1 className="mt-6 text-2xl font-bold">Still waiting…</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your payment went through on Stripe, but our server hasn&rsquo;t
            recorded it yet. This usually means the Stripe webhook is
            unreachable from your machine (common in local dev).
          </p>
          {errorMsg && (
            <p className="mt-3 max-w-md text-xs text-amber-300">{errorMsg}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleManualConfirm}
              disabled={confirming}
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking Stripe&hellip;
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  I already paid &mdash; activate now
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/founder")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {sessionId && (
            <p className="mt-6 break-all text-[11px] text-zinc-500">
              Reference: {sessionId}
            </p>
          )}
        </>
      )}

      {phase === "error" && (
        <>
          <AlertTriangle className="h-12 w-12 text-rose-400" />
          <h1 className="mt-6 text-2xl font-bold">Couldn&rsquo;t activate</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {errorMsg ||
              "Something went wrong while activating your premium. Please contact support."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/founder")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </main>
  );
}

export default function PricingSuccessPage() {
  // useSearchParams requires a Suspense boundary in the App Router.
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
        </main>
      }
    >
      <SuccessView />
    </Suspense>
  );
}
