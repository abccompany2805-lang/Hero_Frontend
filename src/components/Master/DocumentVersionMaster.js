import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const VERSION_API = `${API_BASE_URL}/api/documentversions`;
const DOCUMENT_API = `${API_BASE_URL}/api/documentmaster`;

const emptyForm = {
  document_version_id: "",
  document_id: "",
  version_no: "",
  file_path: "",
  effective_date: "",
  release_status: "",
  released_by: "",
};

const DocumentVersionMaster = () => {
  const [rows, setRows] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [filters, setFilters] = useState({
    document_id: "",
    version_no: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [v, d] = await Promise.all([
      axios.get(VERSION_API),
      axios.get(DOCUMENT_API),
    ]);
    setRows(v.data);
    setDocuments(d.data);
  };

  // ================= HELPERS =================
  const getDocumentLabel = (docId) => {
    const d = documents.find((x) => x.document_id === docId);
    if (!d) return docId;
    return `${d.document_code} – ${d.title}`;
  };

  // ================= FILTER =================
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        String(r.document_id).includes(filters.document_id) &&
        r.version_no
          ?.toLowerCase()
          .includes(filters.version_no.toLowerCase())
    );
  }, [rows, filters]);

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      document_version_id: row.document_version_id,
      document_id: String(row.document_id),
      version_no: row.version_no,
      file_path: row.file_path,
      effective_date: row.effective_date
        ? row.effective_date.substring(0, 10)
        : "",
      release_status: row.release_status || "",
      released_by: row.released_by || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.document_id || !formData.version_no || !formData.file_path) {
      alert("Document, Version No and File Path are required");
      return;
    }

    const payload = {
      document_id: Number(formData.document_id),
      version_no: formData.version_no,
      file_path: formData.file_path,
      effective_date: formData.effective_date || null,
      release_status: formData.release_status || null,
      released_by: formData.released_by || null,
    };

    if (isEditing) {
      await axios.put(
        `${VERSION_API}/${formData.document_version_id}`,
        payload
      );
    } else {
      await axios.post(VERSION_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this document version?")) {
      await axios.delete(`${VERSION_API}/${id}`);
      fetchAll();
    }
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  // ================= UI =================
  return (
    <div className="container-fluid py-3">

      {/* ================= HEADER + FILTERS ================= */}
      <div
        className="card shadow-sm rounded-4 mb-2 mx-2"
        style={{
          borderLeft: "5px solid #dc3545",
          borderTop: 0,
          borderRight: 0,
          borderBottom: 0,
        }}
      >
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h4 className="fw-bold mb-0">Document Version Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Document ID"
              style={{ width: 140 }}
              value={filters.document_id}
              onChange={(e) =>
                setFilters({ ...filters, document_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Version No"
              style={{ width: 140 }}
              value={filters.version_no}
              onChange={(e) =>
                setFilters({ ...filters, version_no: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ document_id: "", version_no: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Version
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead className="border-bottom">
            <tr className="text-muted">
              <th>Sr</th>
              <th>Document</th>
              <th>Version</th>
              <th>Effective Date</th>
              <th>Status</th>
              <th>Released By</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.document_version_id}>
                <td>{i + 1}</td>
                <td>{getDocumentLabel(r.document_id)}</td>
                <td>{r.version_no}</td>
                <td>{r.effective_date || "-"}</td>
                <td>{r.release_status || "-"}</td>
                <td>{r.released_by || "-"}</td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(r)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(r)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(r.document_version_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: 520 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                {isEditing ? "Edit Document Version" : "Add Document Version"}
              </h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            {/* DOCUMENT */}
            <div className="mb-2">
              <label className="form-label">Document</label>
              <select
                className="form-control"
                value={formData.document_id}
                disabled={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, document_id: e.target.value })
                }
              >
                <option value="">Select Document</option>
                {documents.map((d) => (
                  <option key={d.document_id} value={d.document_id}>
                    {d.document_code} – {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Version No</label>
              <input
                className="form-control"
                value={formData.version_no}
                onChange={(e) =>
                  setFormData({ ...formData, version_no: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">File Path</label>
              <input
                className="form-control"
                value={formData.file_path}
                onChange={(e) =>
                  setFormData({ ...formData, file_path: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Effective Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.effective_date}
                onChange={(e) =>
                  setFormData({ ...formData, effective_date: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Release Status</label>
              <input
                className="form-control"
                value={formData.release_status}
                onChange={(e) =>
                  setFormData({ ...formData, release_status: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Released By</label>
              <input
                className="form-control"
                value={formData.released_by}
                onChange={(e) =>
                  setFormData({ ...formData, released_by: e.target.value })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}
      {showView && viewData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
            <h5 className="mb-3">Document Version Details</h5>

            {[
              ["Document", getDocumentLabel(viewData.document_id)],
              ["Version", viewData.version_no],
              ["File Path", viewData.file_path],
              ["Effective Date", viewData.effective_date],
              ["Release Status", viewData.release_status],
              ["Released By", viewData.released_by],
            ].map(([k, v]) => (
              <div key={k} className="d-flex justify-content-between mb-1">
                <strong className="text-muted">{k}</strong>
                <span>{v ?? "-"}</span>
              </div>
            ))}

            <div className="text-end mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVersionMaster;
