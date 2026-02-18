
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  route_step_id: "",
  recipe_name: "",
  is_active: true,
};

/* ================= API ================= */

const fetchRecipes = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/recipes`);
  return data;
};

const fetchRouteSteps = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/route-steps`);
  return data;
};

const RecipeMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    recipe_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH ================= */

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });

  const { data: routeSteps = [] } = useQuery({
    queryKey: ["routeSteps"],
    queryFn: fetchRouteSteps,
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: (newData) =>
      axios.post(`${API_BASE_URL}/api/recipes`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries(["recipes"]);
      setShowModal(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Insert failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      axios.put(
        `${API_BASE_URL}/api/recipes/${updatedData.recipe_id}`,
        updatedData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["recipes"]);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${API_BASE_URL}/api/recipes/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries(["recipes"]),
  });

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    return recipes.filter((row) =>
      filters.recipe_name
        ? row.recipe_name
            ?.toLowerCase()
            .includes(filters.recipe_name.toLowerCase())
        : true
    );
  }, [recipes, filters]);

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
    if (!window.confirm("Delete this recipe?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.route_step_id) {
      alert("Route Step is required");
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
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
          <h4 className="fw-bold mb-1">Recipe Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Recipe Name"
              style={{ width: 180 }}
              value={filters.recipe_name}
              onChange={(e) =>
                setFilters({ recipe_name: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ recipe_name: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Recipe
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
              <th>Route Step</th>
              <th>Recipe Name</th>
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
                <tr key={row.recipe_id}>
                  <td>{i + 1}</td>
                  <td>{row.route_step_id}</td>
                  <td>{row.recipe_name}</td>
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
                        handleDelete(row.recipe_id)
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
                  No recipes found
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
              {isEditing ? "Edit Recipe" : "Add Recipe"}
            </h5>

            {/* ROUTE STEP DROPDOWN */}
            <div className="mb-2">
              <label className="form-label">Route Step</label>
              <select
                className="form-control"
                value={formData.route_step_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    route_step_id: e.target.value,
                  })
                }
                disabled={isEditing} // prevent changing because UNIQUE constraint
              >
                <option value="">Select Route Step</option>
                {routeSteps.map((step) => (
                  <option
                    key={step.route_step_id}
                    value={step.route_step_id}
                  >
                    {step.route_step_id}
                  </option>
                ))}
              </select>
            </div>

            {/* RECIPE NAME */}
            <div className="mb-2">
              <label className="form-label">Recipe Name</label>
              <input
                className="form-control"
                value={formData.recipe_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recipe_name: e.target.value,
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

export default RecipeMaster;
