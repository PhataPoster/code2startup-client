"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Checkbox,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { FaGoogle } from "react-icons/fa";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { authClient } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/api";

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

      // Pre-warm the JWT cache so the next API call is fast
      clearAuthToken();

      router.push(intended);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

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

          <Form onSubmit={handleLogin} className="mt-6 flex flex-col gap-5" validationBehavior="aria">
            {/* Email */}
            <TextField isRequired name="email" type="email" className="w-full">
              <Label className="text-sm font-medium text-zinc-200">Email Address</Label>
              <InputGroup fullWidth variant="secondary" className="rounded-full border border-white/10 bg-zinc-900/80 focus-within:border-orange-500/50">
                <InputGroup.Prefix className="px-3 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  autoComplete="email"
                  className="bg-transparent text-white placeholder:text-zinc-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
              <FieldError className="text-xs text-red-400" />
            </TextField>

            {/* Password */}
            <TextField isRequired name="password" className="w-full">
              <Label className="text-sm font-medium text-zinc-200">Password</Label>
              <InputGroup fullWidth variant="secondary" className="rounded-full border border-white/10 bg-zinc-900/80 focus-within:border-orange-500/50">
                <InputGroup.Prefix className="px-3 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  autoComplete="current-password"
                  className="bg-transparent text-white placeholder:text-zinc-500"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputGroup.Suffix className="px-2">
                  <Button
                    isIconOnly
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    size="sm"
                    variant="ghost"
                    onPress={() => setShowPassword((value) => !value)}
                    className="text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError className="text-xs text-red-400" />
            </TextField>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={rememberMe}
                  onValueChange={(isSelected) => setRememberMe(isSelected)}
                  id="remember"
                  className="mt-0.5"
                />
                <Label htmlFor="remember" className="text-sm text-zinc-300">
                  Remember me
                </Label>
              </div>

              <Link
                href="/forgot-password"
                className="text-sm text-orange-400 transition hover:text-orange-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              isDisabled={isLoading || !email || !password}
              isLoading={isLoading}
              className="mt-2 w-full rounded-full bg-linear-to-r from-orange-500 to-orange-400 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
            >
              Sign In
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            {(!email || !password) && (
              <p className="mt-2 text-xs text-zinc-400">Enter your email and password to sign in.</p>
            )}
          </Form>

          {/* Divider */}
          <div className="my-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Social Login */}
          <div className="space-y-3">
            <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
              Or continue with
            </p>
            <div className="flex justify-center">
              <Button
                variant="bordered"
                onClick={handleGoogleLogin}
                isDisabled={isLoading}
                className="border-white/10 bg-white/5 px-6 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                startContent={<FaGoogle className="h-5 w-5" />}
              >
                Continue with Google
              </Button>
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

