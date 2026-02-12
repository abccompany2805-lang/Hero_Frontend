import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const LIMIT_API = `${API_BASE_URL}/api/limitmaster`;
const PROCESS_API = `${API_BASE_URL}/api/processmaster`;

const emptyForm = {
  process_id: "",
  parameter_type: "",
  lsl: "",
  usl: "",
  unit: "",
  alarm_severity: "",
};

const LimitMaster = () => {
  const [limits, setLimits] = useState([]);
  const [processes, setProcesses] = useState([]);

  const [filters, setFilters] = useState({
    process_id: "",
    parameter_type: "",
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
    const [l, p] = await Promise.all([
      axios.get(LIMIT_API),
      axios.get(PROCESS_API),
    ]);
    setLimits(l.data);
    setProcesses(p.data);
  };

  // ================= FILTER =================
  const filteredLimits = useMemo(() => {
    return limits.filter(
      (l) =>
        String(l.process_id).includes(filters.process_id) &&
        (l.parameter_type || "")
          .toLowerCase()
          .includes(filters.parameter_type.toLowerCase())
    );
  }, [limits, filters]);

  // ================= HELPERS =================
  const getProcessName = (id) =>
    processes.find((p) => p.process_id === id)?.operation_name || id;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      limit_id: row.limit_id,
      process_id: String(row.process_id),
      parameter_type: row.parameter_type,
      lsl: row.lsl || "",
      usl: row.usl || "",
      unit: row.unit || "",
      alarm_severity: row.alarm_severity || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.process_id) {
      alert("Process is required");
      return;
    }
    if (!formData.parameter_type) {
      alert("Parameter Type is required");
      return;
    }

    const payload = {
      process_id: Number(formData.process_id),
      parameter_type: formData.parameter_type,
      lsl: formData.lsl,
      usl: formData.usl,
      unit: formData.unit,
      alarm_severity: formData.alarm_severity,
    };

    if (isEditing) {
      await axios.put(
        `${LIMIT_API}/${formData.limit_id}`,
        payload
      );
    } else {
      await axios.post(LIMIT_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this limit?")) {
      await axios.delete(`${LIMIT_API}/${id}`);
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
          <div>
            <h4 className="fw-bold mb-1">Limit Master</h4>
          
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Process ID"
              style={{ width: 130 }}
              value={filters.process_id}
              onChange={(e) =>
                setFilters({ ...filters, process_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Parameter Type"
              style={{ width: 160 }}
              value={filters.parameter_type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  parameter_type: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ process_id: "", parameter_type: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Limit
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
              <th>Process</th>
              <th>Parameter</th>
              <th>LSL</th>
              <th>USL</th>
              <th>Unit</th>
              <th>Alarm</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLimits.map((row, i) => (
              <tr key={row.limit_id}>
                <td>{i + 1}</td>
                <td>{getProcessName(row.process_id)}</td>
                <td>{row.parameter_type}</td>
                <td>{row.lsl}</td>
                <td>{row.usl}</td>
                <td>{row.unit}</td>
                <td>{row.alarm_severity}</td>
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
                    onClick={() => handleDelete(row.limit_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredLimits.length === 0 && (
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
              {isEditing ? "Edit Limit" : "Add Limit"}
            </h5>

            <div className="mb-2">
              <label className="form-label">Process</label>
              <select
                className="form-control"
                value={formData.process_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    process_id: e.target.value,
                  })
                }
              >
                <option value="">Select Process</option>
                {processes.map((p) => (
                  <option key={p.process_id} value={p.process_id}>
                    {p.operation_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Parameter Type</label>
              <input
                className="form-control"
                value={formData.parameter_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameter_type: e.target.value,
                  })
                }
              />
            </div>

            <div className="row">
              <div className="col">
                <label className="form-label">LSL</label>
                <input
                  className="form-control"
                  value={formData.lsl}
                  onChange={(e) =>
                    setFormData({ ...formData, lsl: e.target.value })
                  }
                />
              </div>
              <div className="col">
                <label className="form-label">USL</label>
                <input
                  className="form-control"
                  value={formData.usl}
                  onChange={(e) =>
                    setFormData({ ...formData, usl: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mb-2 mt-2">
              <label className="form-label">Unit</label>
              <input
                className="form-control"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Alarm Severity</label>
              <input
                className="form-control"
                value={formData.alarm_severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alarm_severity: e.target.value,
                  })
                }
              />
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 420 }}>
            <h5 className="mb-3">Limit Details</h5>

            {[
              ["Process", getProcessName(viewData.process_id)],
              ["Parameter", viewData.parameter_type],
              ["LSL", viewData.lsl],
              ["USL", viewData.usl],
              ["Unit", viewData.unit],
              ["Alarm", viewData.alarm_severity],
            ].map(([k, v]) => (
              <div
                key={k}
                className="d-flex justify-content-between mb-1"
              >
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

export default LimitMaster;
