const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const request = async (endpoint, { method = "GET", body, auth = true, headers = {} } = {}) => {
  const config = {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const token = localStorage.getItem("token");
  if (auth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export default request;