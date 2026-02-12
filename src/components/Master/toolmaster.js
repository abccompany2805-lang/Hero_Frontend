import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const TOOL_API = `${API_BASE_URL}/api/toolmaster`;

const emptyForm = {
  tool_code: "",
  tool_type: "",
  make_model: "",              // ✅ MODEL AS INPUT
  leak_tester: "",
  communication_protocol: "",
  ip_address: "",
  calibration_due_date: "",
  status: true,
};

const ToolMaster = () => {
  const [tools, setTools] = useState([]);

  const [filters, setFilters] = useState({
    tool_code: "",
    tool_type: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const res = await axios.get(TOOL_API);
    setTools(res.data);
  };

  // ================= FILTER =================
  const filteredTools = useMemo(() => {
    return tools.filter(
      (t) =>
        t.tool_code
          ?.toLowerCase()
          .includes(filters.tool_code.toLowerCase()) &&
        (t.tool_type || "")
          .toLowerCase()
          .includes(filters.tool_type.toLowerCase())
    );
  }, [tools, filters]);

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      tool_id: row.tool_id,
      tool_code: row.tool_code,
      tool_type: row.tool_type || "",
      make_model: row.make_model || "",
      leak_tester: row.leak_tester || "",
      communication_protocol: row.communication_protocol || "",
      ip_address: row.ip_address || "",
      calibration_due_date: row.calibration_due_date
        ? row.calibration_due_date.split("T")[0]
        : "",
      status: row.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.tool_code) {
      alert("Tool Code is required");
      return;
    }

    const payload = { ...formData };

    if (isEditing) {
      await axios.put(`${TOOL_API}/${formData.tool_id}`, payload);
    } else {
      await axios.post(TOOL_API, payload);
    }

    setShowModal(false);
    fetchTools();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this tool?")) {
      await axios.delete(`${TOOL_API}/${id}`);
      fetchTools();
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
          <div>
            <h4 className="fw-bold mb-1">Tool Master</h4>
            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Tool Code"
              style={{ width: 160 }}
              value={filters.tool_code}
              onChange={(e) =>
                setFilters({ ...filters, tool_code: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Tool Type"
              style={{ width: 160 }}
              value={filters.tool_type}
              onChange={(e) =>
                setFilters({ ...filters, tool_type: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() => setFilters({ tool_code: "", tool_type: "" })}
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Tool
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
              <th>Tool Code</th>
              <th>Tool Type</th>
              <th>Model/ Make</th>
              <th>Protocol</th>
              <th>IP Address</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTools.map((row, i) => (
              <tr key={row.tool_id}>
                <td>{i + 1}</td>
                <td>{row.tool_code}</td>
                <td>{row.tool_type}</td>
                <td>{row.make_model}</td>
                <td>{row.communication_protocol}</td>
                <td>{row.ip_address}</td>
                <td>
                  <span
                    className={`badge ${
                      row.status ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {row.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(row)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(row)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(row.tool_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredTools.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
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
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Tool" : "Add Tool"}
            </h5>

            {[
              ["Tool Code", "tool_code"],
              ["Tool Type", "tool_type"],
              ["Model", "make_model"],
              ["Leak Tester", "leak_tester"],
              ["Communication Protocol", "communication_protocol"],
              ["IP Address", "ip_address"],
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

            <div className="mb-2">
              <label className="form-label">Calibration Due Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.calibration_due_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calibration_due_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-check mb-3">
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

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
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
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
            <h5 className="mb-3">Tool Details</h5>

            {[
              ["Tool Code", viewData.tool_code],
              ["Tool Type", viewData.tool_type],
              ["Model", viewData.make_model],
              ["Leak Tester", viewData.leak_tester],
              ["Protocol", viewData.communication_protocol],
              ["IP Address", viewData.ip_address],
              ["Calibration Due", viewData.calibration_due_date],
              ["Status", viewData.status ? "Active" : "Inactive"],
            ].map(([k, v]) => (
              <div key={k} className="d-flex justify-content-between mb-1">
                <strong className="text-muted">{k}</strong>
                <span>{v || "-"}</span>
              </div>
            ))}

            <div className="text-end mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowView(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolMaster;
