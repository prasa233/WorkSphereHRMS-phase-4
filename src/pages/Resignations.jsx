import { useState } from "react";
import { Plus, Search } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const initialRecords = [
  { id: 1, name: "Arjun Patel", department: "Engineering", submitted: "2026-10-10", lastDay: "2026-11-10", status: "Under Review" },
  { id: 2, name: "Sneha Iyer", department: "Marketing", submitted: "2026-10-15", lastDay: "2026-11-15", status: "Pending" },
  { id: 3, name: "Vikram Singh", department: "Finance", submitted: "2026-09-20", lastDay: "2026-10-20", status: "Completed" },
];

export default function Resignations() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", department: "Engineering", submitted: "", lastDay: "" });

  function submit(event) {
    event.preventDefault();
    setRecords((old) => [{ ...form, id: Date.now(), status: "Pending" }, ...old]);
    setForm({ name: "", department: "Engineering", submitted: "", lastDay: "" });
    setShowForm(false);
  }

  function updateStatus(id, status) {
    setRecords((old) => old.map((record) => record.id === id ? { ...record, status } : record));
  }

  const filtered = records.filter((record) =>
    `${record.name} ${record.department}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-toolbar">
        <label className="search-box table-search">
          <Search size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exit records..." />
        </label>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={17} /> Record resignation</button>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={submit}>
          <h3>Record employee resignation</h3>
          <div className="form-grid">
            <label>Employee name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Department
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option>Engineering</option><option>Design</option><option>Marketing</option><option>Finance</option><option>Human Resources</option>
              </select>
            </label>
            <label>Submission date<input required type="date" value={form.submitted} onChange={(e) => setForm({ ...form, submitted: e.target.value })} /></label>
            <label>Last working day<input required type="date" min={form.submitted || undefined} value={form.lastDay} onChange={(e) => setForm({ ...form, lastDay: e.target.value })} /></label>
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary-button">Save resignation</button>
          </div>
        </form>
      )}

      <section className="panel table-panel">
        <div className="panel-heading"><div><h3>Exit Management</h3><p>Manage resignations and employee offboarding</p></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>SUBMITTED</th><th>LAST WORKING DAY</th><th>STATUS</th><th>UPDATE</th></tr></thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.name}</strong></td>
                  <td>{record.department}</td>
                  <td>{record.submitted}</td>
                  <td>{record.lastDay}</td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>
                    <select aria-label={`Update status for ${record.name}`} value={record.status} onChange={(e) => updateStatus(record.id, e.target.value)}>
                      <option>Pending</option><option>Under Review</option><option>Approved</option><option>Completed</option><option>Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" className="empty-state">No matching exit records.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}