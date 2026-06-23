// code2startup/src/lib/api.js
// Centralized client -> Express API helper.
// Attaches the Better Auth JWT (via /api/auth/token) to every request as
// Authorization: Bearer <token>, and forwards cookies for CORS requests.

import { authClient } from "./auth-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

let cachedToken = null;
let cachedTokenExp = 0;

/**
 * Get a fresh Better Auth JWT for the current user. Caches until ~60s before
 * the token expires.
 */
export async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && cachedTokenExp - now > 60_000) return cachedToken;

  try {
    const res = await authClient.token();
    const token = res?.data?.token;
    if (!token) return null;
    cachedToken = token;
    // jwt() plugin returns a token without explicit exp; assume 1h
    cachedTokenExp = now + 60 * 60 * 1000;
    return token;
  } catch {
    return null;
  }
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

async function handle(res) {
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { success: false, message: text };
  }
  if (!res.ok) {
    const err = new Error(body?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  base: API_BASE_URL,
  get: async (path, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
      headers: await buildHeaders(options.headers),
      ...options,
    });
    return handle(res);
  },
  post: async (path, body, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: await buildHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handle(res);
  },
  put: async (path, body, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: await buildHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handle(res);
  },
  delete: async (path, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: await buildHeaders(options.headers),
      ...options,
    });
    return handle(res);
  },
};