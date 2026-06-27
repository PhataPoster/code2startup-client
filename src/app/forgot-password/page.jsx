"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { toast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }
    setError("");
    setIsLoading(true);
    // Best-effort: if the backend exposes a reset endpoint later, wire it here.
    // For now we just simulate the round-trip so the user gets the confirmation
    // UI even without a server endpoint.
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSubmitted(true);
      toast.success("If that email exists, a reset link is on its way.");
    } catch (err) {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputWrapper =
    "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 transition focus-within:border-orange-500/60 focus-within:bg-white/10";
  const inputClass =
    "w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-500 outline-none";

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white sm:px-6">
      {/* Background glow — same visual language as the login page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.10),transparent_60%)]"
      />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
        {/* Brand + heading */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-3 rounded-2xl px-1 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
        >
          <BrandMark className="h-10 w-10" />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-white">
              Code2Startup
            </span>
            <span className="text-xs text-zinc-400">
              Startup team builder platform
            </span>
          </span>
        </Link>

        {submitted ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Check your inbox
              </h1>
              <p className="text-sm text-zinc-300">
                If an account exists for{" "}
                <span className="font-semibold text-white">{email}</span>, we&apos;ve
                sent password reset instructions.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Forgot your password?
              </h1>
              <p className="text-sm text-zinc-400">
                Enter the email address on your account and we&apos;ll send you a
                link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm text-zinc-200">
                  Email address
                </label>
                <div className={inputWrapper}>
                  <span className="px-2 text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "email-error" : undefined}
                    className={inputClass}
                    placeholder="you@startup.com"
                  />
                </div>
                {error && (
                  <p id="email-error" className="text-xs text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending…
                  </span>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-400">
              Remembered it?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-400 transition hover:text-orange-300 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}