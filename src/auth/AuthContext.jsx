import {
  createContext,
  useContext,
  useState,
} from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  async function login(username, password) {
  const { data } = await api.post("/auth/login", {
    username,
    password,
  });

  const token = data.access_token || data.token;

  if (!token) {
    throw new Error("Login response did not include an access token.");
  }

  sessionStorage.setItem("access_token", token);

  const currentUser = data.user || { username };
  sessionStorage.setItem("user", JSON.stringify(currentUser));
  setUser(currentUser);

  return data;
}

  function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}