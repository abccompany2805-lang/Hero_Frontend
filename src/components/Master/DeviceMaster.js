import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const DEVICE_API = `${API_BASE_URL}/api/devicemaster`;

const emptyForm = {
  device_code: "",
  device_type: "",
  protocol: "",
  ip_address: "",
  mac_address: "",
  status: true,
};

const DeviceMaster = () => {
  const [devices, setDevices] = useState([]);

  const [filters, setFilters] = useState({
    device_code: "",
    device_type: "",
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
    const r = await axios.get(DEVICE_API);
    setDevices(r.data);
  };

  // ================= FILTER =================
  const filteredDevices = useMemo(() => {
    return devices.filter(
      (d) =>
        d.device_code
          .toLowerCase()
          .includes(filters.device_code.toLowerCase()) &&
        d.device_type
          .toLowerCase()
          .includes(filters.device_type.toLowerCase())
    );
  }, [devices, filters]);

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      device_id: row.device_id,
      device_code: row.device_code,
      device_type: row.device_type,
      protocol: row.protocol || "",
      ip_address: row.ip_address || "",
      mac_address: row.mac_address || "",
      status: row.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.device_code || !formData.device_type) {
      alert("Device Code and Device Type are required");
      return;
    }

    const payload = {
      device_code: formData.device_code,
      device_type: formData.device_type,
      protocol: formData.protocol,
      ip_address: formData.ip_address || null,
      mac_address: formData.mac_address,
      status: formData.status,
    };

    if (isEditing) {
      await axios.put(
        `${DEVICE_API}/${formData.device_id}`,
        payload
      );
    } else {
      await axios.post(DEVICE_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this device?")) {
      await axios.delete(`${DEVICE_API}/${id}`);
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
            <h4 className="fw-bold mb-1">Device Master</h4>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Device Code"
              style={{ width: 160 }}
              value={filters.device_code}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  device_code: e.target.value,
                })
              }
            />

            <input
              className="form-control"
              placeholder="Device Type"
              style={{ width: 160 }}
              value={filters.device_type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  device_type: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ device_code: "", device_type: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Device
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
              <th>Device Code</th>
              <th>Type</th>
              <th>Protocol</th>
              <th>IP</th>
              <th>MAC</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((d, i) => (
              <tr key={d.device_id}>
                <td>{i + 1}</td>
                <td>{d.device_code}</td>
                <td>{d.device_type}</td>
                <td>{d.protocol}</td>
                <td>{d.ip_address}</td>
                <td>{d.mac_address}</td>
                <td>
                  <span
                    className={`badge ${
                      d.status ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {d.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(d)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(d)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      handleDelete(d.device_id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredDevices.length === 0 && (
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
              {isEditing ? "Edit Device" : "Add Device"}
            </h5>

            {[
              ["Device Code", "device_code"],
              ["Device Type", "device_type"],
              ["Protocol", "protocol"],
              ["IP Address", "ip_address"],
              ["MAC Address", "mac_address"],
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
                checked={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.checked,
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
            <h5 className="mb-3">Device Details</h5>

            {[
              ["Device Code", viewData.device_code],
              ["Type", viewData.device_type],
              ["Protocol", viewData.protocol],
              ["IP Address", viewData.ip_address],
              ["MAC Address", viewData.mac_address],
              ["Status", viewData.status ? "Active" : "Inactive"],
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

export default DeviceMaster;
