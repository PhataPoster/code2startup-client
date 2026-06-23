"use client";

import { motion } from "framer-motion";

const shimmer = {
  hidden: { opacity: 0.55 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
  },
};

/**
 * Reusable pulsing block. Use for text lines, card placeholders, etc.
 */
export function Skeleton({ className = "", style }) {
  return (
    <motion.span
      aria-hidden="true"
      variants={shimmer}
      initial="hidden"
      animate="visible"
      className={`inline-block rounded-md bg-white/10 ${className}`}
      style={style}
    />
  );
}

/** One line of placeholder text. */
export function SkeletonText({ width = "w-full", className = "" }) {
  return <Skeleton className={`h-3 ${width} ${className}`} />;
}

/** Avatar / logo placeholder. */
export function SkeletonCircle({ size = "h-10 w-10", className = "" }) {
  return <Skeleton className={`${size} rounded-full ${className}`} />;
}

/** A card-shaped placeholder (image + 3 text lines + button row). */
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur-sm ${className}`}
    >
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="mt-5 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <SkeletonText />
        <SkeletonText width="w-5/6" />
        <SkeletonText width="w-4/6" />
      </div>
      <div className="mt-auto pt-6">
        <Skeleton className="h-9 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

/** A table row placeholder. */
export function SkeletonRow({ columns = 5, className = "" }) {
  return (
    <div
      className={`grid items-center gap-4 border-b border-white/5 px-4 py-3 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** Grid of card skeletons (used by home + browse pages). */
export function SkeletonGrid({ count = 8, className = "sm:grid-cols-2 xl:grid-cols-4" }) {
  return (
    <div className={`grid gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}