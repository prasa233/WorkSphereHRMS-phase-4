import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const initialShift = {
  name: "Morning",
  start_time: "09:30",
  end_time: "18:30",
};

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(initialShift);
  const [assignment, setAssignment] = useState({
    employee_id: "",
    shift_id: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setError("");

    try {
      const [shiftRes, employeeRes, assignmentRes] =
        await Promise.all([
          api.get("/shifts"),
          api.get("/employees"),
          api.get("/employee-shifts"),
        ]);

      setShifts(
        Array.isArray(shiftRes.data)
          ? shiftRes.data
          : shiftRes.data.items || []
      );

      setEmployees(
        Array.isArray(employeeRes.data)
          ? employeeRes.data
          : employeeRes.data.items || []
      );

      setAssignments(
        Array.isArray(assignmentRes.data)
          ? assignmentRes.data
          : assignmentRes.data.items || []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createShift(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/shifts", form);
      setForm(initialShift);
      setMessage("Shift created successfully.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function assignShift(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/employee-shifts", {
        employee_id: Number(assignment.employee_id),
        shift_id: Number(assignment.shift_id),
      });

      setAssignment({ employee_id: "", shift_id: "" });
      setMessage("Shift assigned successfully.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function employeeName(id) {
    const employee = employees.find(
      (item) => String(item.id) === String(id)
    );

    return (
      employee?.name ||
      employee?.full_name ||
      employee?.email ||
      `Employee #${id}`
    );
  }

  function shiftName(id) {
    return (
      shifts.find((item) => String(item.id) === String(id))?.name ||
      `Shift #${id}`
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 14</span>
          <h1>Shift management</h1>
          <p>Create shifts and assign them to employees.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <div className="two-column">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Create a shift</h2>
              <p>Define the shift timing</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={createShift}>
            <label>
              Shift name
              <select
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              >
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </label>

            <label>
              Start time
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
              />
            </label>

            <label>
              End time
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
                }
              />
            </label>

            <button className="primary-button">Create shift</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Assign employee</h2>
              <p>Connect an employee to a shift</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={assignShift}>
            <label>
              Employee
              <select
                required
                value={assignment.employee_id}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    employee_id: e.target.value,
                  })
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
              Shift
              <select
                required
                value={assignment.shift_id}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    shift_id: e.target.value,
                  })
                }
              >
                <option value="">Select shift</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.start_time}–{shift.end_time})
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button">Assign shift</button>
          </form>
        </section>
      </div>

      <section className="panel section-gap">
        <div className="panel-heading">
          <div>
            <h2>Shift schedule</h2>
            <p>Configured shifts and employee assignments</p>
          </div>
          <button className="secondary-button" onClick={loadData}>
            Refresh
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Shift</th>
                <th>Start time</th>
                <th>End time</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id}>
                  <td>{shift.name}</td>
                  <td>{shift.start_time}</td>
                  <td>{shift.end_time}</td>
                </tr>
              ))}

              {!shifts.length && (
                <tr>
                  <td colSpan="3" className="empty-state">
                    No shifts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 className="subheading">Employee assignments</h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => (
                <tr key={item.id}>
                  <td>{employeeName(item.employee_id)}</td>
                  <td>{shiftName(item.shift_id)}</td>
                </tr>
              ))}

              {!assignments.length && (
                <tr>
                  <td colSpan="2" className="empty-state">
                    No assignments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="helper-text">
        Automatic attendance marking and late/early check-in
        detection must be implemented by your backend.
      </p>
    </>
  );
}