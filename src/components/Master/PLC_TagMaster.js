import { useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../../config";

const TAG_API = `${API_BASE_URL}/api/masterplc-tags`;
const STAGE_API = `${API_BASE_URL}/api/stages`;
const MQTT_API = `${API_BASE_URL}/api/mqtt-signal`;

const emptyForm = {
  stage_id: "",
  logical_name: "",
  register_address: "",
  bit_position: "",
  adr_length: "",
  data_type: "",
  scaling_factor: "",
  offset_: "",
  read_mode: "",
  active: true,
};

const PLCTagMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    logical_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */

const { data: tags = [] } = useQuery({
  queryKey: ["plc-tags"],
  queryFn: async () => {
    const res = await axios.get(TAG_API);

    console.log("API Response:", res.data); // Debug once

    return Array.isArray(res.data)
      ? res.data
      : res.data.data || [];
  },
});
const { data: mqttSignals = [] } = useQuery({
  queryKey: ["mqtt-signals"],
  queryFn: async () => {
    const res = await axios.get(MQTT_API);

    return Array.isArray(res.data)
      ? res.data
      : res.data.data || [];
  },
});

const stageLogicalNames = useMemo(() => {
  if (!formData.stage_id) return [];

  return mqttSignals.filter(
    (s) =>
      s.stage_id === formData.stage_id &&
      s.active === true
  );
}, [mqttSignals, formData.stage_id]);

  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const res = await axios.get(STAGE_API);
      return res.data || [];
    },
  });

  /* ================= FILTER ================= */

  const filteredTags = useMemo(() => {
    return tags.filter((t) =>
      t.logical_name
        ?.toLowerCase()
        .includes(filters.logical_name.toLowerCase())
    );
  }, [tags, filters]);

  const getStageName = (id) => {
  const stage = stages.find((s) => s.stage_id === id);
  if (!stage) return "Unknown";
  return `${stage.stage_no} - ${stage.stage_name}`;
};
  

const ViewItem = ({ label, value }) => (
  <div className="col-6">
    <div className="border rounded-3 p-2 bg-light">
      <small className="text-muted">{label}</small>
      <div className="fw-semibold">
        {value !== null && value !== "" ? value : "-"}
      </div>
    </div>
  </div>
);

  /* ================= MUTATIONS ================= */

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return axios.put(`${TAG_API}/${formData.tag_id}`, payload);
      }
      return axios.post(TAG_API, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plc-tags"] });
      setShowModal(false);
      setFormData(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${TAG_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plc-tags"] });
    },
  });

  /* ================= CRUD ================= */

  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({ ...row });
    setShowModal(true);
  };

