"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadToImgbb } from "@/lib/upload";

const FUNDING_STAGES = ["Idea", "Seed", "Series A", "Series B", "Series C+"];

export default function StartupForm({ initial = null, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({
    startup_name: initial?.startup_name || "",
    logoURL: initial?.logoURL || initial?.logo || "",
    industry: initial?.industry || "",
    description: initial?.description || "",
    funding_stage: initial?.funding_stage || "Idea",
    team_size: initial?.team_size || 1,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToImgbb(file);
      if (url) update("logoURL", url);
      else setUploadError("IMGBB key missing — paste a URL instead.");
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.startup_name.trim()) return;
    onSubmit({
      startup_name: form.startup_name.trim(),
      logo: form.logoURL,
      logoURL: form.logoURL,
      industry: form.industry || "General",
      description: form.description,
      funding_stage: form.funding_stage,
      team_size: Number(form.team_size) || 1,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-orange-400/20 bg-orange-500/5 p-6 sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {initial ? "Edit Startup" : "Create Startup"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          aria-label="Close form"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Startup Name *" full>
          <input
            type="text"
            required
            value={form.startup_name}
            onChange={(e) => update("startup_name", e.target.value)}
            placeholder="Acme Inc."
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
          />
        </Field>

        <Field label="Industry">
          <input
            type="text"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            placeholder="FinTech, HealthTech, AI..."
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
          />
        </Field>

        <Field label="Funding Stage">
          <select
            value={form.funding_stage}
            onChange={(e) => update("funding_stage", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
          >
            {FUNDING_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Team Size">
          <input
            type="number"
            min={1}
            value={form.team_size}
            onChange={(e) => update("team_size", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
          />
        </Field>

        <Field label="Logo" full>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            {form.logoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logoURL}
                alt="logo preview"
                className="h-16 w-16 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            )}
            <div className="flex-1 space-y-2">
              <input
                type="url"
                value={form.logoURL}
                onChange={(e) => update("logoURL", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10">
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {uploading ? "Uploading..." : "Upload via ImgBB"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFile}
                />
              </label>
              {uploadError && (
                <p className="text-xs text-amber-400">{uploadError}</p>
              )}
            </div>
          </div>
        </Field>

        <Field label="Description" full>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            placeholder="What does your startup do? Who are you building for?"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {initial ? "Save Changes" : "Create Startup"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}