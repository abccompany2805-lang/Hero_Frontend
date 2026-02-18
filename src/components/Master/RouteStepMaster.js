import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../../config";

const ROUTE_STEP_API = `${API_BASE_URL}/api/route-steps`;
const ROUTES_API = `${API_BASE_URL}/api/routes`;
const MODELS_API = `${API_BASE_URL}/api/models`;
const STAGE_API = `${API_BASE_URL}/api/stages`;
const OP_API = `${API_BASE_URL}/api/operations`;

const emptyForm = {
  model_id: "",
  route_version: "",
  route_id: "",
  stage_id: "",
  operation_id: "",
  seq_no: "",
  mandatory: true,
  allow_bypass: false,
  allow_repeat: true,
  max_retries: 0,
};

const RouteStepMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    stage_name: "",
    operation_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */

  const { data: routeSteps = [] } = useQuery({
    queryKey: ["route-steps"],
    queryFn: async () => {
      const res = await axios.get(ROUTE_STEP_API);
      return res.data || [];
    },
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await axios.get(ROUTES_API);
      return res.data || [];
    },
  });

  const { data: models = [] } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await axios.get(MODELS_API);
      return res.data || [];
    },
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const res = await axios.get(STAGE_API);
      return res.data || [];
    },
  });

  const { data: operations = [] } = useQuery({
    queryKey: ["operations"],
    queryFn: async () => {
      const res = await axios.get(OP_API);
      return res.data || [];
    },
  });

  /* ================= HELPERS ================= */

  const getStageName = (id) =>
    stages.find((s) => s.stage_id === id)?.stage_name || "-";

  const getOperationName = (id) =>
    operations.find((o) => o.operation_id === id)?.operation_name || "-";

  const getRoute = (route_id) =>
    routes.find((r) => r.route_id === route_id);

  const getModelName = (model_id) =>
    models.find((m) => m.model_id === model_id)?.model_name || "-";

  /* ================= FILTER ================= */

  const filteredRouteSteps = useMemo(() => {
    return routeSteps.filter((r) => {
      const stageName = getStageName(r.stage_id);
      const operationName = getOperationName(r.operation_id);

      const stageMatch = filters.stage_name
        ? stageName
            .toLowerCase()
            .includes(filters.stage_name.toLowerCase())
        : true;

      const operationMatch = filters.operation_name
        ? operationName
            .toLowerCase()
            .includes(filters.operation_name.toLowerCase())
        : true;

      return stageMatch && operationMatch;
    });
  }, [routeSteps, filters, stages, operations]);

  /* ================= VERSION FILTER BASED ON MODEL ================= */

  const versionsForModel = useMemo(() => {
    if (!formData.model_id) return [];
    return routes.filter((r) => r.model_id === formData.model_id);
  }, [formData.model_id, routes]);

  /* ================= AUTO SET ROUTE ID ================= */

  useEffect(() => {
    if (formData.model_id && formData.route_version) {
      const selectedRoute = routes.find(
        (r) =>
          r.model_id === formData.model_id &&
          Number(r.route_version) ===
            Number(formData.route_version)
      );

      if (selectedRoute) {
        setFormData((prev) => ({
          ...prev,
          route_id: selectedRoute.route_id,
        }));
      }
    }
  }, [formData.model_id, formData.route_version, routes]);

  /* ================= MUTATIONS ================= */

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return axios.put(
          `${ROUTE_STEP_API}/${formData.route_step_id}`,
          payload
        );
      }
      return axios.post(ROUTE_STEP_API, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["route-steps"],
      });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${ROUTE_STEP_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["route-steps"],
      });
    },
  });

  /* ================= CRUD ================= */

  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    const route = getRoute(row.route_id);

    setIsEditing(true);
    setFormData({
      route_step_id: row.route_step_id,
      model_id: route?.model_id || "",
      route_version: route?.route_version || "",
      route_id: row.route_id,
      stage_id: row.stage_id || "",
      operation_id: row.operation_id || "",
      seq_no: row.seq_no ?? "",
      mandatory: !!row.mandatory,
      allow_bypass: !!row.allow_bypass,
      allow_repeat: !!row.allow_repeat,
      max_retries: row.max_retries ?? 0,
    });

    setShowModal(true);
  };

  const handleSave = () => {
    const payload = {
      route_id: formData.route_id,
      stage_id: formData.stage_id,
      operation_id: formData.operation_id,
      seq_no: Number(formData.seq_no),
      mandatory: !!formData.mandatory,
      allow_bypass: !!formData.allow_bypass,
      allow_repeat: !!formData.allow_repeat,
      max_retries: Number(formData.max_retries),
    };

    saveMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this route step?")) return;
    deleteMutation.mutate(id);
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  return (
    <div className="container-fluid py-3">
      {/* HEADER */}
      <div className="card shadow-sm rounded-4 mb-2 mx-2"
                style={{
          borderLeft: "5px solid #dc3545",
          borderTop: 0,
          borderRight: 0,
          borderBottom: 0,
        }}>
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h4 className="fw-bold mb-1">
            Route Step Master
          </h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">

            <input
              className="form-control"
              placeholder="Stage Name"
              style={{ width: 160 }}
              value={filters.stage_name}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  stage_name: e.target.value,
                })
              }
            />

            <input
              className="form-control"
              placeholder="Operation Name"
              style={{ width: 160 }}
              value={filters.operation_name}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  operation_name: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({
                  stage_name: "",
                  operation_name: "",
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
              Add Route Step
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
              <th>Stage</th>
              <th>Operation</th>
              <th>Seq</th>
              <th>Mandatory</th>
              <th>Bypass</th>
              <th>Repeat</th>
              <th>Max Retries</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRouteSteps.map((row, i) => {
              const route = getRoute(row.route_id);
              return (
                <tr key={row.route_step_id}>
                  <td>{i + 1}</td>
                  <td>
                    {getModelName(route?.model_id)}
                  </td>
                  <td>
                    {route?.route_version || "-"}
                  </td>
                  <td>{getStageName(row.stage_id)}</td>
                  <td>
                    {getOperationName(row.operation_id)}
                  </td>
                  <td>{row.seq_no}</td>
                  <td>
                    {row.mandatory ? "Yes" : "No"}
                  </td>
                  <td>
                    {row.allow_bypass ? "Yes" : "No"}
                  </td>
                  <td>
                    {row.allow_repeat ? "Yes" : "No"}
                  </td>
                  <td>{row.max_retries ?? 0}</td>
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
                        handleDelete(row.route_step_id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL CODE REMAINS SAME BUT WITH MODEL + VERSION DROPDOWN */}

    {showModal && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
  }}>
    <div className="bg-white rounded-4 shadow p-4"
      style={{ width: 520 }}>
      <h5 className="mb-3">
        {isEditing ? "Edit Route Step" : "Add Route Step"}
      </h5>

      {/* MODEL */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Model
        </label>
        <select
          className="form-control"
          value={formData.model_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              model_id: e.target.value,
              route_version: "",
              route_id: "",
            })
          }
          disabled={isEditing}
        >
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.model_id}
              value={m.model_id}>
              {m.model_name}
            </option>
          ))}
        </select>
      </div>

      {/* VERSION */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Route Version
        </label>
        <select
          className="form-control"
          value={formData.route_version}
          onChange={(e) =>
            setFormData({
              ...formData,
              route_version: e.target.value,
            })
          }
          disabled={!formData.model_id}
        >
          <option value="">Select Version</option>
          {versionsForModel.map((r) => (
            <option key={r.route_id}
              value={r.route_version}>
              Version {r.route_version}
            </option>
          ))}
        </select>
      </div>

      {/* STAGE */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Stage
        </label>
        <select
          className="form-control"
          value={formData.stage_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              stage_id: e.target.value,
            })
          }
        >
          <option value="">Select Stage</option>
          {stages.map((s) => (
            <option key={s.stage_id}
              value={s.stage_id}>
              {s.stage_name}
            </option>
          ))}
        </select>
      </div>

      {/* OPERATION */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Operation
        </label>
        <select
          className="form-control"
          value={formData.operation_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              operation_id: e.target.value,
            })
          }
        >
          <option value="">Select Operation</option>
          {operations.map((o) => (
            <option key={o.operation_id}
              value={o.operation_id}>
              {o.operation_name}
            </option>
          ))}
        </select>
      </div>

      {/* SEQUENCE */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Sequence Number
        </label>
        <input
          type="number"
          className="form-control"
          value={formData.seq_no}
          onChange={(e) =>
            setFormData({
              ...formData,
              seq_no: e.target.value,
            })
          }
        />
      </div>

      {/* MAX RETRIES */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Max Retries
        </label>
        <input
          type="number"
          className="form-control"
          value={formData.max_retries}
          onChange={(e) =>
            setFormData({
              ...formData,
              max_retries: e.target.value,
            })
          }
        />
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal(false)}>
          Cancel
        </button>
        <button
          className="btn btn-danger"
          onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  </div>
)}

