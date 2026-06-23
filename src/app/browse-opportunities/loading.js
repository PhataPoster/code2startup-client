import { SkeletonGrid, SkeletonText, Skeleton } from "@/components/Skeleton";

export default function BrowseOpportunitiesLoading() {
  return (
    <div className="bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <SkeletonText width="w-48" className="h-4" />
          <SkeletonText width="w-96" className="mt-4 h-9" />
          <SkeletonText width="w-80" className="mt-3" />
        </div>

        {/* Filters bar */}
        <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Result count */}
        <SkeletonText width="w-44" className="mb-4" />

        {/* Cards */}
        <SkeletonGrid count={8} />
      </div>
    </div>
  );
}