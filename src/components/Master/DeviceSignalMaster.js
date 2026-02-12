import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const DEVICE_SIGNAL_API = `${API_BASE_URL}/api/devicesignalmaster`;
const STAGE_DEVICE_API = `${API_BASE_URL}/api/stagedevicesmaster`;
const STAGE_API = `${API_BASE_URL}/api/stagemaster`;
const DEVICE_API = `${API_BASE_URL}/api/devicemaster`;

const emptyForm = {
  stage_device_id: "",
  signal_name: "",
  signal_category: "",
  signal_type: "",
  register_address: "",
  bit_position: "",
  data_type: "",
  scaling_factor: "",
  offsetvalue: "",
  unit: "",
  read_mode: "",
  active: true,
};

const DeviceSignalMaster = () => {
  const [signals, setSignals] = useState([]);
  const [stageDevices, setStageDevices] = useState([]);
  const [stages, setStages] = useState([]);
  const [devices, setDevices] = useState([]);

  const [filters, setFilters] = useState({
    stage_device_id: "",
    signal_name: "",
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
    const [s, sd, st, d] = await Promise.all([
      axios.get(DEVICE_SIGNAL_API),
      axios.get(STAGE_DEVICE_API),
      axios.get(STAGE_API),
      axios.get(DEVICE_API),
    ]);
    setSignals(s.data);
    setStageDevices(sd.data);
    setStages(st.data);
    setDevices(d.data);
  };

  // ================= HELPERS =================
  const getStageName = (stageId) =>
    stages.find((s) => s.stage_id === stageId)?.stage_name || stageId;

  const getDeviceName = (deviceId) =>
    devices.find((d) => d.device_id === deviceId)?.device_code || deviceId;

  const getStageDeviceLabel = (stageDeviceId) => {
    const sd = stageDevices.find(
      (x) => x.stage_device_id === stageDeviceId
    );
    if (!sd) return stageDeviceId;

    return `${getStageName(sd.stage_id)} → ${getDeviceName(sd.device_id)}`;
  };

  // ================= FILTER =================
  const filteredSignals = useMemo(() => {
    return signals.filter(
      (s) =>
        String(s.stage_device_id).includes(filters.stage_device_id) &&
        s.signal_name
          .toLowerCase()
          .includes(filters.signal_name.toLowerCase())
    );
  }, [signals, filters]);

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      signal_id: row.signal_id,
      stage_device_id: String(row.stage_device_id),
      signal_name: row.signal_name,
      signal_category: row.signal_category || "",
      signal_type: row.signal_type || "",
      register_address: row.register_address || "",
      bit_position: row.bit_position ?? "",
      data_type: row.data_type || "",
      scaling_factor: row.scaling_factor ?? "",
      offsetvalue: row.offsetvalue ?? "",
      unit: row.unit || "",
      read_mode: row.read_mode || "",
      active: row.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.stage_device_id || !formData.signal_name) {
      alert("Stage Device and Signal Name are required");
      return;
    }

    const payload = {
      stage_device_id: Number(formData.stage_device_id),
      signal_name: formData.signal_name,
      signal_category: formData.signal_category,
      signal_type: formData.signal_type,
      register_address: formData.register_address,
      bit_position:
        formData.bit_position !== ""
          ? Number(formData.bit_position)
          : null,
      data_type: formData.data_type,
      scaling_factor:
        formData.scaling_factor !== ""
          ? Number(formData.scaling_factor)
          : null,
      offsetvalue:
        formData.offsetvalue !== ""
          ? Number(formData.offsetvalue)
          : null,
      unit: formData.unit,
      read_mode: formData.read_mode,
      active: formData.active,
    };

    if (isEditing) {
      await axios.put(
        `${DEVICE_SIGNAL_API}/${formData.signal_id}`,
        payload
      );
    } else {
      await axios.post(DEVICE_SIGNAL_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this signal?")) {
      await axios.delete(`${DEVICE_SIGNAL_API}/${id}`);
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
      }}      >
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1">Device Signal Master</h4>
           
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Stage Device ID"
              style={{ width: 160 }}
              value={filters.stage_device_id}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  stage_device_id: e.target.value,
                })
              }
            />

            <input
              className="form-control"
              placeholder="Signal Name"
              style={{ width: 180 }}
              value={filters.signal_name}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  signal_name: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ stage_device_id: "", signal_name: "" })
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
              <th>Stage → Device</th>
              <th>Signal Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Register</th>
              <th>Bit</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map((s, i) => (
              <tr key={s.signal_id}>
                <td>{i + 1}</td>
                <td>{getStageDeviceLabel(s.stage_device_id)}</td>
                <td>{s.signal_name}</td>
                <td>{s.signal_category}</td>
                <td>{s.signal_type}</td>
                <td>{s.register_address}</td>
                <td>{s.bit_position}</td>
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
                    onClick={() => handleDelete(s.signal_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredSignals.length === 0 && (
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
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 640 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Device Signal" : "Add Device Signal"}
            </h5>

            <div className="mb-2">
              <label className="form-label">Stage → Device</label>
              <select
                className="form-control"
                value={formData.stage_device_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stage_device_id: e.target.value,
                  })
                }
              >
                <option value="">Select Stage Device</option>
                {stageDevices.map((sd) => (
                  <option
                    key={sd.stage_device_id}
                    value={sd.stage_device_id}
                  >
                    {getStageName(sd.stage_id)} →{" "}
                    {getDeviceName(sd.device_id)}
                  </option>
                ))}
              </select>
            </div>

            {[
              ["Signal Name", "signal_name"],
              ["Signal Category", "signal_category"],
              ["Signal Type", "signal_type"],
              ["Register Address", "register_address"],
              ["Bit Position", "bit_position"],
              ["Data Type", "data_type"],
              ["Scaling Factor", "scaling_factor"],
              ["Offset Value", "offsetvalue"],
              ["Unit", "unit"],
              ["Read Mode", "read_mode"],
            ].map(([label, key]) => (
              <div className="mb-2" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-control"
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}

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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 460 }}>
            <h5 className="mb-3">Device Signal Details</h5>

            {[
              ["Stage → Device", getStageDeviceLabel(viewData.stage_device_id)],
              ["Signal Name", viewData.signal_name],
              ["Category", viewData.signal_category],
              ["Type", viewData.signal_type],
              ["Register", viewData.register_address],
              ["Bit Position", viewData.bit_position],
              ["Data Type", viewData.data_type],
              ["Scaling Factor", viewData.scaling_factor],
              ["Offset", viewData.offsetvalue],
              ["Unit", viewData.unit],
              ["Read Mode", viewData.read_mode],
              ["Status", viewData.active ? "Active" : "Inactive"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="d-flex justify-content-between mb-1"
              >
                <strong className="text-muted">{k}</strong>
                <span>{v ?? "-"}</span>
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

export default DeviceSignalMaster;
