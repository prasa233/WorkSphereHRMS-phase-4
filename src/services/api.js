import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the login token to API requests.
// Store and manage tokens according to your backend's security design.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("access_token");
      // Add your application's login redirect here.
    }

    return Promise.reject(error);
  }
);

export const onboardingApi = {
  list: () => api.get("/onboarding"),
  create: (data) => api.post("/onboarding", data),
  update: (id, data) => api.patch(`/onboarding/${id}`, data),
};

export const resignationApi = {
  list: () => api.get("/resignations"),
  create: (data) => api.post("/resignations", data),
  update: (id, data) => api.patch(`/resignations/${id}`, data),
};

export const announcementApi = {
  list: () => api.get("/announcements"),
  create: (data) => api.post("/announcements", data),
};

export const taskApi = {
  list: () => api.get("/tasks"),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
};

export const integrationApi = {
  status: () => api.get("/integrations"),
  exportCsv: async (resource) => {
    const response = await api.get(`/exports/${resource}`, {
      responseType: "blob",
    });

    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resource}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};

export const feedbackApi = {
  list: () => api.get("/feedback"),
  create: (data) => api.post("/feedback", data),
};

export const settingsApi = {
  getProfile: () => api.get("/settings/profile"),
  updateProfile: (data) => api.patch("/settings/profile", data),
};

export default api;