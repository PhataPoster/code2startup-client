// code2startup/src/lib/fetch.js
// Public/unauth read endpoints for the Next.js client.
// All write endpoints should use the centralized `api` helper in api.js.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
    const res = await fetch(`${API_BASE_URL}/featured-startups`, {
      cache: "no-store",
    });
    const body = await safeJson(res);
    return body.data || [];
  } catch (error) {
    console.error("Error fetching startups:", error);
    return [];
  }
}

export async function fetchAllStartups() {
  try {
    const res = await fetch(`${API_BASE_URL}/startups`, { cache: "no-store" });
    const body = await safeJson(res);
    return body.data || [];
  } catch (error) {
    console.error("Error fetching all startups:", error);
    return [];
  }
}

export async function fetchStartupById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/startups/${id}`, {
      cache: "no-store",
    });
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
    const res = await fetch(`${API_BASE_URL}/opportunities?${params}`, {
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
    const res = await fetch(`${API_BASE_URL}/featured-opportunities`, {
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
    const res = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
      cache: "no-store",
    });
    const body = await safeJson(res);
    return body.data || null;
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return null;
  }
}