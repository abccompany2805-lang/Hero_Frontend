import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const emptyForm = {
  plant_code: "",
  plant_name: "",
  timezone: "",
  is_active: true,
};

const PlantMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    plant_code: "",
    plant_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [errors, setErrors] = useState({});

  /* =====================================================
     REACT QUERY : FETCH PLANTS
  ===================================================== */
  const { data: allPlants = [], isLoading } = useQuery({
    queryKey: ["plants"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/plants`);
      return res.data || [];
    },
  });

  /* =====================================================
     FILTER
  ===================================================== */
  const filteredPlants = useMemo(() => {
    return allPlants.filter(
      (p) =>
        p.plant_code?.includes(filters.plant_code) &&
        p.plant_name
          ?.toLowerCase()
          .includes(filters.plant_name.toLowerCase())
    );
  }, [allPlants, filters]);

  /* =====================================================
     SAVE MUTATION
  ===================================================== */
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return axios.put(
          `${API_BASE_URL}/api/plants/${data.plant_id}`,
          data
        );
      } else {
        return axios.post(`${API_BASE_URL}/api/plants`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["plants"]);
      setShowModal(false);
    },
    onError: (err) => {
      console.error("Save failed", err);
      alert("Failed to save plant");
    },
  });


  const validateForm = () => {
  const newErrors = {};

  if (!formData.plant_code.trim()) {
    newErrors.plant_code = "Plant Code is required";
  }

  if (!formData.plant_name.trim()) {
    newErrors.plant_name = "Plant Name is required";
  }

  if (!formData.timezone.trim()) {
    newErrors.timezone = "Time Zone is required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};



const handleSave = () => {
  if (!validateForm()) return;

  saveMutation.mutate(formData);
};

  /* =====================================================
     DELETE MUTATION
  ===================================================== */
  const deleteMutation = useMutation({
    mutationFn: (plant_id) =>
      axios.delete(`${API_BASE_URL}/api/plants/${plant_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["plants"]);
    },
    onError: (err) => {
      console.error("Delete failed", err);
      alert("Failed to delete plant");
    },
  });

  const handleDelete = (plant_id) => {
    if (!window.confirm("Delete this plant?")) return;
    deleteMutation.mutate(plant_id);
  };

  /* =====================================================
     HANDLERS
  ===================================================== */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData(row);
    setShowModal(true);
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

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
            <h4 className="fw-bold mb-1">Plant Master</h4>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Plant Code"
              style={{ width: 160 }}
              value={filters.plant_code}
              onChange={(e) =>
                setFilters({ ...filters, plant_code: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Plant Name"
              style={{ width: 180 }}
              value={filters.plant_name}
              onChange={(e) =>
                setFilters({ ...filters, plant_name: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({
                  plant_code: "",
                  plant_name: "",
                })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Plant
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
              <th>Plant Code</th>
              <th>Plant Name</th>
              <th>Time Zone</th>
              <th>Status</th>
              <th>Created At</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredPlants.map((row, i) => (
                <tr key={row.plant_id}>
                  <td>{i + 1}</td>
                  <td>{row.plant_code}</td>
                  <td>{row.plant_name}</td>
                  <td>{row.timezone}</td>
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
                      onClick={() => handleDelete(row.plant_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

            {!isLoading && filteredPlants.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


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
        <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
          <h5 className="mb-3">
            {isEditing ? "Edit Plant" : "Add Plant"}
          </h5>

{[
  { k: "plant_code", l: "Plant Code" },
  { k: "plant_name", l: "Plant Name" },
  { k: "timezone", l: "Time Zone" },
].map(({ k, l }) => (
  <div className="mb-3" key={k}>
    <label className="form-label fw-semibold text-muted">{l}</label>
    <input
      className={`form-control ${errors[k] ? "is-invalid" : ""}`}
      value={formData[k]}
      onChange={(e) => {
        setFormData({ ...formData, [k]: e.target.value });
        setErrors({ ...errors, [k]: "" });
      }}
    />
    {errors[k] && (
      <div className="invalid-feedback">
        {errors[k]}
      </div>
    )}
  </div>
))}
<div className="form-check mt-2">
  <input
    className="form-check-input"
    type="checkbox"
    checked={formData.is_active}
    onChange={(e) =>
      setFormData({ ...formData, is_active: e.target.checked })
    }
  />
  <label className="form-check-label">
    Active
  </label>
</div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
  className="btn btn-danger"
  onClick={handleSave}
  disabled={saveMutation.isPending}
>
  {saveMutation.isPending ? "Saving..." : "Save"}
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
      background: "rgba(15, 23, 42, 0.45)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1050,
    }}
  >
    <div
      style={{
        width: 480,
        borderRadius: 16,
        background: "#ffffff",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        overflow: "hidden",
        animation: "fadeInScale 0.2s ease-out",
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          padding: "16px 20px",
          background: "#f8fafc",
          borderBottom: "3px solid #f32c1e",
        }}
      >
        <h5
          style={{
            margin: 0,
            fontWeight: 600,
            color: "#1e293b",
            letterSpacing: "0.3px",
          }}
        >
          Plant Details
        </h5>
      </div>

      {/* ===== BODY ===== */}
      <div style={{ padding: "20px" }}>
        <div className="d-flex flex-column gap-3">
          {Object.entries(viewData)
            .filter(([k]) => k !== "plant_id")
            .map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {k.replace(/_/g, " ")}
                </span>

                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#0f172a",
                  }}
                >
                  {k === "is_active" ? (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor: v ? "#dcfce7" : "#fee2e2",
                        color: v ? "#166534" : "#991b1b",
                      }}
                    >
                      {v ? "Active" : "Inactive"}
                    </span>
                  ) : (
                    v ?? "-"
                  )}
                </span>
              </div>
            ))}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="text-end mt-4">
          <button
            className="btn btn-outline-secondary btn-sm px-4"
            onClick={() => setShowView(false)}
            style={{
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>

    {/* Animation */}
    <style>
      {`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}
    </style>
  </div>
)}
    </div>
  );
};

export default PlantMaster;
