import { useState } from "react";
import { Mail, CalendarDays, FileSpreadsheet, FileText, Plug, Download } from "lucide-react";
import { integrationApi } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const integrations = [
  { id: "email", name: "Email Notifications", description: "Send HR announcements and employee notifications.", icon: Mail },
  { id: "calendar", name: "Calendar Integration", description: "Coordinate interviews, onboarding, and HR events.", icon: CalendarDays },
];

function downloadSampleCsv() {
  const rows = [
    ["Employee", "Department", "Status"],
    ["Priya Sharma", "Engineering", "Active"],
    ["Karan Mehta", "Design", "Pending"],
  ];

  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "worksphere-employees-sample.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Integrations() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function exportFromApi(resource) {
    setBusy(true);
    setMessage("");

    try {
      await integrationApi.exportCsv(resource);
      setMessage(`${resource} CSV export started.`);
    } catch {
      setMessage("Backend export is unavailable. You can download the sample CSV instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="panel integration-intro">
        <div className="integration-intro-icon"><Plug size={25} /></div>
        <div><h3>Connect your HR tools</h3><p>Manage communication, calendars, and data exports from one place.</p></div>
      </section>

      <div className="integration-grid">
        {integrations.map(({ id, name, description, icon: Icon }) => (
          <article className="panel integration-card" key={id}>
            <div className="integration-card-top">
              <div className="integration-icon"><Icon size={22} /></div>
              <StatusBadge status="Disconnected" />
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            <button className="secondary-button full-button" onClick={() => setMessage(`${name}: configure the OAuth connection endpoint in your backend to enable this integration.`)}>
              Configure integration
            </button>
          </article>
        ))}
      </div>

      <section className="panel export-panel">
        <div className="panel-heading">
          <div><h3>Data Export</h3><p>Export HR data for reports and offline analysis.</p></div>
        </div>

        <div className="export-row">
          <div className="export-file-icon"><FileSpreadsheet size={22} /></div>
          <div className="export-copy"><strong>Employee CSV</strong><p>Comma-separated employee data</p></div>
          <button className="secondary-button" disabled={busy} onClick={() => exportFromApi("employees")}><Download size={16} /> Export</button>
        </div>

        <div className="export-row">
          <div className="export-file-icon pdf-icon"><FileText size={22} /></div>
          <div className="export-copy"><strong>Sample CSV</strong><p>Download demo data to test your workflow</p></div>
          <button className="secondary-button" onClick={downloadSampleCsv}><Download size={16} /> Download</button>
        </div>

        {message && <p className="inline-message" role="status">{message}</p>}
        <p className="helper-text">PDF export requires a backend PDF endpoint or a client-side PDF library.</p>
      </section>
    </>
  );
}