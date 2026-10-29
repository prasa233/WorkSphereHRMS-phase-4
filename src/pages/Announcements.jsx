import { useState } from "react";
import { Megaphone, Plus, CalendarDays } from "lucide-react";

const initialAnnouncements = [
  { id: 1, title: "Diwali Holiday Schedule", category: "Holiday", audience: "All Employees", date: "2026-10-25", body: "Please review the holiday schedule and coordinate with your managers." },
  { id: 2, title: "Quarterly Town Hall", category: "Company News", audience: "All Employees", date: "2026-10-22", body: "Join the leadership team for quarterly updates and a live Q&A." },
  { id: 3, title: "Benefits Enrollment Reminder", category: "HR Update", audience: "All Employees", date: "2026-10-18", body: "Review your employee benefits and submit any required changes." },
];

export default function Announcements() {
  const [items, setItems] = useState(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "HR Update", audience: "All Employees", date: "", body: "" });

  function publish(event) {
    event.preventDefault();
    setItems((old) => [{ ...form, id: Date.now() }, ...old]);
    setForm({ title: "", category: "HR Update", audience: "All Employees", date: "", body: "" });
    setShowForm(false);
  }

  return (
    <>
      <div className="page-toolbar">
        <p className="toolbar-description">Share company news, HR updates, and important reminders.</p>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={17} /> New announcement</button>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={publish}>
          <h3>Create announcement</h3>
          <div className="form-grid">
            <label>Title<input required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>HR Update</option><option>Holiday</option><option>Company News</option><option>Policy</option></select></label>
            <label>Audience<select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}><option>All Employees</option><option>Engineering</option><option>Design</option><option>Finance</option><option>Human Resources</option></select></label>
            <label>Publish date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="full-width">Message<textarea required rows="4" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary-button">Publish</button>
          </div>
        </form>
      )}

      <div className="announcement-list">
        {items.map((item) => (
          <article className="panel announcement-card" key={item.id}>
            <div className="announcement-icon"><Megaphone size={22} /></div>
            <div className="announcement-content">
              <div className="announcement-meta"><span className="category-label">{item.category}</span><span>{item.audience}</span></div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="announcement-date"><CalendarDays size={15} /> {item.date || "Date not set"}</div>
            </div>
          </article>
        ))}
        {items.length === 0 && <div className="panel empty-state">No announcements yet.</div>}
      </div>
    </>
  );
}