import { useEffect, useState } from "react";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import api, { getErrorMessage } from "../api/client";

const MAX_SIZE = 10 * 1024 * 1024;

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState("Certificate");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      const [docs, employeeResponse] = await Promise.all([
        api.get("/documents"),
        api.get("/employees"),
      ]);

      setDocuments(
        Array.isArray(docs.data)
          ? docs.data
          : docs.data.items || []
      );

      setEmployees(
        Array.isArray(employeeResponse.data)
          ? employeeResponse.data
          : employeeResponse.data.items || []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadDocument(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Choose a file first.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("The file must be 10 MB or smaller.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    if (file.type && !allowedTypes.includes(file.type)) {
      setError("Only PDF, PNG, and JPEG files are allowed.");
      return;
    }

    const body = new FormData();
    body.append("file", file);

    if (employeeId) {
      body.append("employee_id", employeeId);
    }

    body.append("category", category);

    setLoading(true);

    try {
      await api.post("/documents", body);
      setMessage("Document uploaded successfully.");
      setFile(null);
      event.target.reset();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocument(doc) {
    try {
      const response = await api.get(
        `/documents/${doc.id}/download`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download =
        doc.file_name || doc.filename || "document";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function deleteDocument(doc) {
    const confirmed = window.confirm(
      `Delete ${doc.file_name || doc.filename || "this document"}?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/documents/${doc.id}`);
      setDocuments((current) =>
        current.filter((item) => item.id !== doc.id)
      );
      setMessage("Document deleted.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function employeeName(id) {
    const employee = employees.find(
      (item) => String(item.id) === String(id)
    );

    return employee?.name || employee?.full_name ||
      `Employee #${id}`;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MODULE 16</span>
          <h1>Document management</h1>
          <p>Upload, organize, and access employee documents.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Upload a document</h2>
            <p>PDF, PNG, or JPEG · Maximum 10 MB</p>
          </div>
          <UploadCloud size={22} />
        </div>

        <form className="upload-form" onSubmit={uploadDocument}>
          <label className="file-drop">
            <UploadCloud size={26} />
            <b>{file ? file.name : "Choose a file to upload"}</b>
            <span>Click to browse your computer</span>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
            />
          </label>

          <div className="form-grid">
            <label>
              Employee
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Not specified</option>
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
              Document type
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Certificate</option>
                <option>ID document</option>
                <option>Employment contract</option>
                <option>Other</option>
              </select>
            </label>

            <button className="primary-button" disabled={loading}>
              {loading ? "Uploading..." : "Upload document"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel section-gap">
        <div className="panel-heading">
          <div>
            <h2>Documents</h2>
            <p>{documents.length} file(s)</p>
          </div>

          <button className="secondary-button" onClick={loadData}>
            Refresh
          </button>
        </div>

        <div className="document-list">
          {documents.map((doc) => (
            <div className="document-row" key={doc.id}>
              <div className="document-icon"><FileText /></div>

              <div className="document-meta">
                <b>{doc.file_name || doc.filename || "Document"}</b>
                <small>
                  {doc.category || "Document"}
                  {" · "}
                  {doc.employee_id
                    ? employeeName(doc.employee_id)
                    : "Employee not specified"}
                  {" · "}
                  {doc.uploaded_at
                    ? new Date(doc.uploaded_at).toLocaleDateString()
                    : "Date unavailable"}
                </small>
              </div>

              <button
                className="icon-button"
                title="Download"
                onClick={() => downloadDocument(doc)}
              >
                <Download size={18} />
              </button>

              <button
                className="icon-button danger"
                title="Delete"
                onClick={() => deleteDocument(doc)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {!documents.length && (
            <div className="empty-state">
              No documents found.
            </div>
          )}
        </div>
      </section>

      <p className="helper-text">
        Validate file content and permissions on the server.
        Never expose private documents through public URLs.
      </p>
    </>
  );
}