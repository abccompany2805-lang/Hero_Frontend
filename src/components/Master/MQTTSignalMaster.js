import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const MQTT_SIGNAL_API = `${API_BASE_URL}/api/mqttsignalmaster`;
const STAGE_API = `${API_BASE_URL}/api/stagemaster`;

const emptyForm = {
  stage_id: "",
  logical_name: "",
  topic: "",
  payload_format: "",
  json_key: "",
  success_value: "",
  fail_value: "",
  active: true,
};

const MqttSignalMaster = () => {
  const [signals, setSignals] = useState([]);
  const [stages, setStages] = useState([]);

  const [filters, setFilters] = useState({
    stage_id: "",
    logical_name: "",
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
    const [r, s] = await Promise.all([
      axios.get(MQTT_SIGNAL_API),
      axios.get(STAGE_API),
    ]);
    setSignals(r.data);
    setStages(s.data);
  };

  // ================= FILTER =================
  const filteredSignals = useMemo(() => {
    return signals.filter(
      (s) =>
        String(s.stage_id).includes(filters.stage_id) &&
        s.logical_name
          .toLowerCase()
          .includes(filters.logical_name.toLowerCase())
    );
  }, [signals, filters]);

  // ================= HELPERS =================
  const getStageName = (id) =>
    stages.find((s) => s.stage_id === id)?.stage_name || id;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      mqtt_signal_id: row.mqtt_signal_id,
      stage_id: String(row.stage_id),
      logical_name: row.logical_name,
      topic: row.topic,
      payload_format: row.payload_format || "",
      json_key: row.json_key || "",
      success_value: row.success_value || "",
      fail_value: row.fail_value || "",
      active: row.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.stage_id || !formData.logical_name || !formData.topic) {
      alert("Stage, Logical Name, and Topic are required");
      return;
    }

    const payload = {
      stage_id: Number(formData.stage_id),
      logical_name: formData.logical_name,
      topic: formData.topic,
      payload_format: formData.payload_format,
      json_key: formData.json_key,
      success_value: formData.success_value,
      fail_value: formData.fail_value,
      active: formData.active,
    };

    if (isEditing) {
      await axios.put(
        `${MQTT_SIGNAL_API}/${formData.mqtt_signal_id}`,
        payload
      );
    } else {
      await axios.post(MQTT_SIGNAL_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this MQTT signal?")) {
      await axios.delete(`${MQTT_SIGNAL_API}/${id}`);
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
            <h4 className="fw-bold mb-1">MQTT Signal Master</h4>
           
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
              placeholder="Logical Name"
              style={{ width: 180 }}
              value={filters.logical_name}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  logical_name: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ stage_id: "", logical_name: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Signal
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
              <th>Logical Name</th>
              <th>Topic</th>
              <th>Payload</th>
              <th>JSON Key</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map((s, i) => (
              <tr key={s.mqtt_signal_id}>
                <td>{i + 1}</td>
                <td>{getStageName(s.stage_id)}</td>
                <td>{s.logical_name}</td>
                <td className="text-truncate" style={{ maxWidth: 260 }}>
                  {s.topic}
                </td>
                <td>{s.payload_format}</td>
                <td>{s.json_key}</td>
                <td>
                  <span
                    className={`badge ${
                      s.active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(s)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(s)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      handleDelete(s.mqtt_signal_id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredSignals.length === 0 && (
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 540 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit MQTT Signal" : "Add MQTT Signal"}
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
              <label className="form-label">Topic</label>
              <input
                className="form-control"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    topic: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Payload Format</label>
              <input
                className="form-control"
                placeholder="json / raw / text"
                value={formData.payload_format}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payload_format: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">JSON Key</label>
              <input
                className="form-control"
                value={formData.json_key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    json_key: e.target.value,
                  })
                }
              />
            </div>

            <div className="row">
              <div className="col">
                <label className="form-label">Success Value</label>
                <input
                  className="form-control"
                  value={formData.success_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      success_value: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col">
                <label className="form-label">Fail Value</label>
                <input
                  className="form-control"
                  value={formData.fail_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fail_value: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-check my-3">
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
            <h5 className="mb-3">MQTT Signal Details</h5>

            {[
              ["Stage", getStageName(viewData.stage_id)],
              ["Logical Name", viewData.logical_name],
              ["Topic", viewData.topic],
              ["Payload Format", viewData.payload_format],
              ["JSON Key", viewData.json_key],
              ["Success Value", viewData.success_value],
              ["Fail Value", viewData.fail_value],
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

export default MqttSignalMaster;
