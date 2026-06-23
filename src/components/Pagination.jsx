"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Smart pagination control.
 *
 * Props:
 *  - page (number, 1-based)
 *  - pages (number)            — total pages
 *  - total (number)            — total items
 *  - limit (number)            — items per page
 *  - onPage(n)                 — change page
 *  - onLimit(n)                — change items per page (optional)
 *  - limitOptions (number[])   — default [5,10,20,50]
 *  - busy (boolean)            — disable buttons during a pending request
 */
export default function Pagination({
  page = 1,
  pages = 1,
  total = 0,
  limit = 10,
  onPage,
  onLimit,
  limitOptions = [5, 10, 20, 50],
  busy = false,
}) {
  if (!pages || pages < 1) pages = 1;
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (page > pages) page = pages;

  // Build a compact page list: 1 … (p-1) p (p+1) … N
  const pageList = (() => {
    const out = new Set([1, pages, page - 1, page, page + 1]);
    const arr = [...out].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      if (i > 0 && arr[i] - arr[i - 1] > 1) result.push("…");
      result.push(arr[i]);
    }
    return result;
  })();

  const go = (n) => {
    if (busy) return;
    const next = Math.min(Math.max(1, n), pages);
    if (next !== page && onPage) onPage(next);
  };

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
      <p className="text-xs text-zinc-400">
        Showing <span className="font-semibold text-zinc-200">{start}</span>–
        <span className="font-semibold text-zinc-200">{end}</span> of{" "}
        <span className="font-semibold text-zinc-200">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <PageButton
          disabled={busy || page === 1}
          onClick={() => go(1)}
          label="First page"
        >
          <ChevronsLeft size={14} />
        </PageButton>
        <PageButton
          disabled={busy || page === 1}
          onClick={() => go(page - 1)}
          label="Previous page"
        >
          <ChevronLeft size={14} />
        </PageButton>

        {pageList.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className="px-1 text-xs text-zinc-500 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              disabled={busy}
              onClick={() => go(p)}
              className={`min-w-[2rem] rounded-md border px-2 py-1 text-xs font-semibold transition ${
                p === page
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              } ${busy ? "opacity-50" : ""}`}
            >
              {p}
            </button>
          )
        )}

        <PageButton
          disabled={busy || page === pages}
          onClick={() => go(page + 1)}
          label="Next page"
        >
          <ChevronRight size={14} />
        </PageButton>
        <PageButton
          disabled={busy || page === pages}
          onClick={() => go(pages)}
          label="Last page"
        >
          <ChevronsRight size={14} />
        </PageButton>
      </div>

      {onLimit && (
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          Per page
          <select
            value={limit}
            disabled={busy}
            onChange={(e) => onLimit(parseInt(e.target.value, 10))}
            className="rounded-md border border-white/10 bg-zinc-900/60 px-2 py-1 text-xs text-white focus:border-orange-400 focus:outline-none"
          >
            {limitOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

function PageButton({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 ${
        disabled ? "cursor-not-allowed opacity-40" : ""
      }`}
    >
      {children}
    </button>
  );
}
