"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Upload, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { uploadToImgbb } from "@/lib/upload";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

const roleOptions = [
  { key: "founder", label: "Founder – I'm building a startup" },
  { key: "collaborator", label: "Collaborator – I want to join a startup" },
];

function RegisterInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [role, setRole] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordErrors = [];
  const minLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  if (password.length > 0) {
    if (!minLength) passwordErrors.push("at least 6 characters");
    if (!hasUpper) passwordErrors.push("one uppercase letter");
    if (!hasLower) passwordErrors.push("one lowercase letter");
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file) => {
    setIsUploadingImage(true);
    try {
      const url = await uploadToImgbb(file);
      return url;
    } catch (err) {
      throw new Error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password");
    const confirm = formData.get("confirmPassword");

    if (!name) { setError("Full name is required"); toast.error("Full name is required."); return; }
    if (!email) { setError("Email is required"); toast.error("Email is required."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); toast.error("Password must be at least 6 characters."); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setError("Password must contain at least one uppercase and one lowercase letter");
      toast.error("Password must include at least one uppercase and one lowercase letter.");
      return;
    }
    if (password !== confirm) { setError("Passwords do not match"); toast.error("Passwords do not match."); return; }
    if (!role) { setError("Please select your role"); toast.error("Please select your role."); return; }

    setIsLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const result = await authClient.signUp.email({
        email,
        password,
        name,
        role,
        image: imageUrl || undefined,
        callbackURL: search.get("redirect") || "/dashboard",
      });

      if (result.error) {
        throw new Error(result.error.message || "Registration failed");
      }

      toast.success("Account created. Welcome aboard!");
      router.push(search.get("redirect") || "/dashboard");
    } catch (err) {
      const msg = err?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch (err) {
      const msg = "Google sign-up failed. Please try again.";
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
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl flex-col justify-center gap-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 self-start rounded-2xl px-2 py-2 transition focus:outline-none focus:ring-2 focus:ring-orange-500/70"
        >
          <BrandMark className="h-8 w-8" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-white">Code2Startup</span>
            <span className="text-xs text-zinc-400">Create your account</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/50 backdrop-blur-sm sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create your Code2Startup account
            </h1>
            <p className="text-sm text-zinc-400">
              Build or join startups — collaborate with talented makers.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-5" noValidate>
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-zinc-200">
                Full Name
              </label>
              <div className={inputWrapper}>
                <span className="px-2 text-zinc-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            {/* Role select — native <select> styled to match the rest of the form. */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-sm font-medium text-zinc-200">
                I am a
              </label>
              <div className={inputWrapper}>
                <select
                  id="role"
                  name="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`${inputClass} cursor-pointer appearance-none rounded-full bg-zinc-900/80 pl-2 pr-8`}
                >
                  <option value="" disabled>
                    Choose your role
                  </option>
                  {roleOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="pointer-events-none pr-3 text-zinc-400">▾</span>
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
                  autoComplete="new-password"
                  required
                  className={inputClass}
                  placeholder="Min 6 chars, 1 uppercase, 1 lowercase"
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
              {password.length > 0 && (
                <div className="mt-2 flex gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-2 ${minLength ? "text-green-400" : "text-zinc-400"}`}>
                      <Check className="h-4 w-4" />
                      <span>Min 6 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasUpper ? "text-green-400" : "text-zinc-400"}`}>
                      <Check className="h-4 w-4" />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasLower ? "text-green-400" : "text-zinc-400"}`}>
                      <Check className="h-4 w-4" />
                      <span>One lowercase letter</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">
                Confirm Password
              </label>
              <div className={inputWrapper}>
                <span className="px-2 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  className={inputClass}
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Profile picture upload */}
            <div className="w-full">
              <span className="text-sm font-medium text-zinc-200">Profile Picture (optional)</span>
              <div className="mt-2 flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative h-16 w-16 shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      width={64}
                      height={64}
                      className="h-full w-full rounded-full object-cover ring-2 ring-orange-500/30"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-zinc-800">
                    <Upload className="h-6 w-6 text-zinc-500" />
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  {isUploadingImage && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label htmlFor="terms" className="flex cursor-pointer items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-zinc-900 text-orange-500 accent-orange-500 focus:ring-orange-500/50"
              />
              <span className="text-sm text-zinc-300">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-orange-300 underline-offset-2 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-orange-300 underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || isUploadingImage || passwordErrors.length > 0}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading || isUploadingImage ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <div className="space-y-3">
            <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
              Or sign up with
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignup}
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
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-orange-400 transition hover:text-orange-300 hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500">
            We respect your privacy. Read our{" "}
            <Link href="/privacy" className="text-orange-400 transition hover:text-orange-300 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

