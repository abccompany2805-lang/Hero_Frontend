

import { useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  recipe_id: "",
  enforce_all_parts: true,
  allow_manual_entry: false,
  allow_supervisor_override: false,
};

const RecipePartScanMaster = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= FETCH ================= */

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["recipePartScan"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/recipe-partscan`
      );
      return data;
    },
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/recipes`
      );
      return data;
    },
  });

  /* ================= USED RECIPE IDS ================= */
  const usedRecipeIds = useMemo(() => {
    return records.map((r) => r.recipe_id);
  }, [records]);

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: (newData) =>
      axios.post(
        `${API_BASE_URL}/api/recipe-partscan`,
        newData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["recipePartScan"]);
      setShowModal(false);
      setErrorMessage("");
    },
    onError: (err) => {
      setErrorMessage(
        err.response?.data?.message ||
          "Configuration already exists for this recipe"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      axios.put(
        `${API_BASE_URL}/api/recipe-partscan/${updatedData.recipe_id}`,
        updatedData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["recipePartScan"]);
      setShowModal(false);
      setErrorMessage("");
    },
    onError: (err) => {
      setErrorMessage(
        err.response?.data?.message || "Update failed"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(
        `${API_BASE_URL}/api/recipe-partscan/${id}`
      ),
    onSuccess: () =>
      queryClient.invalidateQueries(["recipePartScan"]),
  });

  /* ================= HANDLERS ================= */

  const handleAdd = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowModal(true);
    setErrorMessage("");
  };

  const handleEdit = (row) => {
    setFormData(row);
    setIsEditing(true);
    setShowModal(true);
    setErrorMessage("");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this configuration?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.recipe_id) {
      setErrorMessage("Recipe is required");
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const getRecipeName = (id) => {
  const recipe = recipes.find((r) => r.recipe_id === id);
  return recipe ? recipe.recipe_name : "-";
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
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-1">
            Recipe PartScan Configuration
          </h4>

          <button
            className="btn btn-danger btn-sm"
            onClick={handleAdd}
          >
            <Plus size={14} /> Add Configuration
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Recipe</th>
              <th>Enforce All</th>
              <th>Manual Entry</th>
              <th>Supervisor Override</th>
              <th>Created</th>
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
              records.map((row, i) => (
                <tr key={row.recipe_id}>
                  <td>{i + 1}</td>
                  <td>{getRecipeName(row.recipe_id)}</td>

                  <td>
                    {row.enforce_all_parts ? "Yes" : "No"}
                  </td>
                  <td>
                    {row.allow_manual_entry ? "Yes" : "No"}
                  </td>
                  <td>
                    {row.allow_supervisor_override
                      ? "Yes"
                      : "No"}
                  </td>
                  <td>
                    {new Date(
                      row.created_at
                    ).toLocaleString()}
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

            {!isLoading && records.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No configuration found
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
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1050,
    }}
  >
    <div
      className="bg-white rounded-4 shadow p-4"
      style={{ width: 500 }}
    >
      <h5 className="mb-4">
        {isEditing ? "Edit Configuration" : "Add Configuration"}
      </h5>

      {errorMessage && (
        <div className="alert alert-danger py-2">
          {errorMessage}
        </div>
      )}

      {/* Recipe Selection */}
      <div className="mb-4">
        <label
          className="form-label text-secondary"
          style={{ fontWeight: 400 }}
        >
          Recipe
        </label>
        <select
          className="form-select"
          value={formData.recipe_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              recipe_id: e.target.value,
            })
          }
          disabled={isEditing}
        >
          <option value="">Select Recipe</option>
          {recipes.map((r) => (
            <option
              key={r.recipe_id}
              value={r.recipe_id}
              disabled={
                !isEditing &&
                usedRecipeIds.includes(r.recipe_id)
              }
            >
              {r.recipe_name || r.recipe_id}
            </option>
          ))}
        </select>
      </div>

      {/* Configuration Options */}
      <div className="mb-2">
        <label
          className="form-label text-secondary"
          style={{ fontWeight: 400 }}
        >
          Configuration Settings
        </label>
      </div>

      {[
        {
          key: "enforce_all_parts",
          label: "Enforce All Parts",
        },
        {
          key: "allow_manual_entry",
          label: "Allow Manual Entry",
        },
        {
          key: "allow_supervisor_override",
          label: "Allow Supervisor Override",
        },
      ].map((item) => (
        <div className="form-check mb-2" key={item.key}>
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData[item.key]}
            onChange={(e) =>
              setFormData({
                ...formData,
                [item.key]: e.target.checked,
              })
            }
          />
          <label
            className="form-check-label text-secondary"
            style={{ fontWeight: 400 }}
          >
            {item.label}
          </label>
        </div>
      ))}

      {/* Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4">
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

export default RecipePartScanMaster;
