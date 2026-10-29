import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    const response = await api.get("/admin/users");
    setUsers(response.data);
  }

  useEffect(() => {
    loadUsers().catch(() => setError("Unable to load users."));
  }, []);

  async function changeRole(userId, newRole) {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/admin/users/${userId}/role`,
        null,
        { params: { new_role: newRole } }
      );

      setMessage("Role updated successfully.");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Role update failed.");
    }
  }

  async function toggleActive(user) {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/admin/users/${user.id}/active`,
        null,
        { params: { is_active: !user.is_active } }
      );

      setMessage("Account status updated.");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Status update failed.");
    }
  }

  return (
    <Layout>
      <h1>User Management</h1>
      <p>Manage system accounts and access levels.</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="welcome-card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>{user.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    className="secondary"
                    onClick={() => toggleActive(user)}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}