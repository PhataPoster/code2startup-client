"use client";

import { toast as reactToast } from "react-toastify";

/**
 * Thin wrapper around react-toastify that gives the app a consistent
 * visual language (orange brand accent) and a one-line API for the most
 * common call-sites.
 *
 * Use the `notify` shape when you only have a verb + message; fall back
 * to the raw `toast.*` helpers for richer cases (custom JSX, options).
 */

const DEFAULT_OPTIONS = {
  position: "top-right",
  autoClose: 3200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

function extractMessage(err, fallback) {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error?.message) return err.error.message;
  return fallback;
}

export const toast = Object.assign(
  // The raw react-toastify API, forwarded with our defaults.
  (message, options) => reactToast(message, { ...DEFAULT_OPTIONS, ...options }),
  {
    success(message, options) {
      return reactToast.success(message, { ...DEFAULT_OPTIONS, ...options });
    },
    error(message, options) {
      return reactToast.error(message, { ...DEFAULT_OPTIONS, ...options });
    },
    info(message, options) {
      return reactToast.info(message, { ...DEFAULT_OPTIONS, ...options });
    },
    warning(message, options) {
      return reactToast.warning(message, { ...DEFAULT_OPTIONS, ...options });
    },
    /**
     * Wrap an async action and surface a success / error toast automatically.
     *
     *   await notifyAsync(() => api.delete(`/startups/${id}`), {
     *     success: "Startup deleted.",
     *     error: "Could not delete startup.",
     *   });
     */
    async notifyAsync(action, { success, error, successOptions, errorOptions } = {}) {
      try {
        const result = await action();
        if (success) reactToast.success(success, { ...DEFAULT_OPTIONS, ...successOptions });
        return { ok: true, result };
      } catch (err) {
        reactToast.error(extractMessage(err, error || "Something went wrong."), {
          ...DEFAULT_OPTIONS,
          ...errorOptions,
        });
        return { ok: false, error: err };
      }
    },
    promise(promise, messages, options) {
      return reactToast.promise(promise, messages, { ...DEFAULT_OPTIONS, ...options });
    },
    dismiss(id) {
      return reactToast.dismiss(id);
    },
    update(id, options) {
      return reactToast.update(id, options);
    },
  },
);

export default toast;
