import { useState, useMemo } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = `${API_BASE_URL}/api/models`;

const emptyForm = {
  model_name: "",
  model_code: "",
  family: "",
  is_active: true,
};

const ModelMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    model_name: "",
    model_code: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */
  const {
    data: allModels = [],
    isLoading,
  } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data;
    },
  });

  /* ================= FILTER ================= */
  const filteredModels = useMemo(() => {
    return allModels.filter(
      (m) =>
        m.model_name
          ?.toLowerCase()
          .includes(filters.model_name.toLowerCase()) &&
        m.model_code
          ?.toLowerCase()
          .includes(filters.model_code.toLowerCase())
    );
  }, [allModels, filters]);

  /* ================= SAVE ================= */
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return axios.put(`${API_URL}/${formData.model_id}`, payload);
      } else {
        return axios.post(API_URL, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["models"]);
      setShowModal(false);
    },
  });

  /* ================= DELETE ================= */
  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["models"]);
    },
  });

  /* ================= HANDLERS ================= */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      model_id: row.model_id,
      model_name: row.model_name,
      model_code: row.model_code,
      family: row.family || "",
      is_active: row.is_active,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this model?")) return;
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
          <h4 className="fw-bold mb-1">Model Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Model Name"
              style={{ width: 180 }}
              value={filters.model_name}
              onChange={(e) =>
                setFilters({ ...filters, model_name: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Model Code"
              style={{ width: 180 }}
              value={filters.model_code}
              onChange={(e) =>
                setFilters({ ...filters, model_code: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ model_name: "", model_code: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Model
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
              <th>Model Name</th>
              <th>Model Code</th>
              <th>Family</th>
              <th>Status</th>
              <th>Created At</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>

            {isLoading && (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredModels.map((row, i) => (
                <tr key={row.model_id}>
                  <td>{i + 1}</td>
                  <td>{row.model_name}</td>
                  <td>{row.model_code}</td>
                  <td>{row.family}</td>
                  <td>
                    <span
                      className={`badge ${
                        row.is_active ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {row.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : "-"}
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
                      onClick={() => handleDelete(row.model_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
     {showModal && (
  <div style={modalStyle}>
    <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
      <h5 className="mb-3">
        {isEditing ? "Edit Model" : "Add Model"}
      </h5>

      {/* ===== Model Name ===== */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Model Name
        </label>
        <input
          className="form-control"
          placeholder="Enter Model Name"
          value={formData.model_name}
          onChange={(e) =>
            setFormData({ ...formData, model_name: e.target.value })
          }
        />
      </div>

      {/* ===== Model Code ===== */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Model Code
        </label>
        <input
          className="form-control"
          placeholder="Enter Model Code"
          disabled={isEditing}
          value={formData.model_code}
          onChange={(e) =>
            setFormData({ ...formData, model_code: e.target.value })
          }
        />
      </div>

      {/* ===== Family ===== */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Family
        </label>
        <input
          className="form-control"
          placeholder="Enter Family"
          value={formData.family}
          onChange={(e) =>
            setFormData({ ...formData, family: e.target.value })
          }
        />
      </div>

      {/* ===== Active Checkbox ===== */}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
        />
        <label className="form-check-label fw-semibold">
          Active
        </label>
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
      <h5 className="mb-3">Model Details</h5>

      <div className="d-flex flex-column gap-2">

        <div className="d-flex justify-content-between align-items-start">
          <strong className="text-muted">Model Name</strong>
          <span className="text-end">{viewData.model_name ?? "-"}</span>
        </div>

        <div className="d-flex justify-content-between align-items-start">
          <strong className="text-muted">Model Code</strong>
          <span className="text-end">{viewData.model_code ?? "-"}</span>
        </div>

        <div className="d-flex justify-content-between align-items-start">
          <strong className="text-muted">Family</strong>
          <span className="text-end">{viewData.family ?? "-"}</span>
        </div>

        <div className="d-flex justify-content-between align-items-start">
          <strong className="text-muted">Status</strong>
          <span className="text-end">
            <span
              className={`badge ${
                viewData.is_active ? "bg-success" : "bg-danger"
              }`}
            >
              {viewData.is_active ? "Active" : "Inactive"}
            </span>
          </span>
        </div>

      </div>

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

export default ModelMaster;
