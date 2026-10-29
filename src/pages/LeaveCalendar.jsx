import { useEffect, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api, { getErrorMessage } from "../api/client";

export default function LeaveCalendar() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/leaves"),
      api.get("/employees"),
    ])
      .then(([leaveResponse, employeeResponse]) => {
        setLeaves(
          Array.isArray(leaveResponse.data)
            ? leaveResponse.data
            : leaveResponse.data.items || []
        );

        setEmployees(
          Array.isArray(employeeResponse.data)
            ? employeeResponse.data
            : employeeResponse.data.items || []
        );
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const approvedLeaves = leaves.filter(
    (leave) =>
      String(leave.status || "").toLowerCase() === "approved"
  );

  function employeeName(id) {
    const employee = employees.find(
      (item) => String(item.id) === String(id)
    );

    return (
      employee?.name ||
      employee?.full_name ||
      `Employee #${id}`
    );
  }

  function leavesOn(day) {
    return approvedLeaves.filter((leave) => {
      const start = new Date(
        leave.start_date || leave.from_date
      );
      const end = new Date(
        leave.end_date ||
          leave.to_date ||
          leave.start_date ||
          leave.from_date
      );

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return false;
      }

      return isWithinInterval(day, {
        start: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate()
        ),
        end: new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate()
        ),
      });
    });
  }

  const today = new Date();

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 15</span>
          <h1>Leave calendar</h1>
          <p>View approved leave and team availability.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="calendar-layout">
        <section className="panel">
          <div className="calendar-toolbar">
            <button
              className="icon-button"
              aria-label="Previous month"
              onClick={() => setMonth(subMonths(month, 1))}
            >
              <ChevronLeft />
            </button>

            <h2>{format(month, "MMMM yyyy")}</h2>

            <button
              className="icon-button"
              aria-label="Next month"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight />
            </button>

            <button
              className="secondary-button"
              onClick={() => setMonth(new Date())}
            >
              Today
            </button>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {Array.from(
              { length: startOfMonth(month).getDay() },
              (_, index) => (
                <div
                  className="calendar-cell blank"
                  key={`blank-${index}`}
                />
              )
            )}

            {days.map((day) => {
              const dayLeaves = leavesOn(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-cell ${
                    isSameDay(day, today) ? "today" : ""
                  }`}
                >
                  <span className="calendar-day">
                    {format(day, "d")}
                  </span>

                  {dayLeaves.slice(0, 2).map((leave, index) => (
                    <div
                      className="leave-event"
                      key={leave.id || `${day}-${index}`}
                      title={employeeName(leave.employee_id)}
                    >
                      {employeeName(leave.employee_id)}
                    </div>
                  ))}

                  {dayLeaves.length > 2 && (
                    <small className="more-events">
                      +{dayLeaves.length - 2} more
                    </small>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i /> Approved leave</span>
            <span className="muted">
              Only approved requests are shown.
            </span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Team availability</h2>
              <p>{format(month, "MMMM")} overview</p>
            </div>
          </div>

          {approvedLeaves
            .filter((leave) => {
              const start = new Date(
                leave.start_date || leave.from_date
              );
              const end = new Date(
                leave.end_date ||
                  leave.to_date ||
                  leave.start_date ||
                  leave.from_date
              );

              return (
                !Number.isNaN(start.getTime()) &&
                !Number.isNaN(end.getTime()) &&
                start <= endOfMonth(month) &&
                end >= startOfMonth(month)
              );
            })
            .map((leave, index) => (
              <div
                className="availability-row"
                key={leave.id || index}
              >
                <div className="avatar soft">
                  {employeeName(leave.employee_id)
                    .slice(0, 1)
                    .toUpperCase()}
                </div>

                <div className="availability-person">
                  <b>{employeeName(leave.employee_id)}</b>
                  <small>
                    {leave.leave_type || leave.type || "Leave"}
                    {" · "}
                    {leave.start_date || leave.from_date}
                    {" to "}
                    {leave.end_date || leave.to_date}
                  </small>
                </div>

                <span className="status-badge approved">
                  Approved
                </span>
              </div>
            ))}

          {!approvedLeaves.length && (
            <p className="empty-state">
              No approved leave records found.
            </p>
          )}

          <p className="helper-text">
            The backend must validate overlapping leave requests
            before approving them.
          </p>
        </section>
      </div>
    </>
  );
}