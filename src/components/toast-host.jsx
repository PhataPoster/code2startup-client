"use client";

import { ToastContainer } from "react-toastify";

/**
 * Single ToastContainer instance for the whole app. We use `top-right`
 * (the common SaaS default) and override the brand accent so the
 * progress bar + ring colour match the rest of the orange UI.
 */
export default function ToastHost() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="!bg-zinc-900 !text-zinc-100 !border !border-white/10 !shadow-2xl !shadow-black/50 !rounded-2xl"
      bodyClassName="!text-sm !font-medium"
      progressClassName="!bg-linear-to-r !from-orange-500 !to-orange-400"
      closeButton={false}
    />
  );
}
