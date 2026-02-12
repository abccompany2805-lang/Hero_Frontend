import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const STAGE_DEVICE_API = `${API_BASE_URL}/api/stagedevicesmaster`;
const STAGE_API = `${API_BASE_URL}/api/stagemaster`;
const DEVICE_API = `${API_BASE_URL}/api/devicemaster`;

const emptyForm = {
  stage_id: "",
  device_id: "",
  logical_name: "",
  role: "",
  active: true,
};

const StageDeviceMaster = () => {
  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [devices, setDevices] = useState([]);

  const [filters, setFilters] = useState({
    stage_id: "",
    device_id: "",
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
    const [r, s, d] = await Promise.all([
      axios.get(STAGE_DEVICE_API),
      axios.get(STAGE_API),
      axios.get(DEVICE_API),
    ]);

    setRows(r.data);
    setStages(s.data);
    setDevices(d.data);
  };

  // ================= FILTER =================
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        String(r.stage_id).includes(filters.stage_id) &&
        String(r.device_id).includes(filters.device_id),
    );
  }, [rows, filters]);

  // ================= HELPERS =================
  const getStageName = (id) =>
    stages.find((s) => s.stage_id === id)?.stage_name || id;

  const getDeviceName = (id) =>
    devices.find((d) => d.device_id === id)?.device_code || id;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      stage_device_id: row.stage_device_id,
      stage_id: String(row.stage_id),
      device_id: String(row.device_id),
      logical_name: row.logical_name || "",
      role: row.role || "",
      active: row.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.stage_id || !formData.device_id) {
      alert("Stage and Device are required");
      return;
    }

    const payload = {
      stage_id: Number(formData.stage_id),
      device_id: Number(formData.device_id),
      logical_name: formData.logical_name,
      role: formData.role,
      active: formData.active,
    };

    if (isEditing) {
      await axios.put(
        `${STAGE_DEVICE_API}/${formData.stage_device_id}`,
        payload,
      );
    } else {
      await axios.post(STAGE_DEVICE_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this stage-device mapping?")) {
      await axios.delete(`${STAGE_DEVICE_API}/${id}`);
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
            <h4 className="fw-bold mb-1">Stage Device Master</h4>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Stage ID"
              style={{ width: 120 }}
              value={filters.stage_id}
              onChange={(e) =>
                setFilters({ ...filters, stage_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Device ID"
              style={{ width: 120 }}
              value={filters.device_id}
              onChange={(e) =>
                setFilters({ ...filters, device_id: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() => setFilters({ stage_id: "", device_id: "" })}
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Mapping
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
              <th>Stage</th>
              <th>Device</th>
              <th>Logical Name</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.stage_device_id}>
                <td>{i + 1}</td>
                <td>{getStageName(r.stage_id)}</td>
                <td>{getDeviceName(r.device_id)}</td>
                <td>{r.logical_name}</td>
                <td>{r.role}</td>
                <td>
                  <span
                    className={`badge ${
                      r.active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {r.active ? "Active" : "Inactive"}
                  </span>
                </td>
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
                    onClick={() => handleDelete(r.stage_device_id)}
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
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
            <h5 className="mb-3">
              {isEditing
                ? "Edit Stage Device Mapping"
                : "Add Stage Device Mapping"}
            </h5>

            <div className="mb-2">
              <label className="form-label">Stage</label>
              <select
                className="form-control"
                value={formData.stage_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stage_id: e.target.value,
                  })
                }
              >
                <option value="">Select Stage</option>
                {stages.map((s) => (
                  <option key={s.stage_id} value={s.stage_id}>
                    {s.stage_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Device</label>
              <select
                className="form-control"
                value={formData.device_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    device_id: e.target.value,
                  })
                }
              >
                <option value="">Select Device</option>
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.device_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Logical Name</label>
              <input
                className="form-control"
                value={formData.logical_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logical_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Role</label>
              <input
                className="form-control"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
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
            <h5 className="mb-3">Stage Device Details</h5>

            {[
              ["Stage", getStageName(viewData.stage_id)],
              ["Device", getDeviceName(viewData.device_id)],
              ["Logical Name", viewData.logical_name],
              ["Role", viewData.role],
              ["Status", viewData.active ? "Active" : "Inactive"],
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

export default StageDeviceMaster;
