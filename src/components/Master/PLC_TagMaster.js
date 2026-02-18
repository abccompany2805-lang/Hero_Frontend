import { useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../../config";

const TAG_API = `${API_BASE_URL}/api/plc-tags`;
const PLANT_API = `${API_BASE_URL}/api/plants`;

const emptyForm = {
  plant_id: "",
  tag_code: "",
  description: "",
  data_type: "",
  address: "",
  bit_index: "",
  _scale: "",
  off_set: "",
  data_length: "",
  is_active: true,
};

const PLCTagMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    tag_code: "",
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
      return res.data || [];
    },
  });

  const { data: plants = [] } = useQuery({
    queryKey: ["plants"],
    queryFn: async () => {
      const res = await axios.get(PLANT_API);
      return res.data || [];
    },
  });

  /* ================= FILTER ================= */

  const filteredTags = useMemo(() => {
    return tags.filter((t) =>
      t.tag_code?.toLowerCase().includes(filters.tag_code.toLowerCase())
    );
  }, [tags, filters]);

  const getPlantName = (id) =>
    plants.find((p) => p.plant_id === id)?.plant_name || id;

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
    const payload = {
      ...formData,
      bit_index: Number(formData.bit_index) || 0,
      data_length: Number(formData.data_length) || 1,
      is_active: formData.is_active,
    };

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
          <h4 className="fw-bold mb-1">PLC Tag Master</h4>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Filter Tag Code"
              style={{ width: 180 }}
              value={filters.tag_code}
              onChange={(e) =>
                setFilters({ ...filters, tag_code: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() => setFilters({ tag_code: "" })}
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
            <tr className="text-muted">
              <th>Sr</th>
              <th>Plant</th>
              <th>Tag Code</th>
              <th>Data Type</th>
              <th>Address</th>
              <th>Bit</th>
              <th>Active</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map((row, i) => (
              <tr key={row.tag_id}>
                <td>{i + 1}</td>
                <td>{getPlantName(row.plant_id)}</td>
                <td>{row.tag_code}</td>
                <td>{row.data_type}</td>
                <td>{row.address}</td>
                <td>{row.bit_index}</td>
                <td>
                  <span
                    className={`badge ${
                      row.is_active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
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
                    onClick={() => handleDelete(row.tag_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredTags.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={modalStyle}>
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit PLC Tag" : "Add PLC Tag"}
            </h5>

            <select
              className="form-control mb-2"
              value={formData.plant_id}
              onChange={(e) =>
                setFormData({ ...formData, plant_id: e.target.value })
              }
            >
              <option value="">Select Plant</option>
              {plants.map((p) => (
                <option key={p.plant_id} value={p.plant_id}>
                  {p.plant_name}
                </option>
              ))}
            </select>

            {[
              "tag_code",
              "description",
              "data_type",
              "address",
              "bit_index",
              "_scale",
              "off_set",
              "data_length",
            ].map((field) => (
              <input
                key={field}
                className="form-control mb-2"
                placeholder={field.replace(/_/g, " ")}
                value={formData[field] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
              />
            ))}

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
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
              <button
                className="btn btn-danger"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && viewData && (
        <div style={modalStyle}>
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">PLC Tag Details</h5>

            {Object.entries(viewData).map(([k, v]) => (
              <div
                key={k}
                className="d-flex justify-content-between mb-1"
              >
                <strong className="text-muted">{k}</strong>
                <span>{String(v)}</span>
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
