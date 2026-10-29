


import React, { useEffect, useState } from "react";
import api from "./api";
import IntegrationsPanel from "./components/IntegrationsPanel";
import "./style.css";

const menuItems = [
  { label: "Dashboard", key: "dashboard", icon: "⌂" },
  { label: "Onboarding", key: "onboarding", icon: "✓" },
  { label: "Resignations", key: "resignations", icon: "↗" },
  { label: "Announcements", key: "announcements", icon: "📢" },
  { label: "Tasks", key: "tasks", icon: "☷" },
  { label: "Integrations", key: "integrations", icon: "🔌" },
  { label: "Feedback", key: "feedback", icon: "✉" },
  { label: "Profile", key: "profile", icon: "♙" },
  { label: "Preferences", key: "preferences", icon: "⚙" },
];

const endpoints = {
  onboarding: "/phase4/onboarding",
  progress: "/phase4/onboarding/progress",
  resignations: "/phase4/resignations",
  announcements: "/phase4/announcements",
  tasks: "/phase4/tasks",
  feedback: "/phase4/feedback",
  profile: "/profile",
  preferences: "/phase4/profile/preferences",
  integrations: "/integrations/status",
  
};

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("hrms_user") || "null");
  } catch {
    return null;
  }
}

function formatLabel(value) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function DataView({ data }) {
  if (data == null) {
    return <p className="muted">No data available.</p>;
  }

  const records = Array.isArray(data) ? data : [data];

  if (records.length === 0) {
    return <p className="muted">No records found.</p>;
  }

  return (
    <div className="record-list">
      {records.map((record, index) => {
        if (
          record === null ||
          typeof record !== "object" ||
          Array.isArray(record)
        ) {
          return (
            <article className="record-card" key={index}>
              {String(record)}
            </article>
          );
        }

        return (
          <article className="record-card" key={record.id ?? index}>
            {Object.entries(record).map(([key, value]) => (
              <div className="record-row" key={key}>
                <span className="record-label">
                  {formatLabel(key)}
                </span>
                <span className="record-value">
                  {value == null
                    ? "—"
                    : typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                </span>
              </div>
            ))}
          </article>
        );
      })}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("login");
  const [section, setSection] = useState("dashboard");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(readSavedUser);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user || section === "dashboard") {
      setData(null);
      return;
    }

    let cancelled = false;

    async function loadSection() {
      setLoadingData(true);
      setData(null);
      setMessage("");

      try {
        const response = await api.get(endpoints[section]);

        if (!cancelled) {
          setData(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          const detail = error.response?.data?.detail;
          setMessage(
            typeof detail === "string"
              ? detail
              : error.response
                ? `Request failed (${error.response.status}).`
                : "Cannot connect to the backend. Check that FastAPI is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    loadSection();

    return () => {
      cancelled = true;
    };
  }, [user, section]);

  function updateField(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (page === "register") {
        const response = await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

        setMessage(
          `${response.data.message || "Registration successful"}. Please log in.`
        );
        setPage("login");
        setForm({
          name: "",
          email: form.email,
          password: "",
        });
        return;
      }

      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const token = response.data.access_token;
      const loggedInUser = response.data.user;

      if (!token) {
        throw new Error("The login response did not include an access token.");
      }

      localStorage.setItem("hrms_token", token);

      if (loggedInUser) {
        localStorage.setItem(
          "hrms_user",
          JSON.stringify(loggedInUser)
        );
      }

      setUser(loggedInUser || {
        name: form.email,
        email: form.email,
        role: "employee",
      });

      setSection("dashboard");
      setMessage("");
    } catch (error) {
      const detail = error.response?.data?.detail;

      setMessage(
        typeof detail === "string"
          ? detail
          : error.message || "Request failed. Check the backend and your input."
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("hrms_user");

    setUser(null);
    setPage("login");
    setSection("dashboard");
    setData(null);
    setMessage("");
    setForm({ name: "", email: "", password: "" });
  }

  function openSection(key) {
    setSection(key);
    setMessage("");
  }

  async function refreshData() {
    if (section === "dashboard") {
      openSection("onboarding");
      return;
    }

    setSection("");
    window.setTimeout(() => setSection(section), 0);
  }

  if (user) {
    const currentItem = menuItems.find(
      (item) => item.key === section
    );

    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="logo">W</div>
            <div>
              <strong>WorkSphere</strong>
              <span>HRMS Portal</span>
            </div>
          </div>

          <p className="nav-heading">WORKSPACE</p>

          <nav className="navigation">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.key}
                className={
                  section === item.key
                    ? "nav-item selected"
                    : "nav-item"
                }
                onClick={() => openSection(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="user-mini">
              <div className="avatar">
                {(user.name || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="user-mini-info">
                <strong>{user.name || "Employee"}</strong>
                <span>{user.role || "Employee"}</span>
              </div>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div>
              <span className="breadcrumb">WorkSphere HRMS</span>
              <h1>
                {currentItem?.label || "Dashboard"}
              </h1>
            </div>

            <div className="topbar-user">
              <span>{user.email}</span>
              <div className="avatar">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <section className="content-area">
            {section === "dashboard" ? (
              <>
                <div className="welcome-panel">
                  <div>
                    <p className="eyebrow">EMPLOYEE PORTAL</p>
                    <h2>
                      Welcome, {user.name || "Employee"}!
                    </h2>
                    <p>
                      Access your employee services and keep track
                      of your work in one place.
                    </p>
                  </div>
                  <div className="welcome-symbol">W</div>
                </div>

                <div className="section-heading">
                  <div>
                    <h2>Your workspace</h2>
                    <p>Choose a section to view your information.</p>
                  </div>
                </div>

                <div className="feature-grid">
                  {menuItems
                    .filter((item) => item.key !== "dashboard")
                    .map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        className="feature-card"
                        onClick={() => openSection(item.key)}
                      >
                        <span className="feature-icon">
                          {item.icon}
                        </span>
                        <strong>{item.label}</strong>
                        <span className="feature-description">
                          View {item.label.toLowerCase()} information
                        </span>
                        <span className="feature-arrow">→</span>
                      </button>
                    ))}
                </div>

                <div className="info-panel">
                  <h3>Account information</h3>
                  <p>
                    <strong>Name:</strong> {user.name || "—"}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email || "—"}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role || "employee"}
                  </p>
                </div>
              </>
            ) : section === "integrations" ? (
              <IntegrationsPanel user={user} />
            ) : (
              <div className="data-panel">
                <div className="data-panel-header">
                  <div>
                    <h2>{currentItem?.label || section}</h2>
                    <p>
                      Information from your WorkSphere HRMS account.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="refresh-button"
                    onClick={refreshData}
                    disabled={loadingData}
                  >
                    {loadingData ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {message && (
                  <div className="error-message" role="alert">
                    {message}
                  </div>
                )}

                {loadingData ? (
                  <p className="muted">Loading information...</p>
                ) : data !== null ? (
                  <DataView data={data} />
                ) : !message ? (
                  <p className="muted">
                    No information to display.
                  </p>
                ) : null}

                {section === "onboarding" && (
                  <button
                    type="button"
                    className="text-link-button"
                    onClick={() => openSection("progress")}
                  >
                    View onboarding progress →
                  </button>
                )}

                {section === "progress" && (
                  <button
                    type="button"
                    className="text-link-button"
                    onClick={() => openSection("onboarding")}
                  >
                    ← Back to onboarding
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <div className="logo">W</div>
          <h1>WorkSphere HRMS</h1>
          <p className="subtitle">
            Your workplace, organized.
          </p>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={page === "login" ? "tab active" : "tab"}
            onClick={() => {
              setPage("login");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={page === "register" ? "tab active" : "tab"}
            onClick={() => {
              setPage("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <h2>
          {page === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="subtitle">
          {page === "login"
            ? "Sign in to continue to your workspace."
            : "Register as a new employee."}
        </p>

        <form onSubmit={submitForm} className="auth-form">
          {page === "register" && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter your full name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@company.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter your password"
              minLength={8}
              maxLength={128}
              required
            />
          </label>

          {message && (
            <p className="message" role="alert">
              {message}
            </p>
          )}

          <button
            className="primary"
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : page === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="switch">
          {page === "login"
            ? "New to WorkSphere? "
            : "Already have an account? "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setPage(page === "login" ? "register" : "login");
              setMessage("");
            }}
          >
            {page === "login" ? "Register" : "Login"}
          </button>
        </p>
      </section>
    </main>
  );
}


