import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-orange-400" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">
          Loading…
        </p>
      </div>
    </div>
  );
}