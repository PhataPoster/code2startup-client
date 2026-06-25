"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserCircle2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Crown,
  Pencil,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Camera,
  Sparkles,
  ImagePlus,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { uploadToImgbb } from "@/lib/upload";

function getInitials(name = "", email = "") {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ROLE_BADGE = {
  founder: {
    label: "Founder",
    className: "border-orange-400/30 bg-orange-500/10 text-orange-200",
  },
  admin: {
    label: "Admin",
    className: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  },
  collaborator: {
    label: "Collaborator",
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
};

const STATUS_BADGE = {
  active: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  blocked: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: sessionLoading, refresh } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Section state
  const [editing, setEditing] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type: 'ok' | 'err', text }

  // Password form state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Redirect to /login if not signed in.
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/profile")}`);
    }
  }, [user, sessionLoading, router]);

  // Pull the freshest record from the API.
  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users/me");
      setProfile(res.data || user);
    } catch (err) {
      setError(err.message);
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (user) fetchProfile();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [user]);

  // Always prefer the fresh DB profile over the Better Auth session snapshot.
  // If neither has loaded yet, fall back to a safe empty object.
  const display = profile || user || {};
  const role = display.role || "collaborator";
  const badge = ROLE_BADGE[role] || ROLE_BADGE.collaborator;
  const status = display.isBlocked ? "blocked" : "active";
  const statusBadge = STATUS_BADGE[status];

  // Resolve the display name once per render so header and detail card agree.
  // We only treat `name` as present when it's a non-empty string — guards
  // against Better Auth returning `null` after a profile edit wiped it.
  const displayName = useMemo(() => {
    const n = display.name;
    if (typeof n === "string" && n.trim()) return n.trim();
    return display.email || "";
  }, [display.name, display.email]);

  const initials = useMemo(
    () => getInitials(displayName, display.email),
    [displayName, display.email]
  );

  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "founder"
        ? "/dashboard/founder"
        : "/dashboard/collaborator";

  const memberSince = useMemo(() => {
    const raw = display.createdAt || display.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  }, [display.createdAt, display.created_at]);

  const openEditor = () => {
    setEditName(displayName || "");
    setEditImage(display.image || "");
    setEditBio(display.bio || "");
    setEditSkills(
      Array.isArray(display.skills)
        ? display.skills.join(", ")
        : display.skills || ""
    );
    setSaveMsg(null);
    setEditing(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditing(false);
    setSaveMsg(null);
  };

  const saveProfile = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const skillsArray = editSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: editName.trim() || undefined,
        image: editImage.trim() || undefined,
        bio: editBio.trim() || undefined,
        skills: skillsArray,
      };
      await api.put("/users/me", payload);
      await fetchProfile();
      await refresh?.();
      setSaveMsg({ type: "ok", text: "Profile updated successfully." });
      toast.success("Profile updated.");
      setEditing(false);
    } catch (err) {
      const msg = err?.message || "Failed to update profile.";
      setSaveMsg({ type: "err", text: msg });
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const closePwd = () => {
    if (pwdBusy) return;
    setPwdOpen(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdMsg(null);
  };

  const submitPassword = async (e) => {
    e?.preventDefault?.();
    if (pwdBusy) return;
    if (newPwd.length < 6) {
      setPwdMsg({
        type: "err",
        text: "New password must be at least 6 characters.",
      });
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "err", text: "New passwords do not match." });
      toast.error("New passwords do not match.");
      return;
    }
    setPwdBusy(true);
    setPwdMsg(null);
    try {
      const res = await authClient.changePassword({
        currentPassword: currentPwd,
        newPassword: newPwd,
        revokeOtherSessions: false,
      });
      if (res?.error) {
        const msg = res.error?.message || "Failed to change password.";
        setPwdMsg({ type: "err", text: msg });
        toast.error(msg);
      } else {
        setPwdMsg({ type: "ok", text: "Password updated. Use it next time you sign in." });
        toast.success("Password updated.");
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        // close after a short delay so the user sees the success message
        setTimeout(() => {
          if (pwdOpen) closePwd();
        }, 1500);
      }
    } catch (err) {
      const msg = err?.message || "Failed to change password.";
      setPwdMsg({ type: "err", text: msg });
      toast.error(msg);
    } finally {
      setPwdBusy(false);
    }
  };

  if (sessionLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href={dashboardHref}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
          {/* Hero / cover */}
          <div className="relative h-28 bg-linear-to-r from-orange-500 via-amber-400 to-rose-500 sm:h-36">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.25),transparent_55%)]" />
          </div>

          <div className="px-6 pb-8 sm:px-8">
            {/* Avatar + name + role */}
            <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pt-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-zinc-950 bg-linear-to-br from-orange-500 to-amber-400 text-2xl font-black text-white shadow-xl shadow-orange-500/30 sm:h-28 sm:w-28 sm:text-3xl">
                  {display.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={display.image}
                      alt={displayName || "Profile"}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="break-words text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                    {displayName || "Your profile"}
                  </h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
                    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 break-all">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{display.email || "—"}</span>
                    </span>
                    {memberSince && (
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                        Member since {memberSince}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.className}`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {badge.label}
                  {role === "founder" && (
                    <Crown className="ml-1 h-3.5 w-3.5 text-amber-300" />
                  )}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadge}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${display.isBlocked ? "bg-rose-400" : "bg-emerald-400"}`}
                  />
                  {display.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatTile
                label="Account role"
                value={badge.label}
                hint={
                  role === "founder"
                    ? "Post opportunities & manage startups"
                    : role === "admin"
                      ? "Moderate users, startups & payments"
                      : "Apply to open opportunities"
                }
              />
              <StatTile
                label="Email status"
                value={display.emailVerified ? "Verified" : "Unverified"}
                hint={display.email || "—"}
              />
              <StatTile
                label="Account status"
                value={display.isBlocked ? "Blocked" : "Active"}
                hint={
                  display.isBlocked
                    ? "Contact support to restore access"
                    : "All systems operational"
                }
              />
            </div>

            {/* Details grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetailCard
                icon={UserCircle2}
                label="Display name"
                value={displayName || "Not set"}
              />
              <DetailCard
                icon={Mail}
                label="Email"
                value={display.email || "—"}
                mono
              />
              {display.bio && (
                <DetailCard
                  icon={Sparkles}
                  label="Bio"
                  value={display.bio}
                  wide
                />
              )}
              {display.skills && (
                <DetailCard
                  icon={KeyRound}
                  label="Skills"
                  value={
                    Array.isArray(display.skills)
                      ? display.skills.join(", ")
                      : display.skills
                  }
                  wide
                />
              )}
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Couldn&apos;t reach the server for fresh profile data ({error}
                  ). Showing cached values.
                </span>
              </div>
            )}

            {loading && !profile && (
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                Loading latest profile…
              </div>
            )}

            {/* Action row */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openEditor}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-300"
              >
                <Pencil className="h-4 w-4" /> Edit profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setPwdMsg(null);
                  setPwdOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                <KeyRound className="h-4 w-4" /> Change password
              </button>
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                Go to dashboard
              </Link>
              <Link
                href="/browse-startups"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                Browse startups
              </Link>
            </div>
          </div>
        </div>

        {saveMsg && !editing && (
          <FlashMessage type={saveMsg.type} text={saveMsg.text} />
        )}
      </div>

      {/* Edit profile modal */}
      {editing && (
        <EditProfileModal
          name={editName}
          setName={setEditName}
          image={editImage}
          setImage={setEditImage}
          bio={editBio}
          setBio={setEditBio}
          skills={editSkills}
          setSkills={setEditSkills}
          saving={saving}
          saveMsg={saveMsg}
          onClose={closeEditor}
          onSubmit={saveProfile}
        />
      )}

      {/* Change password modal */}
      {pwdOpen && (
        <ChangePasswordModal
          current={currentPwd}
          setCurrent={setCurrentPwd}
          next={newPwd}
          setNext={setNewPwd}
          confirm={confirmPwd}
          setConfirm={setConfirmPwd}
          busy={pwdBusy}
          msg={pwdMsg}
          onClose={closePwd}
          onSubmit={submitPassword}
        />
      )}
    </main>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, wide = false, mono = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-zinc-950/40 p-4 ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={`mt-2 break-words text-base font-semibold text-white ${mono ? "font-mono text-sm" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function FlashMessage({ type, text }) {
  const isOk = type === "ok";
    return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
        isOk
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : "border-rose-400/30 bg-rose-500/10 text-rose-200"
      }`}
    >
      {isOk ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}

function EditProfileModal({
  name,
  setName,
  image,
  setImage,
  bio,
  setBio,
  skills,
  setSkills,
  saving,
  saveMsg,
  onClose,
  onSubmit,
}) {
  const fileInputRef = useRef(null);
  // While a file is uploading we display the local blob URL so the user
  // sees something happen immediately. Otherwise we fall back to the URL
  // the parent has in `image` (which is "" by default and "" after Remove).
  const [pendingPreview, setPendingPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const displayedPreview = pendingPreview !== null ? pendingPreview : image || "";

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the user can re-pick the same file later
    // if the upload fails.
    e.target.value = "";

    // Client-side validation — imgbb rejects anything over ~32MB and
    // most setups are happier with <= 8MB.
    if (!file.type.startsWith("image/")) {
      const msg = "Please choose an image file.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      const msg = "Image is too large. Please pick one under 8 MB.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    // Show a local preview immediately so the user sees something
    // happen while the upload is in flight.
    const objectUrl = URL.createObjectURL(file);
    setPendingPreview(objectUrl);
    setUploadError("");
    setUploading(true);

    try {
      const url = await uploadToImgbb(file);
      if (!url) {
        throw new Error(
          "Image upload is not configured on the server. Add NEXT_PUBLIC_IMGBB_KEY to enable uploads."
        );
      }
      setImage(url);
      // Clear the override so the display falls through to the new
      // parent value (the http URL we just set).
      setPendingPreview(null);
      toast.success("Avatar uploaded.");
    } catch (err) {
      const msg = err?.message || "Failed to upload image. Please try again.";
      setUploadError(msg);
      // Drop the override so the preview falls back to the previous
      // parent value (the avatar that was there before this attempt).
      setPendingPreview(null);
      toast.error(msg);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemove = () => {
    setImage("");
    setPendingPreview(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFilePicker = () => {
    if (uploading || saving) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
              Edit profile
            </p>
            <h3 className="text-lg font-bold text-white">Update your details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || uploading}
            className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Profile picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60">
                {displayedPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayedPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Camera className="h-6 w-6 text-zinc-500" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-300" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    disabled={uploading || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {uploading ? "Uploading…" : displayedPreview ? "Replace image" : "Upload image"}
                  </button>
                  {displayedPreview && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={uploading || saving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] leading-snug text-zinc-500">
                  PNG, JPG, GIF, or WebP · max 8 MB. Uploads go through imgbb.
                </p>
                {uploadError && (
                  <p className="flex items-start gap-1.5 text-[11px] text-rose-300">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Display name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="A short intro shown on your profile…"
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
            <p className="mt-1 text-right text-[10px] uppercase tracking-wider text-zinc-500">
              {bio.length}/400
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Skills <span className="text-zinc-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, UI/UX"
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </div>

          {saveMsg && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                saveMsg.type === "ok"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/20 bg-rose-500/10 text-rose-200"
              }`}
            >
              {saveMsg.type === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{saveMsg.text}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <Save size={16} /> Save changes
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({
  current,
  setCurrent,
  next,
  setNext,
  confirm,
  setConfirm,
  busy,
  msg,
  onClose,
  onSubmit,
}) {
  const tooShort = next.length > 0 && next.length < 6;
  const mismatched = confirm.length > 0 && new String(next) !== new String(confirm);
  const canSubmit =
    !busy && current.length > 0 && next.length >= 6 && next === confirm;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
              Security
            </p>
            <h3 className="text-lg font-bold text-white">Change password</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Current password
            </label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              New password
            </label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className={`w-full rounded-lg border bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none ${
                tooShort
                  ? "border-rose-400/40 focus:border-rose-400"
                  : "border-white/10 focus:border-orange-400"
              }`}
            />
            {tooShort ? (
              <p className="mt-1 text-[11px] text-rose-300">
                Use at least 6 characters.
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-zinc-500">
                Use 6+ characters with a mix of letters, numbers, and symbols.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className={`w-full rounded-lg border bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none ${
                mismatched
                  ? "border-rose-400/40 focus:border-rose-400"
                  : "border-white/10 focus:border-orange-400"
              }`}
            />
            {mismatched && (
              <p className="mt-1 text-[11px] text-rose-300">
                Passwords do not match.
              </p>
            )}
          </div>

          {msg && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                msg.type === "ok"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/20 bg-rose-500/10 text-rose-200"
              }`}
            >
              {msg.type === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              <KeyRound size={16} /> Update password
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
