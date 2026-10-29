


import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token to protected API requests.
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("hrms_token") ||
      localStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const phase4Api = {
  getOnboarding: () => api.get("/phase4/onboarding"),
  getOnboardingProgress: () =>
    api.get("/phase4/onboarding/progress"),
  getResignations: () => api.get("/phase4/resignations"),
  getAnnouncements: () => api.get("/phase4/announcements"),
  getTasks: () => api.get("/phase4/tasks"),
  getFeedback: () => api.get("/phase4/feedback"),
  getProfile: () => api.get("/profile"),
  getPreferences: () =>
    api.get("/phase4/profile/preferences"),
};

export default api;
