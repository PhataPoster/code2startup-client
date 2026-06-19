export function BrandMark({ className = "" }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_30px_rgba(249,115,22,0.35)] ${className}`}
      aria-hidden="true"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[0.9rem] border border-white/15 bg-black/10 text-[0.95rem] font-black tracking-tight text-white shadow-inner shadow-white/10">
        C2
      </span>
    </span>
  );
}