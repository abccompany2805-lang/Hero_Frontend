import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const REQUIREMENT_API = `${API_BASE_URL}/api/routesteprequirements`;
const ROUTE_STEP_API = `${API_BASE_URL}/api/routestepmaster`;
const DEVICE_SIGNAL_API = `${API_BASE_URL}/api/devicesignalmaster`;
const MQTT_SIGNAL_API = `${API_BASE_URL}/api/mqttsignalmaster`;
const STAGE_API = `${API_BASE_URL}/api/stagemaster`;

const emptyForm = {
  route_step_id: "",
  requirement_type: "",
  required: true,
  source_type: "",
  signal_id: "",
  mqtt_signal_id: "",
  timeout_sec: "",
};

const RouteStepRequirementMaster = () => {
  const [rows, setRows] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [deviceSignals, setDeviceSignals] = useState([]);
  const [mqttSignals, setMqttSignals] = useState([]);
  const [stages, setStages] = useState([]);

  const [filters, setFilters] = useState({
    route_step_id: "",
    requirement_type: "",
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
    const [r, rs, ds, ms, st] = await Promise.all([
      axios.get(REQUIREMENT_API),
      axios.get(ROUTE_STEP_API),
      axios.get(DEVICE_SIGNAL_API),
      axios.get(MQTT_SIGNAL_API),
      axios.get(STAGE_API),
    ]);

    setRows(r.data);
    setRouteSteps(rs.data);
    setDeviceSignals(ds.data);
    setMqttSignals(ms.data);
    setStages(st.data);
  };

  // ================= HELPERS =================
  const getStageName = (stageId) =>
    stages.find((s) => s.stage_id === stageId)?.stage_name || stageId;

  const getRouteStepLabel = (routeStepId) => {
    const rs = routeSteps.find((r) => r.route_step_id === routeStepId);
    if (!rs) return routeStepId;
    return `${getStageName(rs.stage_id)} → Seq ${rs.sequence_no}`;
  };

  const getDeviceSignalName = (id) =>
    deviceSignals.find((s) => s.signal_id === id)?.signal_name || id;

  const getMqttSignalName = (id) =>
    mqttSignals.find((s) => s.mqtt_signal_id === id)?.logical_name || id;

  // ================= FILTER =================
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        String(r.route_step_id).includes(filters.route_step_id) &&
        r.requirement_type
          .toLowerCase()
          .includes(filters.requirement_type.toLowerCase())
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
      requirement_id: row.requirement_id,
      route_step_id: String(row.route_step_id),
      requirement_type: row.requirement_type,
      required: row.required,
      source_type: row.source_type,
      signal_id: row.signal_id ? String(row.signal_id) : "",
      mqtt_signal_id: row.mqtt_signal_id
        ? String(row.mqtt_signal_id)
        : "",
      timeout_sec: row.timeout_sec ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.route_step_id || !formData.requirement_type || !formData.source_type) {
      alert("Route Step, Requirement Type and Source Type are required");
      return;
    }

    if (formData.source_type === "DEVICE_SIGNAL" && !formData.signal_id) {
      alert("Device Signal is required for DEVICE_SIGNAL source");
      return;
    }

    if (formData.source_type === "MQTT_SIGNAL" && !formData.mqtt_signal_id) {
      alert("MQTT Signal is required for MQTT_SIGNAL source");
      return;
    }

    const payload = {
      route_step_id: Number(formData.route_step_id),
      requirement_type: formData.requirement_type,
      required: formData.required,
      source_type: formData.source_type,
      signal_id:
        formData.source_type === "DEVICE_SIGNAL"
          ? Number(formData.signal_id)
          : null,
      mqtt_signal_id:
        formData.source_type === "MQTT_SIGNAL"
          ? Number(formData.mqtt_signal_id)
          : null,
      timeout_sec:
        formData.timeout_sec !== ""
          ? Number(formData.timeout_sec)
          : null,
    };

    if (isEditing) {
      await axios.put(
        `${REQUIREMENT_API}/${formData.requirement_id}`,
        payload
      );
    } else {
      await axios.post(REQUIREMENT_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this requirement?")) {
      await axios.delete(`${REQUIREMENT_API}/${id}`);
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
      <div className="card shadow-sm rounded-4 mb-2 mx-2"      style={{
        borderLeft: "5px solid #dc3545",
        borderTop: 0,
        borderRight: 0,
        borderBottom: 0,
      }}>
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1">Route Step Requirement Masterrrrr</h4>
            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Route Step ID"
              style={{ width: 160 }}
              value={filters.route_step_id}
              onChange={(e) =>
                setFilters({ ...filters, route_step_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Requirement Type"
              style={{ width: 200 }}
              value={filters.requirement_type}
              onChange={(e) =>
                setFilters({ ...filters, requirement_type: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ route_step_id: "", requirement_type: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Requirement
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
              <th>Route Step</th>
              <th>Requirement Type</th>
              <th>Source</th>
              <th>Signal</th>
              <th>Required</th>
              <th>Timeout (s)</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.requirement_id}>
                <td>{i + 1}</td>
                <td>{getRouteStepLabel(r.route_step_id)}</td>
                <td>{r.requirement_type}</td>
                <td>{r.source_type}</td>
                <td>
                  {r.source_type === "DEVICE_SIGNAL"
                    ? getDeviceSignalName(r.signal_id)
                    : getMqttSignalName(r.mqtt_signal_id)}
                </td>
                <td>
                  <span className={`badge ${r.required ? "bg-success" : "bg-secondary"}`}>
                    {r.required ? "Yes" : "No"}
                  </span>
                </td>
                <td>{r.timeout_sec}</td>
                <td className="text-end">
                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleView(r)}>
                    <Eye size={14} />
                  </button>
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(r)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(r.requirement_id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
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
        {isEditing ? "Edit Requirement" : "Add Requirement"}
      </h5>

      {/* ROUTE STEP */}
      <div className="mb-2">
        <label className="form-label">Route Step</label>
        <select
          className="form-control"
          value={formData.route_step_id}
          onChange={(e) =>
            setFormData({ ...formData, route_step_id: e.target.value })
          }
        >
          <option value="">Select Route Step</option>
          {routeSteps.map((rs) => (
            <option key={rs.route_step_id} value={rs.route_step_id}>
              {getStageName(rs.stage_id)} → Seq {rs.sequence_no}
            </option>
          ))}
        </select>
      </div>

      {/* REQUIREMENT TYPE */}
      <div className="mb-2">
        <label className="form-label">Requirement Type</label>
        <input
          className="form-control"
          placeholder="e.g. TORQUE_OK, PART_SCANNED"
          value={formData.requirement_type}
          onChange={(e) =>
            setFormData({ ...formData, requirement_type: e.target.value })
          }
        />
      </div>

      {/* SOURCE TYPE */}
      <div className="mb-2">
        <label className="form-label">Source Type</label>
        <select
          className="form-control"
          value={formData.source_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              source_type: e.target.value,
              signal_id: "",
              mqtt_signal_id: "",
            })
          }
        >
          <option value="">Select Source</option>
          <option value="DEVICE_SIGNAL">Device Signal</option>
          <option value="MQTT_SIGNAL">MQTT Signal</option>
        </select>
      </div>

      {/* DEVICE SIGNAL */}
      {formData.source_type === "DEVICE_SIGNAL" && (
        <div className="mb-2">
          <label className="form-label">Device Signal</label>
          <select
            className="form-control"
            value={formData.signal_id}
            onChange={(e) =>
              setFormData({ ...formData, signal_id: e.target.value })
            }
          >
            <option value="">Select Device Signal</option>
            {deviceSignals.map((s) => (
              <option key={s.signal_id} value={s.signal_id}>
                {s.signal_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* MQTT SIGNAL */}
      {formData.source_type === "MQTT_SIGNAL" && (
        <div className="mb-2">
          <label className="form-label">MQTT Signal</label>
          <select
            className="form-control"
            value={formData.mqtt_signal_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                mqtt_signal_id: e.target.value,
              })
            }
          >
            <option value="">Select MQTT Signal</option>
            {mqttSignals.map((m) => (
              <option key={m.mqtt_signal_id} value={m.mqtt_signal_id}>
                {m.logical_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TIMEOUT */}
      <div className="mb-2">
        <label className="form-label">Timeout (seconds)</label>
        <input
          type="number"
          className="form-control"
          placeholder="Optional"
          value={formData.timeout_sec}
          onChange={(e) =>
            setFormData({ ...formData, timeout_sec: e.target.value })
          }
        />
      </div>

      {/* REQUIRED */}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.required}
          onChange={(e) =>
            setFormData({ ...formData, required: e.target.checked })
          }
        />
        <label className="form-check-label">Required</label>
      </div>

      {/* ACTIONS */}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }}>
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">Requirement Details</h5>

            {[
              ["Route Step", getRouteStepLabel(viewData.route_step_id)],
              ["Requirement Type", viewData.requirement_type],
              ["Source Type", viewData.source_type],
              ["Signal", viewData.source_type === "DEVICE_SIGNAL" ? getDeviceSignalName(viewData.signal_id) : getMqttSignalName(viewData.mqtt_signal_id)],
              ["Required", viewData.required ? "Yes" : "No"],
              ["Timeout (sec)", viewData.timeout_sec],
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

export default RouteStepRequirementMaster;
