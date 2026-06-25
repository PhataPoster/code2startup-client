import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Server-side auth gate for the (private) route group.
 *
 * Currently wraps:
 *   - /startup/[id]    — startup detail page (auth required to view)
 *   - /opportunity/[id]— opportunity detail page (auth required to view + apply)
 *
 * Browse listing pages (/browse-startups, /browse-opportunities) live outside
 * this group and remain public so anyone can discover startups/opportunities
 * before being asked to sign in.
 */
export default async function PrivateLayout({ children }) {
  // Server-side session check. Runs on the server before any client JS, so
  // there is no flash of authenticated UI for unauthenticated visitors.
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    session = null;
  }

  if (!session?.user) {
    // Preserve the path the visitor was trying to reach so we can bounce
    // them back after they log in. `x-pathname` is set by src/proxy.js.
    const h = await headers();
    const path =
      h.get("x-pathname") || h.get("x-invoke-path") || "/startup";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  // Block banned users entirely from the detail pages.
  if (session.user.isBlocked) {
    redirect("/unauthorized?from=private&reason=blocked");
  }

  return <>{children}</>;
}