{showView && viewData && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
  }}>
    <div className="bg-white rounded-4 shadow p-4"
      style={{ width: 450 }}>
      <h5 className="mb-3">Route Step Details</h5>

      {(() => {
        const route = routes.find(
          r => r.route_id === viewData.route_id
        );
        const modelName = models.find(
          m => m.model_id === route?.model_id
        )?.model_name;

        return (
          <div className="d-flex flex-column gap-2">

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Model
              </strong>
              <span>{modelName || "-"}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Version
              </strong>
              <span>{route?.route_version || "-"}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Stage
              </strong>
              <span>{getStageName(viewData.stage_id)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Operation
              </strong>
              <span>{getOperationName(viewData.operation_id)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Sequence
              </strong>
              <span>{viewData.seq_no}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Mandatory
              </strong>
              <span>{viewData.mandatory ? "Yes" : "No"}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Allow Bypass
              </strong>
              <span>{viewData.allow_bypass ? "Yes" : "No"}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Allow Repeat
              </strong>
              <span>{viewData.allow_repeat ? "Yes" : "No"}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Max Retries
              </strong>
              <span>{viewData.max_retries ?? 0}</span>
            </div>

          </div>
        );
      })()}

      <div className="text-end mt-3">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowView(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default RouteStepMaster;
