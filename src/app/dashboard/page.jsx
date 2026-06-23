"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";

export default function DashboardIndex() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "founder") router.replace("/dashboard/founder");
    else if (user.role === "admin") router.replace("/dashboard/admin");
    else router.replace("/dashboard/collaborator");
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500 mx-auto" />
        <p className="mt-4 text-white">Loading dashboard...</p>
      </div>
    </div>
  );
}
