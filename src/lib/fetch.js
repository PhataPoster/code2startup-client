const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const fetchStartups = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/featured-startups`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching startups:", error);
    return [];
  }
};

export const fetchAllStartups = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/startups`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching all startups:", error);
    return [];
  }
};

export const fetchOpportunities = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.role_title) params.append('role_title', filters.role_title);
    if (filters.required_skills) params.append('required_skills', filters.required_skills);
    if (filters.work_type) params.append('work_type', filters.work_type);
    if (filters.industry) params.append('industry', filters.industry);
    const res = await fetch(`${API_BASE_URL}/opportunities?${params}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return { data: [], pagination: {} };
  }
};

export const fetchFeaturedOpportunities = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/featured-opportunities`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching featured opportunities:", error);
    return [];
  }
};

export const createApplication = async (appData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
    if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error creating application:", error);
    return { success: false };
  }
};