import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import api, { getErrorMessage } from "../api/client";

const emptyForm = {
  employee_id: "",
  review_period: "",
  rating: "5",
  feedback: "",
};

export default function Performance() {
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [employeeResponse, reviewResponse] = await Promise.all([
        api.get("/employees"),
        api.get("/performance"),
      ]);

      setEmployees(
        Array.isArray(employeeResponse.data)
          ? employeeResponse.data
          : employeeResponse.data.items || []
      );

      setReviews(
        Array.isArray(reviewResponse.data)
          ? reviewResponse.data
          : reviewResponse.data.items || []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitReview(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post("/performance", {
        ...form,
        employee_id: Number(form.employee_id),
        rating: Number(form.rating),
      });

      setForm(emptyForm);
      setMessage("Performance review saved.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function employeeName(id) {
    const employee = employees.find(
      (item) => String(item.id) === String(id)
    );

    return employee?.name || employee?.full_name ||
      `Employee #${id}`;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 17</span>
          <h1>Performance reviews</h1>
          <p>Record ratings and maintain employee feedback history.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Add a performance review</h2>
            <p>Provide a rating and constructive feedback.</p>
          </div>
          <Star />
        </div>

        <form className="form-grid" onSubmit={submitReview}>
          <label>
            Employee
            <select
              required
              value={form.employee_id}
              onChange={(e) =>
                setForm({ ...form, employee_id: e.target.value })
              }
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name ||
                    employee.full_name ||
                    employee.email ||
                    employee.id}
                </option>
              ))}
            </select>
          </label>

          <label>
            Review period
            <input
              required
              value={form.review_period}
              onChange={(e) =>
                setForm({ ...form, review_period: e.target.value })
              }
              placeholder="e.g. Q3 2026"
            />
          </label>

          <label>
            Rating
            <select
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: e.target.value })
              }
            >
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Very good</option>
              <option value="3">3 — Meets expectations</option>
              <option value="2">2 — Needs improvement</option>
              <option value="1">1 — Unsatisfactory</option>
            </select>
          </label>

          <label className="full-span">
            Feedback
            <textarea
              required
              maxLength={5000}
              rows={5}
              value={form.feedback}
              onChange={(e) =>
                setForm({ ...form, feedback: e.target.value })
              }
              placeholder="Achievements, strengths, and development opportunities..."
            />
          </label>

          <button className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save review"}
          </button>
        </form>
      </section>

      <section className="panel section-gap">
        <div className="panel-heading">
          <div>
            <h2>Review history</h2>
            <p>{reviews.length} review(s) recorded</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{employeeName(review.employee_id)}</td>
                  <td>{review.review_period || "—"}</td>
                  <td>
                    <span className="rating-pill">
                      <Star size={13} fill="currentColor" />
                      {review.rating}/5
                    </span>
                  </td>
                  <td className="feedback-cell">
                    {review.feedback || "—"}
                  </td>
                  <td>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}

              {!reviews.length && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No performance reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}