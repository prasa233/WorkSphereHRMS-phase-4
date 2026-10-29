import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function HRManagement() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const [employeeResponse, leaveResponse] = await Promise.all([
      api.get("/employees"),
      api.get("/leaves"),
    ]);

    setEmployees(employeeResponse.data);
    setLeaves(leaveResponse.data);
  }

  useEffect(() => {
    loadData().catch(() => setError("Unable to load HR records."));
  }, []);

  async function reviewLeave(id, status) {
    setError("");
    setMessage("");

    try {
      await api.patch(`/leaves/${id}/decision`, { status });
      setMessage(`Leave ${status.toLowerCase()} successfully.`);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update leave."
      );
    }
  }

  return (
    <Layout>
      <h1>HR Management</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="welcome-card">
        <h2>Employees</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.full_name}</td>
                  <td>{employee.department || "—"}</td>
                  <td>{employee.designation || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="welcome-card">
        <h2>Pending leave approvals</h2>

        {leaves.filter((l) => l.status === "PENDING").map((leave) => (
          <div className="approval-row" key={leave.id}>
            <div>
              <strong>{leave.leave_type}</strong>
              <p>
                Employee #{leave.employee_id}
                {" · "}
                {leave.start_date} – {leave.end_date}
              </p>
              <p>{leave.days_requested} days</p>
            </div>

            <div className="action-group">
              <button onClick={() => reviewLeave(leave.id, "APPROVED")}>
                Approve
              </button>
              <button
                className="secondary"
                onClick={() => reviewLeave(leave.id, "REJECTED")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {!leaves.some((l) => l.status === "PENDING") && (
          <p>No pending leave requests.</p>
        )}
      </section>
    </Layout>
  );
}