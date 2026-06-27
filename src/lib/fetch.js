// code2startup/src/lib/fetch.js
// Read helpers used by client components (home page sections, browse pages,
// detail pages).
//
// In production the browser must NOT call the Express backend directly — it
// has no way to know the backend URL (NEXT_PUBLIC_BACKEND_URL is build-time
// inlined) and would also hit CORS / cookie problems. Instead every helper
// here routes through the same-origin /api/proxy/<path> route, which runs on
// the Next.js server, reads the session cookie, mints a JWT and forwards
// the request to Express. The browser never sees the backend URL.
//
// The token cache from lib/api.js is kept only so authenticated callers can
// forward the JWT in the Authorization header themselves — the proxy will
// do that server-side too, so passing it here is optional.

import { getAuthToken } from "./api";

const PROXY_BASE_URL =
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function proxyUrl(path) {
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${PROXY_BASE_URL}/api/proxy/${trimmed}`;
}

async function authedFetch(path, init = {}) {
  const headers = {
    Accept: "application/json",
    ...(init.headers || {}),
  };
  // Forward the JWT if we already have one — the proxy will also mint one
  // server-side, so this is a best-effort optimization for the first request
  // after sign-in. Don't claim Content-Type unless we're sending JSON.
  if (init.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = await getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(proxyUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { success: false, message: text };
  }
}

export async function fetchStartups() {
  try {
    const res = await authedFetch("/featured-startups", { cache: "no-store" });
    const body = await safeJson(res);
    return body.data || [];
  } catch (error) {
    console.error("Error fetching startups:", error);
    return [];
  }
}

export async function fetchAllStartups() {
  try {
    const res = await authedFetch("/startups", { cache: "no-store" });
    const body = await safeJson(res);
    return body.data || [];
  } catch (error) {
    console.error("Error fetching all startups:", error);
    return [];
  }
}

export async function fetchStartupById(id) {
  try {
    const res = await authedFetch(`/startups/${id}`, { cache: "no-store" });
    const body = await safeJson(res);
    return body.data || null;
  } catch (error) {
    console.error("Error fetching startup:", error);
    return null;
  }
}

export async function fetchOpportunities(page = 1, limit = 10, filters = {}) {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (filters.role_title) params.append("role_title", filters.role_title);
    if (filters.required_skills)
      params.append("required_skills", filters.required_skills);
    if (filters.work_type) params.append("work_type", filters.work_type);
    if (filters.industry) params.append("industry", filters.industry);
    const res = await authedFetch(`/opportunities?${params}`, {
      cache: "no-store",
    });
    const body = await safeJson(res);
    return {
      data: body.data || [],
      pagination: body.pagination || {},
    };
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return { data: [], pagination: {} };
  }
}

export async function fetchFeaturedOpportunities() {
  try {
    const res = await authedFetch("/featured-opportunities", {
      cache: "no-store",
    });
    const body = await safeJson(res);
    return body.data || [];
  } catch (error) {
    console.error("Error fetching featured opportunities:", error);
    return [];
  }
}

export async function fetchOpportunityById(id) {
  try {
    const res = await authedFetch(`/opportunities/${id}`, {
      cache: "no-store",
    });
    const body = await safeJson(res);
    return body.data || null;
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return null;
  }
}

/**
 * Pull live distinct values for the browse-page dropdowns from the server.
 * Returns a stable shape: { startup: { industry, funding_stage, sort },
 * opportunity: { industry, work_type } } where each list item is
 * { value, label, count } (count is best-effort; sort items omit it).
 */
export async function fetchFilterOptions() {
  try {
    const res = await authedFetch("/filters/options", { cache: "no-store" });
    const body = await safeJson(res);
    return body.data || null;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return null;
  }
}