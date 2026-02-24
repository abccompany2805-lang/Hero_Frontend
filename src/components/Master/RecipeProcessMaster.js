import { useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../../config";

const RECIPE_API = `${API_BASE_URL}/api/recipe-process`;
const TOOL_API = `${API_BASE_URL}/api/tools`;
const PROGRAM_API = `${API_BASE_URL}/api/tool-programs`;
const RECIPE_MASTER_API = `${API_BASE_URL}/api/recipes`;


const emptyForm = {
   recipe_id: "",
  tool_id: "",
  program_id: "",
  set_torque: "",
  set_angle: "",
  set_pressure: "",
  set_leak_limit: "",
  lsl: "",
  usl: "",
  unit: "",
  tightening_cnt: "",
};

const RecipeProcessMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    tool_code: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await axios.get(RECIPE_API);
      return res.data || [];
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const res = await axios.get(TOOL_API);
      return res.data || [];
    },
  });

  const { data: recipeMasters = [] } = useQuery({
  queryKey: ["recipeMasters"],
  queryFn: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/recipes`);
    return res.data || [];
  },
});

  const { data: programs = [] } = useQuery({
    queryKey: ["tool-programs"],
    queryFn: async () => {
      const res = await axios.get(PROGRAM_API);
      return res.data || [];
    },
  });
  const getToolCode = (id) =>
    tools.find((t) => t.tool_id === id)?.tool_code || id;
  /* ================= FILTER ================= */

const filteredRecipes = useMemo(() => {
  return recipes.filter((r) => {
    const toolCodeRaw = getToolCode(r.tool_id) || "";
    const toolCode = toolCodeRaw.toString().toLowerCase();

    return toolCode.includes(
      (filters.tool_code || "").toLowerCase()
    );
  });
}, [recipes, filters, tools]);


  /* ================= HELPERS ================= */

  const getProgramName = (id) => {
    const program = programs.find((p) => p.program_id === id);
    if (!program) return id;
    return `${program.program_no} - ${program.program_name}`;
  };

  const getRecipeName = (id) => {
  const recipe = recipeMasters.find((r) => r.recipe_id === id);
  return recipe ? recipe.recipe_name : id;
};


  /* ================= MUTATIONS ================= */

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return axios.put(
          `${RECIPE_API}/${formData.recipe_id}`,
          payload
        );
      }
      return axios.post(RECIPE_API, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${RECIPE_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
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
      recipe_id: formData.recipe_id, // 🔥 ADD THIS
      tool_id: formData.tool_id,
      program_id: formData.program_id,
      set_torque: formData.set_torque || null,
      set_angle: formData.set_angle || null,
      set_pressure: formData.set_pressure || null,
      set_leak_limit: formData.set_leak_limit || null,
      lsl: formData.lsl || null,
      usl: formData.usl || null,
      unit: formData.unit,
      tightening_cnt: Number(formData.tightening_cnt) || 0,
    };

    saveMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    deleteMutation.mutate(id);
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-3">

      {/* ================= HEADER ================= */}
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
          <h4 className="fw-bold mb-1">Recipe Process Master</h4>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Filter Tool"
              style={{ width: 150 }}
              value={filters.tool_code}
              onChange={(e) =>
                  setFilters({ ...filters, tool_code: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() => setFilters({ tool_code: "" })}
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

      {/* ================= TABLE ================= */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr className="text-muted">
              <th>Sr</th>
              <th>Recipe</th>
              <th>Tool</th>
              <th>Program</th>
              <th>Torque</th>
              <th>Pressure</th>
              <th>Leak Limit</th>
              <th>Unit</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map((row, i) => (
              <tr key={row.recipe_code}>
                <td>{i + 1}</td>
                <td>{getRecipeName(row.recipe_id)}</td>

                <td>{getToolCode(row.tool_id)}</td>
                <td>{getProgramName(row.program_id)}</td>
                <td>{row.set_torque}</td>
                <td>{row.set_pressure}</td>
                <td>{row.set_leak_limit}</td>
                <td>{row.unit}</td>
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
                    onClick={() =>
                      handleDelete(row.recipe_id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRecipes.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
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
      style={{
        width: 600,
        maxHeight: "85vh",
        overflowY: "auto",
      }}
    >
      <h5 className="mb-4">
        {isEditing ? "Edit Recipe" : "Add Recipe"}
      </h5>

      {/* ================= BASIC SELECTIONS ================= */}

      <div className="mb-3">
        <label className="form-label text-secondary" style={{ fontWeight: 400 }}>
          Recipe
        </label>
        <select
          className="form-select"
          value={formData.recipe_id}
          onChange={(e) =>
            setFormData({ ...formData, recipe_id: e.target.value })
          }
        >
          <option value="">Select Recipe</option>
          {recipeMasters.map((r) => (
            <option key={r.recipe_id} value={r.recipe_id}>
              {r.recipe_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label text-secondary" style={{ fontWeight: 400 }}>
          Tool
        </label>
        <select
          className="form-select"
          value={formData.tool_id}
          onChange={(e) =>
            setFormData({ ...formData, tool_id: e.target.value })
          }
        >
          <option value="">Select Tool</option>
          {tools.map((t) => (
            <option key={t.tool_id} value={t.tool_id}>
              {t.tool_code}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label text-secondary" style={{ fontWeight: 400 }}>
          Program
        </label>
        <select
          className="form-select"
          value={formData.program_id}
          onChange={(e) =>
            setFormData({ ...formData, program_id: e.target.value })
          }
        >
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.program_id} value={p.program_id}>
              {p.program_no} - {p.program_name}
            </option>
          ))}
        </select>
      </div>

      {/* ================= PARAMETERS (2 COLUMN GRID) ================= */}

      <div className="row">
        {[
          "set_torque",
          "set_angle",
          "set_pressure",
          "set_leak_limit",
          "lsl",
          "usl",
          "unit",
          "tightening_cnt",
        ].map((field) => (
          <div className="col-md-6 mb-3" key={field}>
            <label
              className="form-label text-secondary"
              style={{ fontWeight: 400, fontSize: "14px" }}
            >
              {field.replace(/_/g, " ").toUpperCase()}
            </label>
            <input
              className="form-control form-control-sm"
              placeholder={`Enter ${field.replace(/_/g, " ")}`}
              value={formData[field] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field]: e.target.value,
                })
              }
            />
          </div>
        ))}
      </div>

      {/* ================= BUTTONS ================= */}

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

      {/* ================= VIEW MODAL ================= */}
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
    <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
      <h5 className="mb-3">Recipe Details</h5>

      <div className="d-flex flex-column gap-2">
      <div className="d-flex justify-content-between">
  <strong className="text-muted">Recipe</strong>
  <span>{getRecipeName(viewData.recipe_id)}</span>
</div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Tool</strong>
          <span>{getToolCode(viewData.tool_id)}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Program</strong>
          <span>{getProgramName(viewData.program_id)}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Set Torque</strong>
          <span>{viewData.set_torque || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Set Angle</strong>
          <span>{viewData.set_angle || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Set Pressure</strong>
          <span>{viewData.set_pressure || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Set Leak Limit</strong>
          <span>{viewData.set_leak_limit || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">LSL</strong>
          <span>{viewData.lsl || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">USL</strong>
          <span>{viewData.usl || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Unit</strong>
          <span>{viewData.unit || "-"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Tightening Count</strong>
          <span>{viewData.tightening_cnt || "-"}</span>
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

export default RecipeProcessMaster;
