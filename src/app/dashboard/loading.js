import { SkeletonText, SkeletonCircle } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <SkeletonCircle size="h-14 w-14" />
            <div className="space-y-2">
              <SkeletonText width="w-48" className="h-5" />
              <SkeletonText width="w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <SkeletonText width="w-28" className="h-10 rounded-xl" />
            <SkeletonText width="w-28" className="h-10 rounded-xl" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-3 border-b border-white/10 pb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonText key={i} width="w-24" className="h-8 rounded-full" />
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <SkeletonText width="w-20" />
              <SkeletonText width="w-16" className="mt-3 h-7" />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 items-center gap-4 border-b border-white/5 px-4 py-3 last:border-b-0"
            >
              {Array.from({ length: 5 }).map((__, j) => (
                <SkeletonText
                  key={j}
                  width={j === 0 ? "w-2/3" : "w-full"}
                  className="h-4"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}