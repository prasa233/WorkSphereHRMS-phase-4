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
      return JSON.parse(sessionStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    // Adapt these fields to your FastAPI login response.
    const token = data.access_token;
    const currentUser = data.user;

    if (!token || !currentUser) {
      throw new Error("Invalid login response from server");
    }

    sessionStorage.setItem("access_token", token);
    sessionStorage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);
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
  return useContext(AuthContext);
}