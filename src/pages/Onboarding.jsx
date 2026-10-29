import { useState } from "react";
import { Plus, Search, UserPlus } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const initialEmployees = [
  { id: 1, name: "Priya Sharma", role: "Software Engineer", department: "Engineering", joiningDate: "2026-11-02", status: "In Progress" },
  { id: 2, name: "Karan Mehta", role: "Product Designer", department: "Design", joiningDate: "2026-11-05", status: "Pending" },
  { id: 3, name: "Ananya Rao", role: "HR Executive", department: "Human Resources", joiningDate: "2026-10-20", status: "Completed" },
];

export default function Onboarding() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "Engineering",
    joiningDate: "",
  });

  function addEmployee(event) {
    event.preventDefault();

    setEmployees((previous) => [
      {
        ...form,
        id: Date.now(),
        status: "Pending",
      },
      ...previous,
    ]);

    setForm({ name: "", role: "", department: "Engineering", joiningDate: "" });
    setShowForm(false);
  }

  const filtered = employees.filter((employee) =>
    `${employee.name} ${employee.role} ${employee.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-toolbar">
        <label className="search-box table-search">
          <Search size={17} />
          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}>
          <Plus size={17} /> Add employee
        </button>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={addEmployee}>
          <h3>New employee onboarding</h3>
          <div className="form-grid">
            <label>Full name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Employee name" />
            </label>
            <label>Job title
              <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Job title" />
            </label>
            <label>Department
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option>Engineering</option>
                <option>Design</option>
                <option>Human Resources</option>
                <option>Finance</option>
                <option>Marketing</option>
              </select>
            </label>
            <label>Joining date
              <input required type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="primary-button">Create record</button>
          </div>
        </form>
      )}

      <section className="content-summary">
        <div><UserPlus size={19} /><span>{employees.length} onboarding records</span></div>
        <span>Sample data · Local demo</span>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div><h3>Employee Onboarding</h3><p>Track new hires and their joining process</p></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>EMPLOYEE</th><th>JOB TITLE</th><th>DEPARTMENT</th><th>JOINING DATE</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id}>
                  <td><strong>{employee.name}</strong></td>
                  <td>{employee.role}</td>
                  <td>{employee.department}</td>
                  <td>{employee.joiningDate || "Not set"}</td>
                  <td><StatusBadge status={employee.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" className="empty-state">No matching employees found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}