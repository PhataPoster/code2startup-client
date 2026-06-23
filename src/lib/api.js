// code2startup/src/lib/api.js
// Centralized client -> Express API helper.
// Attaches the Better Auth JWT (via /api/auth/token) to every request as
// Authorization: Bearer <token>, and forwards cookies for CORS requests.

import { authClient } from "./auth-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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