import { NextResponse } from "next/server";

/**
 * Tiny proxy that mirrors the current request path into a header so server
 * components (e.g. the (private) layout) can read it via
 * `headers().get("x-pathname")`. Used to bounce unauthenticated visitors
 * back to the page they were trying to reach after they sign in.
 *
 * No auth logic lives here — the layout does the real session check.
 *
 * In Next.js 16+, the `middleware.js` file was renamed to `proxy.js`.
 */
export function proxy(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-pathname",
    request.nextUrl.pathname + request.nextUrl.search,
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // Mirror on the response too so client navigations keep seeing it.
  response.headers.set("x-pathname", requestHeaders.get("x-pathname"));
  return response;
}

export const config = {
  matcher: [
    // Match everything except Next internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|assets/).*)",
  ],
};