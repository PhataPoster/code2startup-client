"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { authClient } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/api";
import { toast } from "@/lib/toast";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const intended = search.get("redirect") || "/dashboard";

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const emailVal = String(formData.get("email") || "").trim();
      const passwordVal = String(formData.get("password") || "");

      if (!emailVal || !passwordVal) {
        setError("Please fill in all fields");
        toast.error("Please fill in all fields.");
        setIsLoading(false);
        return;
      }

      const result = await authClient.signIn.email({
        email: emailVal,
        password: passwordVal,
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid credentials");
      }

      toast.success("Signed in. Welcome back!");

      // Pre-warm the JWT cache so the next API call is fast
      clearAuthToken();

      // Tell the rest of the app (e.g. the navbar) to refresh from the new session
      // before we navigate away, so the UI is correct on the next page.
      try {
        const session = await authClient.getSession();
        const sessionUser = session?.data?.user;
        if (sessionUser) {
          const normalized = {
            name: sessionUser.name || sessionUser.email?.split("@")[0] || "User",
            email: sessionUser.email,
            role: sessionUser.role || "collaborator",
            image: sessionUser.image || "",
          };
          localStorage.setItem("user", JSON.stringify(normalized));
          window.dispatchEvent(new Event("auth-change"));
        }
      } catch (e) {
        console.error("Post-login session sync failed:", e);
      }

      router.push(intended);
    } catch (err) {
      const msg = err?.message || "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  // Google sign-in
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({ provider: "google" });
      // After OAuth callback, the user will be redirected back
      // and the session will be set.
    } catch (err) {
      const msg = "Google login failed. Please try again.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  // Shared class strings so each field has identical styling.
  const inputWrapper =
    "flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-2 transition focus-within:border-orange-500/50";
  const inputClass =
    "w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-500 outline-none";

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-950 to-zinc-900 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center gap-8">
        {/* Branding */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 self-start rounded-2xl px-2 py-2 transition focus:outline-none focus:ring-2 focus:ring-orange-500/70"
        >
          <BrandMark className="h-8 w-8" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-white">Code2Startup</span>
            <span className="text-xs text-zinc-400">Sign in to your account</span>
          </span>
        </Link>

        {/* Main Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/50 backdrop-blur-sm sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Sign in to continue your startup journey.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-5" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">
                Email Address
              </label>
              <div className={inputWrapper}>
                <span className="px-2 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-200">
                Password
              </label>
              <div className={inputWrapper}>
                <span className="px-2 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className={inputClass}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="remember" className="flex cursor-pointer items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-zinc-900 text-orange-500 accent-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-sm text-zinc-300">Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-orange-400 transition hover:text-orange-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
            {(!email || !password) && (
              <p className="mt-2 text-xs text-zinc-400">Enter your email and password to sign in.</p>
            )}
          </form>

          {/* Divider */}
          <div className="my-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Social Login */}
          <div className="space-y-3">
            <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
              Or continue with
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaGoogle className="h-5 w-5" />
                Continue with Google
              </button>
            </div>
          </div>

          <div className="my-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <p className="text-center text-sm text-zinc-300">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-orange-400 transition hover:text-orange-300 hover:underline">
              Create one
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-orange-400 transition hover:text-orange-300 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-orange-400 transition hover:text-orange-300 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

