import { Skeleton, SkeletonText } from "@/components/Skeleton";

export default function StartupLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-4 w-32" />

        {/* Hero card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30">
          <div className="flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <SkeletonText width="w-24" />
              <SkeletonText width="w-3/4" className="h-9" />
              <SkeletonText width="w-1/2" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <SkeletonText width="w-32" className="h-5" />
            <SkeletonText />
            <SkeletonText width="w-11/12" />
            <SkeletonText width="w-10/12" />
          </div>

          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>

        {/* Opportunities list */}
        <div className="mt-10">
          <SkeletonText width="w-56" className="h-6" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <SkeletonText width="w-1/2" className="h-5" />
                <SkeletonText width="w-full" className="mt-3" />
                <SkeletonText width="w-4/5" className="mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}