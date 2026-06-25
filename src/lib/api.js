// code2startup/src/lib/api.js
// Centralized client -> Express API helper.
// Attaches the Better Auth JWT (via /api/auth/token) to every request as
// Authorization: Bearer <token>, and forwards cookies for CORS requests.
//
// Two flavors:
//   - `api`        : direct browser -> Express call (CORS, JWT in header).
//                    Use only for routes the backend exposes to the world
//                    (auth endpoints, public health checks, etc.).
//   - `proxyApi`   : browser -> Next.js `/api/proxy/<path>` -> Express.
//                    The proxy re-reads the session server-side and injects
//                    the JWT, so the browser never touches the backend
//                    directly and never needs the token. Use this for any
//                    authenticated/private resource.

import { authClient } from "./auth-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// `undefined` lets the browser resolve same-origin automatically. Setting this
// to a literal string (e.g. "") keeps relative URLs working in tests.
const PROXY_BASE_URL =
  typeof window !== "undefined"
    ? "" // browser: same-origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

let cachedToken = null;
let cachedTokenExp = 0;
let inflightTokenPromise = null;

/**
 * Get a fresh Better Auth JWT for the current user. Caches until ~60s before
 * the token expires. Concurrent callers share a single in-flight request.
 */
export async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && cachedTokenExp - now > 60_000) return cachedToken;
  if (inflightTokenPromise) return inflightTokenPromise;

  inflightTokenPromise = (async () => {
    try {
      const res = await authClient.token();
      const token = res?.data?.token;
      if (!token) {
        // Server has no session yet — don't poison the cache with null.
        return null;
      }
      cachedToken = token;
      // jwt() plugin returns a token without explicit exp; assume 1h.
      cachedTokenExp = Date.now() + 60 * 60 * 1000;
      return token;
    } catch {
      return null;
    } finally {
      inflightTokenPromise = null;
    }
  })();
  return inflightTokenPromise;
}

export function clearAuthToken() {
  cachedToken = null;
  cachedTokenExp = 0;
}

async function buildHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = await getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handle(res, retryFn) {
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { success: false, message: text };
  }
  if (!res.ok) {
    // Stale/expired token race: drop the cache and try once with a fresh one.
    if (res.status === 401 && retryFn) {
      clearAuthToken();
      return retryFn();
    }
    const err = new Error(body?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function buildRequest(method, path, body, options = {}) {
  return (async () => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: await buildHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return res;
  })();
}

async function request(method, path, body, options = {}) {
  let retried = false;
  const doFetch = async () => {
    const res = await buildRequest(method, path, body, options);
    return handle(res, retried ? null : async () => {
      retried = true;
      const res2 = await buildRequest(method, path, body, options);
      return handle(res2, null);
    });
  };
  return doFetch();
}

export const api = {
  base: API_BASE_URL,
  get: (path, options = {}) => request("GET", path, null, options),
  post: (path, body, options = {}) => request("POST", path, body, options),
  put: (path, body, options = {}) => request("PUT", path, body, options),
  delete: (path, options = {}) => request("DELETE", path, null, options),
};

// ────────────────────────────────────────────────────────────────────────────
// proxyApi — same shape as `api`, but routes through /api/proxy/<path>.
// The proxy authenticates the caller via the session cookie, mints a JWT,
// and forwards to Express. The browser never sees the token and the
// backend never sees an unauthenticated request.
//
// Use this from any page rendered inside the (private) route group.
// ────────────────────────────────────────────────────────────────────────────
function proxyPath(path) {
  // path looks like "/opportunities/123" -> "/api/proxy/opportunities/123"
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `/api/proxy/${trimmed}`;
}

async function proxyRequest(method, path, body, options = {}) {
  let retried = false;
  const doFetch = async () => {
    const url = `${PROXY_BASE_URL}${proxyPath(path)}`;
    const init = {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
      ...options,
    };
    if (body !== undefined && body !== null && !(body instanceof FormData)) {
      init.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      // Let the browser set the multipart boundary.
      delete init.headers["Content-Type"];
      init.body = body;
    }

    let res;
    try {
      res = await fetch(url, init);
    } catch (err) {
      const e = new Error(err?.message || "Network error");
      e.status = 0;
      throw e;
    }

    return handle(
      res,
      retried
        ? null
        : async () => {
            retried = true;
            const res2 = await fetch(url, init);
            return handle(res2, null);
          },
    );
  };
  return doFetch();
}

export const proxyApi = {
  base: "/api/proxy",
  get: (path, options = {}) => proxyRequest("GET", path, null, options),
  post: (path, body, options = {}) => proxyRequest("POST", path, body, options),
  put: (path, body, options = {}) => proxyRequest("PUT", path, body, options),
  patch: (path, body, options = {}) => proxyRequest("PATCH", path, body, options),
  delete: (path, options = {}) => proxyRequest("DELETE", path, null, options),
};