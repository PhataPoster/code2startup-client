"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

/**
 * Reusable confirmation modal used for every destructive action
 * (delete startup, delete opportunity, withdraw application, …).
 *
 * Why a plain Tailwind modal instead of `@heroui/react`'s <Modal />:
 *   - HeroUI v3's Modal relies on `react-aria-components` portals and a
 *     `data-slot` driven CSS pipeline that needs `--visual-viewport-height`
 *     to be set on every page that uses it. In a few real browsers we
 *     ended up with only the backdrop visible (the dialog content
 *     collapsed to zero height) because that variable never resolved.
 *   - The native <dialog>/overlay stacks have similar issues when the
 *     page tree contains transforms/overflow contexts.
 *   - A self-contained fixed-position modal — the same pattern the
 *     working profile-editor modal uses — is robust in every browser,
 *     has zero portal/CSS dependency, and renders identically in dev
 *     and production builds.
 *
 * Usage:
 *
 *   const [pending, setPending] = useState(null);
 *
 *   <Button onPress={() => setPending(startup)}>Delete</Button>
 *
 *   <ConfirmDialog
 *     open={!!pending}
 *     title={`Delete "${pending?.name}"?`}
 *     description="This permanently removes the startup and unlinks its opportunities."
 *     confirmLabel="Delete startup"
 *     intent="danger"
 *     busy={deleting}
 *     onConfirm={async () => {
 *       await api.delete(`/startups/${pending.id}`);
 *       setPending(null);
 *     }}
 *     onCancel={() => setPending(null)}
 *   />
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "danger",
  busy = false,
  hideIcon = false,
  onConfirm,
  onCancel,
}) {
  const isDanger = intent === "danger";

  // Lock body scroll while the modal is open so the page behind it can't
  // move. Restore the previous value (which may be "" or a saved string)
  // when the modal closes or unmounts.
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    // Compensate for the disappearing scrollbar so the page doesn't shift.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // Close on Escape — same UX as HeroUI's dismissable modal.
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
    } catch (err) {
      // The caller is expected to surface its own error toast. We
      // intentionally swallow here so the dialog stays open and the
      // caller can decide what to do.
      console.error("ConfirmDialog action failed:", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop — clicking it cancels unless we're mid-request. */}
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => {
          if (!busy) onCancel?.();
        }}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />

      {/* Dialog panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-[101] flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-white shadow-2xl shadow-black/60"
      >
        {!hideIcon ? (
          <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                isDanger
                  ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
                  : "bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30"
              }`}
            >
              {isDanger ? (
                <Trash2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </span>
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold tracking-tight text-white"
            >
              {title}
            </h2>
          </div>
        ) : (
          <div className="flex flex-col gap-1 border-b border-white/5 px-6 py-4">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold tracking-tight text-white"
            >
              {title}
            </h2>
          </div>
        )}

        {description && (
          <div className="px-6 py-5 text-sm leading-relaxed text-zinc-300">
            {description}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-white/5 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70 ${
              isDanger
                ? "bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-400"
                : "bg-linear-to-r from-orange-500 to-orange-400 text-white shadow-orange-500/30 hover:from-orange-400 hover:to-orange-300"
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>

        {!busy && (
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Tiny hook so callsites can keep their confirmation target in state
 * without repeating the same `useState(null)` boilerplate.
 */
export function useConfirmTarget() {
  const [target, setTarget] = useState(null);
  return {
    target,
    request: setTarget,
    clear: () => setTarget(null),
  };
}