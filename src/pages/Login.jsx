import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/axios.js";
import "../components/Login.css";

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

async function handleLogin(event) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    await login(username, password);
    window.location.href = "/";
  } catch (error) {
    setError(getErrorMessage(error));
  } finally {
    setLoading(false);
  }
}
  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Sign in</h1>
        <label htmlFor="username">Username</label>
        <input
  id="username"
  name="username"
  type="text"
  value={username}
  onChange={(event) => setUsername(event.target.value)}
  required
/>

        

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}