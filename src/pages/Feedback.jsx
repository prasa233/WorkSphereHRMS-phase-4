import { useState } from "react";
import { MessageSquare, Plus, Star } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const initialFeedback = [
  { id: 1, employee: "Priya Sharma", category: "Onboarding", rating: 5, date: "2026-10-24", comment: "The onboarding process was clear and welcoming.", status: "Pending" },
  { id: 2, employee: "Rahul Verma", category: "Workplace", rating: 4, date: "2026-10-23", comment: "The team is supportive. More documentation would help.", status: "Under Review" },
  { id: 3, employee: "Meera Reddy", category: "Management", rating: 5, date: "2026-10-20", comment: "Communication from the team has been excellent.", status: "Completed" },
];

export default function Feedback() {
  const [items, setItems] = useState(initialFeedback);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", category: "Workplace", rating: "5", comment: "" });

  function submit(event) {
    event.preventDefault();
    setItems((old) => [
      { ...form, id: Date.now(), rating: Number(form.rating), date: new Date().toISOString().slice(0, 10), status: "Pending" },
      ...old,
    ]);
    setForm({ employee: "", category: "Workplace", rating: "5", comment: "" });
    setShowForm(false);
  }

  return (
    <>
      <div className="page-toolbar">
        <p className="toolbar-description">Collect employee feedback and track follow-up actions.</p>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={17} /> Add feedback</button>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={submit}>
          <h3>Record employee feedback</h3>
          <div className="form-grid">
            <label>Employee name<input required value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} /></label>
            <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Workplace</option><option>Onboarding</option><option>Management</option><option>Benefits</option><option>Other</option></select></label>
            <label>Rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Very poor</option></select></label>
            <label className="full-width">Feedback<textarea required maxLength={2000} rows="4" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></label>
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary-button">Submit feedback</button>
          </div>
        </form>
      )}

      <section className="feedback-overview">
        <div className="summary-tile"><span>Total responses</span><strong>{items.length}</strong></div>
        <div className="summary-tile"><span>Awaiting review</span><strong>{items.filter((i) => i.status !== "Completed").length}</strong></div>
        <div className="summary-tile"><span>Average rating</span><strong>{items.length ? (items.reduce((sum, item) => sum + Number(item.rating), 0) / items.length).toFixed(1) : "—"} / 5</strong></div>
      </section>

      <div className="feedback-list">
        {items.map((item) => (
          <article className="panel feedback-card" key={item.id}>
            <div className="feedback-card-heading">
              <div className="avatar">{item.employee.split(" ").map((part) => part[0]).join("")}</div>
              <div className="feedback-person"><strong>{item.employee}</strong><span>{item.category} · {item.date}</span></div>
              <StatusBadge status={item.status} />
            </div>
            <div className="rating-row" aria-label={`Rating: ${item.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={16} fill={index < item.rating ? "currentColor" : "none"} />
              ))}
              <strong>{item.rating}.0</strong>
            </div>
            <p className="feedback-comment">{item.comment}</p>
            <div className="feedback-actions">
              <button className="secondary-button" onClick={() => setItems((old) => old.map((f) => f.id === item.id ? { ...f, status: f.status === "Completed" ? "Under Review" : "Completed" } : f))}>
                {item.status === "Completed" ? "Reopen review" : "Mark reviewed"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && <div className="panel empty-state"><MessageSquare size={24} /><p>No feedback has been submitted yet.</p></div>}
    </>
  );
}