const handleSave = () => {
  if (
    !formData.stage_id ||
    !formData.logical_name ||
    !formData.register_address ||
    !formData.data_type
  ) {
    alert("Required fields missing.");
    return;
  }

  const payload = {
    stage_id: formData.stage_id,
    logical_name: formData.logical_name.trim(),
    register_address: formData.register_address.trim(),

    bit_position:
      formData.bit_position !== ""
        ? Number(formData.bit_position)
        : null,

    adr_length:
      formData.adr_length !== ""
        ? Number(formData.adr_length)
        : 1,

    data_type: formData.data_type,

    scaling_factor:
      formData.scaling_factor !== ""
        ? Number(formData.scaling_factor)
        : null,

    offset_:
      formData.offset_ !== ""
        ? Number(formData.offset_)
        : null,

    read_mode: formData.read_mode || null,

    active: formData.active,
  };

  console.log("Sending Payload:", payload);

  saveMutation.mutate(payload);
};

  const handleDelete = (id) => {
    if (!window.confirm("Delete this tag?")) return;
    deleteMutation.mutate(id);
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-3">

      {/* HEADER */}
      <div className="card shadow-sm rounded-4 mb-3 mx-2"           
       style={{
          borderLeft: "5px solid #dc3545",
          borderTop: 0,
          borderRight: 0,
          borderBottom: 0,
        }}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">PLC Tag Master</h4>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Filter Logical Name"
              style={{ width: 200 }}
              value={filters.logical_name}
              onChange={(e) =>
                setFilters({ ...filters, logical_name: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() => setFilters({ logical_name: "" })}
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Tag
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Stage</th>
              <th>Logical Name</th>
              <th>Register</th>
              <th>Data Type</th>
              <th>Active</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map((row, i) => (
              <tr key={row.tag_id}>
                <td>{i + 1}</td>
                <td>{getStageName(row.stage_id)}</td>
                <td>{row.logical_name}</td>
                <td>{row.register_address}</td>
                <td>{row.data_type}</td>
                <td>
                  <span className={`badge ${row.active ? "bg-success" : "bg-secondary"}`}>
                    {row.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleView(row)}>
                    <Eye size={14} />
                  </button>
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(row)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(row.tag_id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredTags.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
{/* ADD / EDIT MODAL */}
{/* ADD / EDIT MODAL */}
{showModal && (
  <div style={modalStyle}>
    <div
      className="bg-white rounded-4 shadow p-4"
      style={{
        width: 750,
        maxHeight: "85vh",
        overflowY: "auto",
      }}
    >
      <h5 className="mb-3 fw-bold">
        {isEditing ? "Edit PLC Tag" : "Add PLC Tag"}
      </h5>

      <div className="row g-3">

        {/* Stage */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold">Stage *</label>
          <select
            className="form-control form-control-sm"
            value={formData.stage_id}
            onChange={(e) =>
              setFormData({ ...formData, stage_id: e.target.value })
            }
          >
            <option value="">Select Stage</option>
            {stages.map((s) => (
              <option key={s.stage_id} value={s.stage_id}>
                {s.stage_no} - {s.stage_name}
              </option>
            ))}
          </select>
        </div>

        {/* Logical Name */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold">
            Logical Name *
          </label>
          <select
            className="form-control form-control-sm"
            value={formData.logical_name}
            onChange={(e) =>
              setFormData({ ...formData, logical_name: e.target.value })
            }
            disabled={!formData.stage_id}
          >
            <option value="">Select Logical Name</option>
            {stageLogicalNames.map((signal) => (
              <option
                key={signal.mqtt_signal_id}
                value={signal.logical_name}
              >
                {signal.logical_name}
              </option>
            ))}
          </select>
        </div>

        {[
          { name: "register_address", label: "Register Address *" },
          { name: "bit_position", label: "Bit Position" },
          { name: "adr_length", label: "Address Length" },
          { name: "data_type", label: "Data Type *" },
          { name: "scaling_factor", label: "Scaling Factor" },
          { name: "offset_", label: "Offset" },
          { name: "read_mode", label: "Read Mode" },
        ].map((field) => (
          <div key={field.name} className="col-md-6">
            <label className="form-label small fw-semibold">
              {field.label}
            </label>
            <input
              className="form-control form-control-sm"
              value={formData[field.name] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field.name]: e.target.value,
                })
              }
            />
          </div>
        ))}

        {/* Active */}
        <div className="col-md-6 d-flex align-items-center">
          <div className="form-check mt-4">
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
            <label className="form-check-label small fw-semibold">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  </div>
)}

{/* VIEW MODAL */}
{showView && viewData && (
  <div style={modalStyle}>
    <div className="bg-white rounded-4 shadow p-4" style={{ width: 600 }}>
      <h5 className="mb-4 fw-bold">View PLC Tag</h5>

      <div className="row g-3">
        <ViewItem label="Stage" value={getStageName(viewData.stage_id)} />
        <ViewItem label="Logical Name" value={viewData.logical_name} />
        <ViewItem label="Register Address" value={viewData.register_address} />
        <ViewItem label="Bit Position" value={viewData.bit_position} />
        <ViewItem label="Address Length" value={viewData.adr_length} />
        <ViewItem label="Data Type" value={viewData.data_type} />
        <ViewItem label="Scaling Factor" value={viewData.scaling_factor} />
        <ViewItem label="Offset" value={viewData.offset_} />
        <ViewItem label="Read Mode" value={viewData.read_mode} />
        <ViewItem
          label="Active"
          value={viewData.active ? "Active" : "Inactive"}
        />
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button
          className="btn btn-secondary"
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

const modalStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050,
};

export default PLCTagMaster;