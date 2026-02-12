import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const DOCUMENT_API = `${API_BASE_URL}/api/documentmaster`;

const emptyForm = {
  document_id: "",
  document_type: "",
  document_code: "",
  title: "",
  department: "",
  owner: "",
  status: true,
};

const DocumentMaster = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    document_type: "",
    document_code: "",
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
    const res = await axios.get(DOCUMENT_API);
    setRows(res.data);
  };

  // ================= FILTER =================
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        r.document_type
          ?.toLowerCase()
          .includes(filters.document_type.toLowerCase()) &&
        r.document_code
          ?.toLowerCase()
          .includes(filters.document_code.toLowerCase())
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
      document_id: row.document_id,
      document_type: row.document_type,
      document_code: row.document_code,
      title: row.title,
      department: row.department || "",
      owner: row.owner || "",
      status: row.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.document_id ||
      !formData.document_type ||
      !formData.document_code ||
      !formData.title
    ) {
      alert("Document ID, Type, Code and Title are required");
      return;
    }

    const payload = {
      document_id: Number(formData.document_id),
      document_type: formData.document_type,
      document_code: formData.document_code,
      title: formData.title,
      department: formData.department || null,
      owner: formData.owner || null,
      status: formData.status,
    };

    if (isEditing) {
      await axios.put(
        `${DOCUMENT_API}/${formData.document_id}`,
        payload
      );
    } else {
      await axios.post(DOCUMENT_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this document?")) {
      await axios.delete(`${DOCUMENT_API}/${id}`);
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
          <h4 className="fw-bold mb-0">Document Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Document Type"
              style={{ width: 160 }}
              value={filters.document_type}
              onChange={(e) =>
                setFilters({ ...filters, document_type: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Document Code"
              style={{ width: 160 }}
              value={filters.document_code}
              onChange={(e) =>
                setFilters({ ...filters, document_code: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ document_type: "", document_code: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Document
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
              <th>ID</th>
              <th>Type</th>
              <th>Code</th>
              <th>Title</th>
              <th>Department</th>
              <th>Owner</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.document_id}>
                <td>{i + 1}</td>
                <td>{r.document_id}</td>
                <td>{r.document_type}</td>
                <td>{r.document_code}</td>
                <td>{r.title}</td>
                <td>{r.department || "-"}</td>
                <td>{r.owner || "-"}</td>
                <td>
                  <span className={`badge ${r.status ? "bg-success" : "bg-secondary"}`}>
                    {r.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleView(r)}>
                    <Eye size={14} />
                  </button>
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(r)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(r.document_id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
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
                {isEditing ? "Edit Document" : "Add Document"}
              </h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            {/* DOCUMENT ID */}
            <div className="mb-2">
              <label className="form-label">Document ID</label>
              <input
                type="number"
                className="form-control"
                value={formData.document_id}
                disabled={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, document_id: e.target.value })
                }
              />
            </div>

            {[
              ["Document Type", "document_type"],
              ["Document Code", "document_code"],
              ["Title", "title"],
              ["Department", "department"],
              ["Owner", "owner"],
            ].map(([label, key]) => (
              <div className="mb-2" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-control"
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}

            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked })
                }
              />
              <label className="form-check-label">Active</label>
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
            <h5 className="mb-3">Document Details</h5>

            {[
              ["ID", viewData.document_id],
              ["Type", viewData.document_type],
              ["Code", viewData.document_code],
              ["Title", viewData.title],
              ["Department", viewData.department],
              ["Owner", viewData.owner],
              ["Status", viewData.status ? "Active" : "Inactive"],
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

export default DocumentMaster;
