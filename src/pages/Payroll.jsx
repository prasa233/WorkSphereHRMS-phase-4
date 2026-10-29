
import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function Payroll() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/payroll/me")
      .then((res) => setRecords(res.data))
      .catch((err) => setError(
        err.response?.data?.detail || "Unable to load payslips."
      ));
  }, []);

  return (
    <Layout>
      <h1>My Payslips</h1>
      <p>Review monthly salary and deductions.</p>

      {error && <p className="error">{error}</p>}

      {records.map((item) => (
        <section className="welcome-card" key={item.id}>
          <h2>Payroll — {item.payroll_month}</h2>
          <div className="salary-row">
            <span>Basic salary</span>
            <strong>{formatMoney(item.basic_salary)}</strong>
          </div>
          <div className="salary-row">
            <span>Allowances</span>
            <strong>{formatMoney(item.allowances)}</strong>
          </div>
          <div className="salary-row">
            <span>Deductions</span>
            <strong>− {formatMoney(item.deductions)}</strong>
          </div>
          <hr />
          <div className="salary-row net-salary">
            <span>Net salary</span>
            <strong>{formatMoney(item.net_salary)}</strong>
          </div>
        </section>
      ))}

      {records.length === 0 && !error && (
        <p>No payslips are available yet.</p>
      )}
    </Layout>
  );
}