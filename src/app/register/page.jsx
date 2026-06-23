"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Checkbox,
  FieldError,
  Form,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextField,
  Spinner,
} from "@heroui/react";
import { Check } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Upload, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { uploadToImgbb } from "@/lib/upload";
import { authClient } from "@/lib/auth-client";

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

    if (!name) { setError("Full name is required"); return; }
    if (!email) { setError("Email is required"); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setError("Password must contain at least one uppercase and one lowercase letter");
      return;
    }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!role) { setError("Please select your role"); return; }

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

      router.push(search.get("redirect") || "/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
      setIsLoading(false);
    }
  };

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

          <Form onSubmit={handleRegister} className="mt-6 flex flex-col gap-5" validationBehavior="aria">
            <TextField isRequired name="name" className="w-full">
              <Label className="text-sm font-medium text-zinc-200">Full Name</Label>
              <InputGroup fullWidth variant="secondary" className="rounded-full border border-white/10 bg-zinc-900/80 focus-within:border-orange-500/50">
                <InputGroup.Prefix className="px-3 text-zinc-400">
                  <User className="h-4 w-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  autoComplete="name"
                  className="bg-transparent text-white placeholder:text-zinc-500"
                  placeholder="John Doe"
                />
              </InputGroup>
              <FieldError className="text-xs text-red-400" />
            </TextField>

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
                />
              </InputGroup>
              <FieldError className="text-xs text-red-400" />
            </TextField>

            <TextField isRequired name="role" className="w-full">
              <Label className="text-sm font-medium text-zinc-200">I am a</Label>
              <Select
                name="role"
                selectedKey={role || null}
                onSelectionChange={(key) => setRole(typeof key === "string" ? key : "")}
                placeholder="Choose your role"
                variant="secondary"
                fullWidth
                isRequired
                className="rounded-full border border-white/10 bg-zinc-900/80 focus-within:border-orange-500/50"
              >
                <Select.Trigger className="rounded-full border-0 bg-transparent px-4 py-3 text-left text-white shadow-none">
                  <Select.Value className="text-white" />
                  <Select.Indicator className="text-zinc-400" />
                </Select.Trigger>
                <Select.Popover placement="bottom end" className="rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl shadow-black/50">
                  <ListBox className="space-y-1">
                    {roleOptions.map((option) => (
                      <ListBox.Item
                        key={option.key}
                        id={option.key}
                        textValue={option.label}
                        className="rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none transition hover:bg-white/10 focus:bg-white/10"
                      >
                        {option.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <input type="hidden" name="role" value={role} />
              <FieldError className="text-xs text-red-400" />
            </TextField>

            <TextField isRequired name="password" className="w-full">
              <Label className="text-sm font-medium text-zinc-200">Password</Label>
              <InputGroup fullWidth variant="secondary" className="rounded-full border border-white/10 bg-zinc-900/80 focus-within:border-orange-500/50">
                <InputGroup.Prefix className="px-3 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  autoComplete="new-password"
                  className="bg-transparent text-white placeholder:text-zinc-500"
                  placeholder="Min 6 chars, 1 uppercase, 1 lowercase"
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
              <FieldError className="text-xs text-red-400" />
            </TextField>

            <TextField isRequired name="confirmPassword" className="w-full">
              <Label className="text-sm font-medium text-zinc-200">Confirm Password</Label>
              <InputGroup fullWidth variant="secondary" className="rounded-full border border-white/10 bg-zinc-900/80 focus-within:border-orange-500/50">
                <InputGroup.Prefix className="px-3 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  autoComplete="new-password"
                  className="bg-transparent text-white placeholder:text-zinc-500"
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputGroup.Suffix className="px-2">
                  <Button
                    isIconOnly
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    size="sm"
                    variant="ghost"
                    onPress={() => setShowConfirmPassword((value) => !value)}
                    className="text-zinc-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError className="text-xs text-red-400" />
            </TextField>

            <div className="w-full">
              <Label className="text-sm font-medium text-zinc-200">Profile Picture (optional)</Label>
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
                      <Spinner size="sm" /> Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms Checkbox - fixed label */}
            <div className="flex items-start gap-2">
              <Checkbox
                isSelected={agreeTerms}
                onValueChange={(isSelected) => setAgreeTerms(isSelected)}
                id="terms"
                className="mt-0.5"
              />
            </div>

            <Button
              type="submit"
              isDisabled={isLoading || isUploadingImage || passwordErrors.length > 0}
              isLoading={isLoading || isUploadingImage}
              className="mt-2 w-full rounded-full bg-linear-to-r from-orange-500 to-orange-400 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
            >
              Create Account
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Form>

          <div className="my-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <div className="space-y-3">
            <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
              Or sign up with
            </p>
            <div className="flex justify-center">
              <Button
                variant="bordered"
                onClick={handleGoogleSignup}
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

