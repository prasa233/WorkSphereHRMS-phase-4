import { useState } from "react";
import { Plus, CheckSquare, CalendarDays } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const initialTasks = [
  { id: 1, title: "Prepare welcome kit", assignee: "Priya Sharma", dueDate: "2026-11-02", priority: "High", status: "In Progress" },
  { id: 2, title: "Configure email account", assignee: "IT Team", dueDate: "2026-11-03", priority: "Medium", status: "Pending" },
  { id: 3, title: "Schedule orientation", assignee: "HR Team", dueDate: "2026-11-04", priority: "High", status: "Completed" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", assignee: "", dueDate: "", priority: "Medium" });

  function createTask(event) {
    event.preventDefault();
    setTasks((old) => [{ ...form, id: Date.now(), status: "Pending" }, ...old]);
    setForm({ title: "", assignee: "", dueDate: "", priority: "Medium" });
    setShowForm(false);
  }

  function changeStatus(id, status) {
    setTasks((old) => old.map((task) => task.id === id ? { ...task, status } : task));
  }

  const visibleTasks = tasks.filter((task) => filter === "All" || task.status === filter);

  return (
    <>
      <div className="page-toolbar">
        <div className="filter-group">
          {["All", "Pending", "In Progress", "Completed"].map((status) => (
            <button key={status} className={`filter-button ${filter === status ? "selected" : ""}`} onClick={() => setFilter(status)}>
              {status}
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={17} /> Create task</button>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={createTask}>
          <h3>Create a task</h3>
          <div className="form-grid">
            <label>Task title<input required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Assignee<input required value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} /></label>
            <label>Due date<input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
            <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary-button">Create task</button>
          </div>
        </form>
      )}

      <div className="task-summary">
        <div className="summary-tile"><span>Total tasks</span><strong>{tasks.length}</strong></div>
        <div className="summary-tile"><span>Pending</span><strong>{tasks.filter((t) => t.status === "Pending").length}</strong></div>
        <div className="summary-tile"><span>In progress</span><strong>{tasks.filter((t) => t.status === "In Progress").length}</strong></div>
        <div className="summary-tile"><span>Completed</span><strong>{tasks.filter((t) => t.status === "Completed").length}</strong></div>
      </div>

      <section className="task-list">
        {visibleTasks.map((task) => (
          <article className="panel task-card" key={task.id}>
            <div className={`task-check ${task.status === "Completed" ? "checked" : ""}`}><CheckSquare size={20} /></div>
            <div className="task-main">
              <h3>{task.title}</h3>
              <p>Assigned to <strong>{task.assignee}</strong></p>
              <div className="task-meta"><CalendarDays size={15} /> Due {task.dueDate || "Not set"}</div>
            </div>
            <div className="task-right">
              <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
              <StatusBadge status={task.status} />
              <select aria-label={`Change task status for ${task.title}`} value={task.status} onChange={(e) => changeStatus(task.id, e.target.value)}>
                <option>Pending</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
          </article>
        ))}
        {visibleTasks.length === 0 && <div className="panel empty-state">No tasks match this filter.</div>}
      </section>
    </>
  );
}