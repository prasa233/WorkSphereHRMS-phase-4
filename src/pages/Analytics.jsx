import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api, { getErrorMessage } from "../api/client";

export default function Analytics() {
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    department_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [report, setReport] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/departments")
      .then((response) => {
        setDepartments(
          Array.isArray(response.data)
            ? response.data
            : response.data.items || []
        );
      })
      .catch(() => {});

    loadReport({});
  }, []);

  async function loadReport(overrides) {
    setLoading(true);
    setError("");

   
const params = { ...filters, ...overrides };

// Send complete dates and omit empty filters.
if (!params.start_date) delete params.start_date;
if (!params.end_date) delete params.end_date;
if (!params.department_id) delete params.department_id;


    try {
      const response = await api.get("/analytics/attendance", { params });
      setReport(response.data || {});
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

  const attendance =
    report.attendance_trends || report.attendance || [];

  const leave =
    report.leave_trends || report.leave || [];

  const performance =
    report.performance_insights || report.performance || [];

  const departmentsReport =
    report.department_reports || report.departments || [];

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 18</span>
          <h1>Analytics & reports</h1>
          <p>Explore workforce attendance, leave, and performance.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="panel filter-panel">
        <div className="panel-heading">
          <div>
            <h2>Report filters</h2>
            <p>Choose the reporting period and department.</p>
          </div>
        </div>

        <form
          className="filter-row"
          onSubmit={(event) => {
            event.preventDefault();
            loadReport({});
          }}
        >
          <label>
            From
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) =>
                updateFilter("start_date", e.target.value)
              }
            />
          </label>

          <label>
            To
            <input
              type="date"
              min={filters.start_date || undefined}
              value={filters.end_date}
              onChange={(e) =>
                updateFilter("end_date", e.target.value)
              }
            />
          </label>

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

          <button className="primary-button" disabled={loading}>
            {loading ? "Loading..." : "Apply filters"}
          </button>
        </form>
      </section>

      <div className="chart-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Attendance trends</h2>
              <p>Present and late attendance</p>
            </div>
          </div>

          {attendance.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={attendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  name="Present"
                  stroke="#315be8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="late"
                  name="Late"
                  stroke="#e9a23b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              No attendance trend data returned.
            </div>
          )}
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Leave trends</h2>
              <p>Leave requests by period</p>
            </div>
          </div>

          {leave.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={leave}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Leave requests"
                  fill="#0d9488"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              No leave trend data returned.
            </div>
          )}
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Performance insights</h2>
              <p>Average employee rating</p>
            </div>
          </div>

          {performance.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar
                  dataKey="average_rating"
                  name="Average rating"
                  fill="#7c3aed"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              No performance data returned.
            </div>
          )}
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Department report</h2>
              <p>Employee and attendance totals</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Present</th>
                  <th>On leave</th>
                </tr>
              </thead>
              <tbody>
                {departmentsReport.map((item, index) => (
                  <tr key={item.department_id || item.id || index}>
                    <td>
                      {item.department_name || item.name || "—"}
                    </td>
                    <td>
                      {item.employee_count ?? item.total_employees ?? "—"}
                    </td>
                    <td>
                      {item.present_count ?? item.present ?? "—"}
                    </td>
                    <td>
                      {item.on_leave ?? item.leave_count ?? "—"}
                    </td>
                  </tr>
                ))}

                {!departmentsReport.length && (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No department data returned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="helper-text">
        Change the field names above if your API returns a different
        analytics response schema.
      </p>
    </>
  );
}