import { useState, type FormEvent } from "react";
import { api } from "../api";

type LeaveType = "ANNUAL" | "SICK" | "PERSONAL";

export function Leaves() {
  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (endDate < startDate) {
      setMessage("End date must be on or after the start date.");
      return;
    }

    setBusy(true);
    try {
      await api("/leaves", {
        method: "POST",
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      setMessage("Leave request submitted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>Apply for leave</h1>
      <form onSubmit={submit}>
        <label>
          Leave type
          <select
            value={leaveType}
            onChange={(event) => setLeaveType(event.target.value as LeaveType)}
          >
            <option value="ANNUAL">Annual</option>
            <option value="SICK">Sick</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </label>

        <label>
          Start date
          <input
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>

        <label>
          End date
          <input
            type="date"
            required
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>

        <button disabled={busy}>
          {busy ? "Submitting…" : "Submit request"}
        </button>
        {message && <p role="status">{message}</p>}
      </form>
    </main>
  );
}