import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Leaves() {
  const [policies, setPolicies] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const [p, b, l] = await Promise.all([
      api.get("/leave-policies"),
      api.get("/leave-balances/me"),
      api.get("/leaves/me"),
    ]);

    setPolicies(p.data);
    setBalances(b.data);
    setLeaves(l.data);
  }

  useEffect(() => {
    loadData().catch(() => setError("Unable to load leave data."));
  }, []);

  async function submitLeave(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/leaves", form);
      setMessage(`Request submitted: ${response.data.status}`);
      setForm({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Leave request failed."
      );
    }
  }

  return (
    <Layout>
      <h1>Leave Management</h1>

      <section className="stat-grid">
        {policies.map((policy) => {
          const balance = balances.find(
            (item) => item.leave_type === policy.leave_type
          );

          return (
            <article className="stat-card" key={policy.id}>
              <span>{policy.leave_type}</span>
              <h2>
                {balance?.remaining_days ??
                  policy.total_days_allowed} days
              </h2>
              <p>Remaining balance</p>
            </article>
          );
        })}
      </section>

      <section className="welcome-card">
        <h2>Apply for leave</h2>

        <form onSubmit={submitLeave}>
          <label>Leave type</label>
          <select
            required
            value={form.leave_type}
            onChange={(e) => setForm({
              ...form, leave_type: e.target.value
            })}
          >
            <option value="">Select leave type</option>
            {policies.map((p) => (
              <option key={p.id} value={p.leave_type}>
                {p.leave_type}
              </option>
            ))}
          </select>

          <label>Start date</label>
          <input
            type="date"
            required
            min={new Date().toLocaleDateString("en-CA")}
            value={form.start_date}
            onChange={(e) => setForm({
              ...form, start_date: e.target.value
            })}
          />

          <label>End date</label>
          <input
            type="date"
            required
            min={form.start_date || new Date().toLocaleDateString("en-CA")}
            value={form.end_date}
            onChange={(e) => setForm({
              ...form, end_date: e.target.value
            })}
          />

          <label>Reason</label>
          <textarea
            required
            minLength={3}
            maxLength={500}
            value={form.reason}
            onChange={(e) => setForm({
              ...form, reason: e.target.value
            })}
          />

          <button type="submit">Submit Leave Request</button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="welcome-card">
        <h2>My leave requests</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.leave_type}</td>
                  <td>{leave.start_date} – {leave.end_date}</td>
                  <td>{leave.days_requested}</td>
                  <td>{leave.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}