"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

// 30 days from now, in yyyy-mm-dd format. Computed once at module load —
// pure, deterministic, and never returns a different value across re-renders.
function defaultDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const COMMITMENT_LEVELS = ["Full-time", "Part-time", "Casual"];
const INDUSTRIES = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "AI/ML",
  "SaaS",
  "E-commerce",
  "General",
];

export default function OpportunityForm({
  initial = null,
  startups = [],
  onSubmit,
  onCancel,
  busy,
}) {
  // Normalize required_skills to a string whether it came back as an array,
  // a comma-separated string, or undefined — otherwise the <input> becomes
  // a controlled-component error.
  // Normalize required_skills to a string whether it came back as an array,
  // a comma-separated string, or undefined — otherwise the <input> becomes
  // a controlled-component error.
  const initialSkills = (() => {
    const raw = initial?.required_skills;
    if (Array.isArray(raw)) return raw.join(", ");
    if (typeof raw === "string") return raw;
    return "";
  })();
  const [form, setForm] = useState({
    startup_id: initial?.startup_id || startups[0]?._id || "",
    role_title: initial?.role_title || "",
    required_skills: initialSkills,
    work_type: initial?.work_type || "Full-time",
    commitment_level: initial?.commitment_level || "Full-time",
    industry: initial?.industry || "General",
    deadline: initial?.deadline
      ? new Date(initial.deadline).toISOString().slice(0, 10)
      : defaultDeadline(),
  });
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.startup_id)
      return setError("Please create a startup first before adding an opportunity.");
    if (!form.role_title.trim()) return setError("Role title is required.");
    onSubmit({
      startup_id: form.startup_id,
      role_title: form.role_title.trim(),
      required_skills: form.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", "),
      work_type: form.work_type,
      commitment_level: form.commitment_level,
      industry: form.industry,
      deadline: new Date(form.deadline).toISOString(),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-6 sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {initial ? "Edit Opportunity" : "Post New Opportunity"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {startups.length === 0 ? (
        <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-200">
          You need to create at least one startup before posting opportunities.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Startup *" full>
            <select
              required
              value={form.startup_id}
              onChange={(e) => update("startup_id", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
            >
              {startups.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.startup_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Role Title *" full>
            <input
              type="text"
              required
              value={form.role_title}
              onChange={(e) => update("role_title", e.target.value)}
              placeholder="Senior Backend Engineer"
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </Field>

          <Field label="Required Skills (comma separated)" full>
            <input
              type="text"
              value={form.required_skills}
              onChange={(e) => update("required_skills", e.target.value)}
              placeholder="React, Node.js, MongoDB"
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
            />
          </Field>

          <Field label="Work Type">
            <select
              value={form.work_type}
              onChange={(e) => update("work_type", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
            >
              {WORK_TYPES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Commitment Level">
            <select
              value={form.commitment_level}
              onChange={(e) => update("commitment_level", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
            >
              {COMMITMENT_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Industry">
            <select
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Application Deadline">
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-white focus:border-orange-400 focus:outline-none"
            />
          </Field>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={busy || startups.length === 0}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {initial ? "Save Changes" : "Post Opportunity"}
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