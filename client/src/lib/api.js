export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 12_000;
const UNAUTHORIZED_EVENT = "linkhub:unauthorized";

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const getToken = () => localStorage.getItem("token");
const announceUnauthorized = (token) => {
  if (token && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { token } }));
  }
};

const request = async (endpoint, { method = "GET", body = null, headers = {}, requiresAuth = false, signal } = {}) => {
  const token = requiresAuth ? getToken() : null;
  if (requiresAuth && !token) {
    announceUnauthorized(null);
    throw new ApiError("Please sign in to continue.", 401, "AUTH_REQUIRED");
  }

  const config = {
    method,
    headers: { ...(body === null ? {} : { "Content-Type": "application/json" }), ...headers },
    ...(body === null ? {} : { body: JSON.stringify(body) }),
    ...(signal ? { signal } : {}),
  };
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...config, signal: controller.signal });
    let data = {};
    try { data = await response.json(); } catch { /* empty response */ }

    if (response.status === 401 && requiresAuth) announceUnauthorized(token);
    if (!response.ok) {
      throw new ApiError(data.message || "The request could not be completed.", response.status, data.code);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "AbortError") {
      if (signal?.aborted) throw new ApiError("Request cancelled.", 0, "REQUEST_CANCELLED");
      throw new ApiError("The request took too long. Your changes are still here; try again.", 0, "REQUEST_TIMEOUT");
    }
    if (error instanceof TypeError) {
      throw new ApiError("Could not reach Linkhub right now. Check your connection and try again.", 0, "NETWORK_ERROR");
    }
    throw new ApiError("Something went wrong. Please try again.", 0, "REQUEST_ERROR");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
};

export const signup = (userData) => request("/api/auth/signup", { method: "POST", body: userData });
export const login = (credentials) => request("/api/auth/login", { method: "POST", body: credentials });
export const getCurrentUser = () => request("/api/user/me", { requiresAuth: true });
export const updateProfile = (profileData) => request("/api/user/me", { method: "PUT", requiresAuth: true, body: profileData });
export const getPublicProfile = (username) => request(`/api/user/${encodeURIComponent(username)}`);
export default request;
