import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const RECIPE_API = `${API_BASE_URL}/api/recipemaster`;
const ROUTE_STEP_API = `${API_BASE_URL}/api/routestepmaster`;
const TOOL_API = `${API_BASE_URL}/api/toolmaster`;

const emptyForm = {
  route_step_id: "",
  tool_id: "",
  tool_program: "",
  set: "",
  tightening_count: "",
  mandatory: false,
};

const RecipeMaster = () => {
  const [recipes, setRecipes] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [tools, setTools] = useState([]);

  const [filters, setFilters] = useState({
    route_step_id: "",
    tool_id: "",
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
    const [r, rs, t] = await Promise.all([
      axios.get(RECIPE_API),
      axios.get(ROUTE_STEP_API),
      axios.get(TOOL_API),
    ]);
    setRecipes(r.data);
    setRouteSteps(rs.data);
    setTools(t.data);
  };

  // ================= FILTER =================
  const filteredRecipes = useMemo(() => {
    return recipes.filter(
      (r) =>
        String(r.route_step_id).includes(filters.route_step_id) &&
        String(r.tool_id).includes(filters.tool_id)
    );
  }, [recipes, filters]);

  // ================= HELPERS =================
  const getRouteStepLabel = (id) => {
    const rs = routeSteps.find((r) => r.route_step_id === id);
    if (!rs) return id;
    return `Stage ${rs.stage_id} → Process ${rs.process_id}`;
  };

  const getToolName = (id) =>
    tools.find((t) => t.tool_id === id)?.tool_code || id;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      recipe_id: row.recipe_id,
      route_step_id: String(row.route_step_id),
      tool_id: String(row.tool_id),
      tool_program: row.tool_program || "",
      set: row.set || "",
      tightening_count: row.tightening_count || "",
      mandatory: row.mandatory,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.route_step_id || !formData.tool_id) {
      alert("Route Step and Tool are required");
      return;
    }

    const payload = {
      route_step_id: Number(formData.route_step_id),
      tool_id: Number(formData.tool_id),
      tool_program: formData.tool_program
        ? Number(formData.tool_program)
        : null,
      set: formData.set,
      tightening_count: formData.tightening_count
        ? Number(formData.tightening_count)
        : null,
      mandatory: formData.mandatory,
    };

    if (isEditing) {
      await axios.put(
        `${RECIPE_API}/${formData.recipe_id}`,
        payload
      );
    } else {
      await axios.post(RECIPE_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this recipe?")) {
      await axios.delete(`${RECIPE_API}/${id}`);
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
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1">Recipe Master</h4>
          </div>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Route Step ID"
              style={{ width: 140 }}
              value={filters.route_step_id}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  route_step_id: e.target.value,
                })
              }
            />

            <input
              className="form-control"
              placeholder="Tool ID"
              style={{ width: 120 }}
              value={filters.tool_id}
              onChange={(e) =>
                setFilters({ ...filters, tool_id: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ route_step_id: "", tool_id: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={handleAdd}
            >
              <Plus size={14} /> Add Recipe
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
              <th>Route Step</th>
              <th>Tool</th>
              <th>Program</th>
              <th>Set</th>
              <th>Tightening</th>
              <th>Mandatory</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map((r, i) => (
              <tr key={r.recipe_id}>
                <td>{i + 1}</td>
                <td>{getRouteStepLabel(r.route_step_id)}</td>
                <td>{getToolName(r.tool_id)}</td>
                <td>{r.tool_program}</td>
                <td>{r.set}</td>
                <td>{r.tightening_count}</td>
                <td>
                  <span
                    className={`badge ${
                      r.mandatory
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {r.mandatory ? "Yes" : "No"}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(r)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(r)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(r.recipe_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRecipes.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-muted py-4"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showModal && (
        <div className="modal-backdrop show">
          <div className="modal d-block">
            <div className="modal-dialog">
              <div className="modal-content p-3">
                <h5 className="mb-3">
                  {isEditing ? "Edit Recipe" : "Add Recipe"}
                </h5>

                <label className="form-label">Route Step</label>
                <select
                  className="form-control mb-2"
                  value={formData.route_step_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      route_step_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select Route Step</option>
                  {routeSteps.map((r) => (
                    <option
                      key={r.route_step_id}
                      value={r.route_step_id}
                    >
                      Stage {r.stage_id} → Process {r.process_id}
                    </option>
                  ))}
                </select>

                <label className="form-label">Tool</label>
                <select
                  className="form-control mb-2"
                  value={formData.tool_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tool_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select Tool</option>
                  {tools.map((t) => (
                    <option key={t.tool_id} value={t.tool_id}>
                      {t.tool_code}
                    </option>
                  ))}
                </select>

                <label className="form-label">Tool Program</label>
                <input
                  className="form-control mb-2"
                  value={formData.tool_program}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tool_program: e.target.value,
                    })
                  }
                />

                <label className="form-label">Set</label>
                <input
                  className="form-control mb-2"
                  value={formData.set}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      set: e.target.value,
                    })
                  }
                />

                <label className="form-label">
                  Tightening Count
                </label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={formData.tightening_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tightening_count: e.target.value,
                    })
                  }
                />

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.mandatory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mandatory: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label">
                    Mandatory
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
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}
      {showView && viewData && (
        <div className="modal-backdrop show">
          <div className="modal d-block">
            <div className="modal-dialog">
              <div className="modal-content p-3">
                <h5 className="mb-3">Recipe Details</h5>

                {[
                  [
                    "Route Step",
                    getRouteStepLabel(viewData.route_step_id),
                  ],
                  ["Tool", getToolName(viewData.tool_id)],
                  ["Program", viewData.tool_program],
                  ["Set", viewData.set],
                  ["Tightening", viewData.tightening_count],
                  [
                    "Mandatory",
                    viewData.mandatory ? "Yes" : "No",
                  ],
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
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeMaster;
