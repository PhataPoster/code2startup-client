"use client";

import { useState } from "react";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
} from "@heroui/react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

/**
 * A reusable confirmation modal used for every destructive action
 * (delete startup, delete opportunity, withdraw application, …).
 *
 * Why this exists instead of `window.confirm`:
 *   - Native confirms cannot be styled, paused, or themed; they look
 *     out of place inside our dark UI.
 *   - They don't support a loading state, so the user can click
 *     "Delete" twice and trigger two API calls.
 *   - They don't match the responsive audit work we just shipped on
 *     the dashboard layouts.
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
    <Modal
      isOpen={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) onCancel?.();
      }}
    >
      <ModalBackdrop className="bg-black/60 backdrop-blur-sm" />
      <ModalContainer className="items-center">
        <ModalDialog className="border border-white/10 bg-zinc-900 text-white sm:max-w-md">
          {!hideIcon && (
            <ModalHeader className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
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
              <ModalHeading className="text-base font-semibold tracking-tight text-white">
                {title}
              </ModalHeading>
            </ModalHeader>
          )}
          {hideIcon && (
            <ModalHeader className="flex flex-col gap-1 border-b border-white/5 px-6 py-4">
              <ModalHeading className="text-base font-semibold tracking-tight text-white">
                {title}
              </ModalHeading>
            </ModalHeader>
          )}
          <ModalBody className="px-6 py-5 text-sm leading-relaxed text-zinc-300">
            {description}
          </ModalBody>
          <ModalFooter className="flex flex-col-reverse gap-2 border-t border-white/5 px-6 py-4 sm:flex-row sm:justify-end">
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
          </ModalFooter>
          {!busy && (
            <ModalCloseTrigger className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <X className="h-4 w-4" />
            </ModalCloseTrigger>
          )}
        </ModalDialog>
      </ModalContainer>
    </Modal>
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