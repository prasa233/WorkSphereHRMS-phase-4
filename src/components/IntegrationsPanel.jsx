import React, { useEffect, useState } from "react";
import api from "../api";

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function IntegrationsPanel({ user }) {
  const [status, setStatus] = useState(null);
  const [email, setEmail] = useState({ recipient: "", subject: "", message: "" });
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const isHrAdmin = ["HR", "ADMIN"].includes(String(user?.role || "").toUpperCase());

  useEffect(() => {
    api.get("/integrations/status")
      .then((response) => setStatus(response.data))
      .catch(() => setError("Could not load integration status."));
  }, []);

  async function downloadReport(path, filename) {
    setBusy(filename);
    setError("");
    setNotice("");
    try {
      const response = await api.get(path, { responseType: "blob" });
      saveBlob(response.data, filename);
      setNotice(`${filename} downloaded.`);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Report export failed.");
    } finally {
      setBusy("");
    }
  }

  async function sendEmail(event) {
    event.preventDefault();
    setBusy("email");
    setError("");
    setNotice("");
    try {
      const response = await api.post("/integrations/email/test", email);
      setNotice(response.data.message || "Notification email sent.");
      setEmail({ recipient: "", subject: "", message: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Email could not be sent.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="integrations-page">
      <div className="integration-heading">
        <div>
          <p className="integration-eyebrow">MODULE 25</p>
          <h2>Third-party integrations</h2>
          <p>Send notifications, export reports, and add tasks to your calendar.</p>
        </div>
      </div>

      <div className="integration-grid">
        <article className="integration-card">
          <div className="integration-card-heading">
            <span className="integration-icon">✉</span>
            <span className={status?.email?.configured ? "integration-status ready" : "integration-status pending"}>
              {status?.email?.configured ? "SMTP ready" : "SMTP setup needed"}
            </span>
          </div>
          <h3>Email notifications</h3>
          <p>Send a notification email using the SMTP settings in the backend environment.</p>
          <form className="integration-form" onSubmit={sendEmail}>
            <label>Recipient<input type="email" required value={email.recipient} onChange={(event) => setEmail({ ...email, recipient: event.target.value })} /></label>
            <label>Subject<input required maxLength={200} value={email.subject} onChange={(event) => setEmail({ ...email, subject: event.target.value })} /></label>
            <label>Message<textarea required maxLength={10000} rows={4} value={email.message} onChange={(event) => setEmail({ ...email, message: event.target.value })} /></label>
            <button className="primary integration-button" disabled={!isHrAdmin || !status?.email?.configured || busy !== ""}>
              {busy === "email" ? "Sending…" : "Send notification"}
            </button>
            {!isHrAdmin && <small>HR/Admin access is required to send email.</small>}
          </form>
        </article>

        <article className="integration-card">
          <div className="integration-card-heading">
            <span className="integration-icon">▦</span>
            <span className="integration-status ready">iCalendar export ready</span>
          </div>
          <h3>Calendar</h3>
          <p>Download dated tasks as an iCalendar file, then import it into Google Calendar or Outlook.</p>
          <button className="secondary integration-button" disabled={busy !== ""} onClick={() => downloadReport("/integrations/calendar/tasks.ics", "worksphere_tasks.ics")}>
            {busy === "worksphere_tasks.ics" ? "Preparing…" : "Export calendar (.ics)"}
          </button>
        </article>

        <article className="integration-card">
          <div className="integration-card-heading">
            <span className="integration-icon">⇩</span>
            <span className="integration-status ready">CSV and PDF</span>
          </div>
          <h3>Task reports</h3>
          <p>Download tasks with assignees, due dates, and status.</p>
          <div className="integration-actions">
            <button className="secondary integration-button" disabled={!isHrAdmin || busy !== ""} onClick={() => downloadReport("/integrations/exports/tasks.csv", "worksphere_tasks.csv")}>
              {busy === "worksphere_tasks.csv" ? "Preparing…" : "Export CSV"}
            </button>
            <button className="secondary integration-button" disabled={!isHrAdmin || busy !== ""} onClick={() => downloadReport("/integrations/exports/tasks.pdf", "worksphere_tasks.pdf")}>
              {busy === "worksphere_tasks.pdf" ? "Preparing…" : "Export PDF"}
            </button>
          </div>
          {!isHrAdmin && <small>HR/Admin access is required for full task reports.</small>}
        </article>
      </div>

      {notice && <p className="integration-notice" role="status">{notice}</p>}
      {error && <p className="integration-error" role="alert">{error}</p>}
    </section>
  );
}
