import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const SPINDLE_API = `${API_BASE_URL}/api/spindlemaster`;
const TOOL_API = `${API_BASE_URL}/api/toolmaster`;

const emptyForm = {
  tool_id: "",        // ✅ ID in state (string)
  spindle_no: "",
  capacity: "",
  active: true,
};

const SpindleMaster = () => {
  const [spindles, setSpindles] = useState([]);
  const [tools, setTools] = useState([]);

  const [filters, setFilters] = useState({
    tool_id: "",
    spindle_no: "",
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
    const [s, t] = await Promise.all([
      axios.get(SPINDLE_API),
      axios.get(TOOL_API),
    ]);
    setSpindles(s.data);
    setTools(t.data);
  };

  // ================= FILTER =================
  const filteredSpindles = useMemo(() => {
    return spindles.filter(
      (s) =>
        String(s.tool_id).includes(filters.tool_id) &&
        String(s.spindle_no).includes(filters.spindle_no)
    );
  }, [spindles, filters]);

  // ================= HELPERS =================
  const getToolName = (toolId) =>
    tools.find((t) => t.tool_id === toolId)?.tool_code || toolId;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      spindle_id: row.spindle_id,
      tool_id: String(row.tool_id), // ✅ STRING for select
      spindle_no: String(row.spindle_no),
      capacity: row.capacity ? String(row.capacity) : "",
      active: row.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.tool_id) {
      alert("Please select Tool");
      return;
    }
    if (!formData.spindle_no) {
      alert("Spindle No is required");
      return;
    }

    const payload = {
      tool_id: Number(formData.tool_id),     // ✅ convert to number
      spindle_no: Number(formData.spindle_no),
      capacity: formData.capacity
        ? Number(formData.capacity)
        : null,
      active: formData.active,
    };

    if (isEditing) {
      await axios.put(
        `${SPINDLE_API}/${formData.spindle_id}`,
        payload
      );
    } else {
      await axios.post(SPINDLE_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this spindle?")) {
      await axios.delete(`${SPINDLE_API}/${id}`);
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
            <h4 className="fw-bold mb-1">Spindle Master</h4>
           
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Tool ID"
              style={{ width: 120 }}
              value={filters.tool_id}
              onChange={(e) =>
                setFilters({ ...filters, tool_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Spindle No"
              style={{ width: 120 }}
              value={filters.spindle_no}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  spindle_no: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ tool_id: "", spindle_no: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Spindle
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
              <th>Tool</th>
              <th>Spindle No</th>
              <th>Capacity</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpindles.map((row, i) => (
              <tr key={row.spindle_id}>
                <td>{i + 1}</td>
                <td>{getToolName(row.tool_id)}</td>
                <td>{row.spindle_no}</td>
                <td>{row.capacity}</td>
                <td>
                  <span
                    className={`badge ${
                      row.active
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {row.active ? "Active" : "Inactive"}
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
                    onClick={() => handleDelete(row.spindle_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredSpindles.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Spindle" : "Add Spindle"}
            </h5>

            <div className="mb-2">
              <label className="form-label">Tool</label>
              <select
                className="form-control"
                value={formData.tool_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tool_id: e.target.value,
                  })
                }
              >
                <option value="">Select Tool</option>
                {tools.map((t) => (
                  <option key={t.tool_id} value={t.tool_id}>
                    {t.tool_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Spindle No</label>
              <input
                type="number"
                className="form-control"
                value={formData.spindle_no}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spindle_no: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Capacity</label>
              <input
                type="number"
                className="form-control"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    active: e.target.checked,
                  })
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 420 }}>
            <h5 className="mb-3">Spindle Details</h5>

            {[
              ["Tool", getToolName(viewData.tool_id)],
              ["Spindle No", viewData.spindle_no],
              ["Capacity", viewData.capacity],
              ["Status", viewData.active ? "Active" : "Inactive"],
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

export default SpindleMaster;
