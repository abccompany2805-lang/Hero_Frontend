
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  model_id: "",
  route_version: "",
  is_active: true,
};

/* ================= API ================= */

const fetchRoutes = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/routes`);
  return data;
};

const fetchModels = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/models`);
  return data;
};

const RouteMaster = () => {
  const queryClient = useQueryClient();

 const [filters, setFilters] = useState({
  route_version: "",
  model_id: "",
});


  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH ================= */

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });

  const { data: models = [] } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: (newData) =>
      axios.post(`${API_BASE_URL}/api/routes`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries(["routes"]);
      setShowModal(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Insert failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      axios.put(
        `${API_BASE_URL}/api/routes/${updatedData.route_id}`,
        updatedData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["routes"]);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${API_BASE_URL}/api/routes/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries(["routes"]),
  });

  /* ================= FILTER ================= */
const filteredData = useMemo(() => {
  return routes.filter((row) => {
    const versionMatch = filters.route_version
      ? String(row.route_version).includes(filters.route_version)
      : true;

    const modelMatch = filters.model_id
      ? row.model_id === filters.model_id
      : true;

    return versionMatch && modelMatch;
  });
}, [routes, filters]);


  /* ================= HANDLERS ================= */

  const handleAdd = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setFormData(row);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this route?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.model_id) {
      alert("Model is required");
      return;
    }

    if (!formData.route_version) {
      alert("Route Version is required");
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate({
        ...formData,
        route_version: Number(formData.route_version),
      });
    }
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
          <h4 className="fw-bold mb-1">Route Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <select
  className="form-control"
  style={{ width: 180 }}
  value={filters.model_id}
  onChange={(e) =>
    setFilters({ ...filters, model_id: e.target.value })
  }
>
  <option value="">All Models</option>
  {models.map((model) => (
    <option key={model.model_id} value={model.model_id}>
      {model.model_name}
    </option>
  ))}
</select>

            <input
              className="form-control"
              placeholder="Route Version"
              style={{ width: 160 }}
              value={filters.route_version}
              onChange={(e) =>
                setFilters({ route_version: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ route_version: "", model_id: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Route
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
              <th>Model</th>
              <th>Version</th>
              <th>Status</th>
              <th>Created</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredData.map((row, i) => (
                <tr key={row.route_id}>
                  <td>{i + 1}</td>
                  <td>
  {
    models.find(m => m.model_id === row.model_id)?.model_name || "-"
  }
</td>

                  <td>{row.route_version}</td>
                  <td>
                    {row.is_active ? (
                      <span className="badge bg-success">
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-secondary">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => handleEdit(row)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        handleDelete(row.route_id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

            {!isLoading && filteredData.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No routes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
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
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{ width: 450 }}
          >
            <h5 className="mb-3">
              {isEditing ? "Edit Route" : "Add Route"}
            </h5>

            {/* MODEL DROPDOWN */}
            <div className="mb-2">
              <label className="form-label">Model</label>
              <select
                className="form-control"
                value={formData.model_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    model_id: e.target.value,
                  })
                }
                disabled={isEditing}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option
                    key={model.model_id}
                    value={model.model_id}
                  >
                    {model.model_name || model.model_id}
                  </option>
                ))}
              </select>
            </div>

            {/* VERSION */}
            <div className="mb-2">
              <label className="form-label">Route Version</label>
              <input
                type="number"
                className="form-control"
                value={formData.route_version}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    route_version: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.checked,
                  })
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
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMaster;
