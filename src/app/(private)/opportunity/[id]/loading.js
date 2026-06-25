import { Skeleton, SkeletonText } from "@/components/Skeleton";

export default function OpportunityLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Skeleton className="mb-6 h-4 w-32" />

        {/* Hero card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonText width="w-3/4" className="mt-4 h-9" />
          <SkeletonText width="w-1/2" className="mt-3" />

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonText width="w-24" />
                <SkeletonText width="w-full" className="h-5" />
              </div>
            ))}
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
      </div>
    </div>
  );
}