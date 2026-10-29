
import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadRecords() {
    const res = await api.get("/attendance/me");
    setRecords(res.data);
  }

  useEffect(() => {
    loadRecords().catch(() => setError("Unable to load attendance."));
  }, []);

  async function checkOut() {
    setError("");
    setMessage("");

    try {
      const res = await api.post("/attendance/check-out");
      setMessage(res.data.message);
      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to check out."
      );
    }
  }

  return (
    <Layout>
      <h1>Attendance History</h1>
      <p>Review daily attendance and check-out status.</p>

      <button onClick={checkOut}>Mark Check-out</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="welcome-card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.attendance_date}</td>
                <td>{record.check_in
                  ? new Date(record.check_in).toLocaleTimeString()
                  : "—"}</td>
                <td>{record.check_out
                  ? new Date(record.check_out).toLocaleTimeString()
                  : "—"}</td>
                <td>
                  <span className={`status ${record.status.toLowerCase()}`}>
                    {record.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && <p>No attendance records yet.</p>}
      </section>
    </Layout>
  );
}