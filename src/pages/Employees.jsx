import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import api, { getErrorMessage } from "../api/client";

const initialFilters = {
  search: "",
  department_id: "",
  role: "",
  status: "",
  attendance: "",
  performance: "",
};

export default function Employees() {
  const [filters, setFilters] = useState(initialFilters);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/departments")
      .then((response) => {
        setDepartments(
          Array.isArray(response.data)
            ? response.data
            : response.data.items || []
        );
      })
      .catch(() => {});

    searchEmployees(initialFilters);
  }, []);

  async function searchEmployees(searchFilters) {
    setLoading(true);
    setError("");

    const params = { ...searchFilters };

    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    try {
      const response = await api.get("/employees", { params });
      const data = response.data;

      setEmployees(
        Array.isArray(data)
          ? data
          : data.items || data.results || []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function submitSearch(event) {
    event.preventDefault();
    searchEmployees(filters);
  }

  function clearFilters() {
    setFilters(initialFilters);
    searchEmployees(initialFilters);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 20</span>
          <h1>Employee directory</h1>
          <p>
            Search employees by name, department, role, status,
            attendance, and performance.
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Find employees</h2>
            <p>Use one or more filters.</p>
          </div>
          <SlidersHorizontal size={21} />
        </div>

        <form onSubmit={submitSearch}>
          <div className="search-field">
            <Search size={18} />

            <input
              value={filters.search}
              onChange={(e) =>
                updateFilter("search", e.target.value)
              }
              placeholder="Search name, email, or employee ID..."
            />

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="filter-row employee-filters">
            <label>
              Department
              <select
                value={filters.department_id}
                onChange={(e) =>
                  updateFilter("department_id", e.target.value)
                }
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name || department.department_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Role
              <input
                value={filters.role}
                onChange={(e) => updateFilter("role", e.target.value)}
                placeholder="e.g. Manager"
              />
            </label>

            <label>
              Status
              <select
                value={filters.status}
                onChange={(e) =>
                  updateFilter("status", e.target.value)
                }
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
            </label>

            <label>
              Attendance
              <select
                value={filters.attendance}
                onChange={(e) =>
                  updateFilter("attendance", e.target.value)
                }
              >
                <option value="">Any attendance</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </label>

            <label>
              Performance
              <select
                value={filters.performance}
                onChange={(e) =>
                  updateFilter("performance", e.target.value)
                }
              >
                <option value="">Any rating</option>
                <option value="high">High (4–5)</option>
                <option value="medium">Medium (3)</option>
                <option value="low">Low (1–2)</option>
              </select>
            </label>

            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              <X size={15} /> Clear filters
            </button>
          </div>
        </form>
      </section>

      <section className="panel section-gap">
        <div className="panel-heading">
          <div>
            <h2>Employees</h2>
            <p>{employees.length} result(s)</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Attendance</th>
                <th>Performance</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <b>
                      {employee.name ||
                        employee.full_name ||
                        "Unnamed employee"}
                    </b>
                    <br />
                    <small>
                      {employee.email ||
                        employee.employee_code ||
                        `ID: ${employee.id}`}
                    </small>
                  </td>

                  <td>
                    {employee.department_name ||
                      employee.department?.name ||
                      employee.department ||
                      "—"}
                  </td>

                  <td>{employee.role || employee.job_title || "—"}</td>

                  <td>
                    <span className="status-badge">
                      {employee.status || "Active"}
                    </span>
                  </td>

                  <td>
                    {employee.attendance_status ||
                      employee.attendance ||
                      "—"}
                  </td>

                  <td>
                    {employee.performance_rating ??
                      employee.average_rating ??
                      "—"}
                  </td>
                </tr>
              ))}

              {!loading && !employees.length && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No employees match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="helper-text">
        The backend must support the selected query parameters
        and enforce employee data permissions.
      </p>
    </>
  );
}