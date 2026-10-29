import { Link, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
export default function Layout({ children }) {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role") || "EMPLOYEE";

  function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("role");
    navigate("/");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>WorkSphere</h2>
        <p>HR Management</p>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/leaves">Leave Management</Link>
          <Link to="/payroll">My Payroll</Link>

          {(role === "HR" || role === "ADMIN") && (
            <Link to="/hr">HR Management</Link>
          )}

          {role === "ADMIN" && (
            <Link to="/users">User Management</Link>
          )}
        </nav>

        <div className="sidebar-bottom">
          <span className="role-badge">{role}</span>
          <button className="secondary" onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}