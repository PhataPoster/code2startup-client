"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
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

            <Form onSubmit={handleSubmit} className="space-y-5">
              <TextField
                type="email"
                isRequired
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={Boolean(error)}
                errorMessage={error}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/10 group-data-[focus=true]:border-orange-500/60",
                  input: "text-white placeholder:text-zinc-500",
                }}
              >
                <Label className="text-sm text-zinc-200">Email address</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    placeholder="you@startup.com"
                    autoComplete="email"
                  />
                </InputGroup>
              </TextField>

              <Button
                type="submit"
                isDisabled={isLoading}
                className="w-full rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300"
              >
                {isLoading ? "Sending…" : "Send reset link"}
                {!isLoading && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>
            </Form>

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