import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  route_step_id: "",
  part_id: "",
  qty_required: 1,
  scan_policy: "EACH_PART",
  mandatory: true,
};

/* ================= API ================= */

const fetchRequirements = async () => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/route-part-requirements`
  );
  return data;
};

const fetchRouteSteps = async () => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/route-steps`
  );
  return data;
};

const fetchParts = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/parts`);
  return data;
};

const RoutePartRequirementMaster = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH ================= */

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ["routePartRequirements"],
    queryFn: fetchRequirements,
  });

  const { data: routeSteps = [] } = useQuery({
    queryKey: ["routeSteps"],
    queryFn: fetchRouteSteps,
  });

  const { data: parts = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: fetchParts,
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: (newData) =>
      axios.post(
        `${API_BASE_URL}/api/route-part-requirements`,
        newData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["routePartRequirements"]);
      setShowModal(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Insert failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      axios.put(
        `${API_BASE_URL}/api/route-part-requirements/${updatedData.req_id}`,
        updatedData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["routePartRequirements"]);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(
        `${API_BASE_URL}/api/route-part-requirements/${id}`
      ),
    onSuccess: () =>
      queryClient.invalidateQueries(["routePartRequirements"]),
  });

  /* ================= HELPERS ================= */

  const getPartName = (id) => {
    const part = parts.find((p) => p.part_id === id);
    return part ? `${part.part_no} - ${part.part_name}` : "-";
  };

  const getRouteStepName = (id) => {
    const step = routeSteps.find((r) => r.route_step_id === id);
    if (!step) return id;

    return `SEQ ${step.seq_no} - Stage ${step.stage_id}`;
  };

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
    if (!window.confirm("Delete this requirement?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.route_step_id || !formData.part_id) {
      alert("Route Step and Part are required");
      return;
    }

    if (Number(formData.qty_required) < 1) {
      alert("Quantity must be >= 1");
      return;
    }

    const payload = {
      ...formData,
      qty_required: Number(formData.qty_required),
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
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
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-1">
            Route Part Requirement Master
          </h4>

          <button
            className="btn btn-danger btn-sm"
            onClick={handleAdd}
          >
            <Plus size={14} /> Add Requirement
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Route Step</th>
              <th>Part</th>
              <th>Qty</th>
              <th>Scan Policy</th>
              <th>Mandatory</th>
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
              requirements.map((row, i) => (
                <tr key={row.req_id}>
                  <td>{i + 1}</td>
                  <td>{getRouteStepName(row.route_step_id)}</td>
                  <td>{getPartName(row.part_id)}</td>
                  <td>{row.qty_required}</td>
                  <td>
                    {row.scan_policy === "EACH_PART"
                      ? "Each Part"
                      : "Batch Once"}
                  </td>
                  <td>
                    {row.mandatory ? "Yes" : "No"}
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
                        handleDelete(row.req_id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
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
      style={{ width: 520 }}
    >
      <h5 className="mb-4">
        {isEditing ? "Edit Requirement" : "Add Requirement"}
      </h5>

      {/* Route Step */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Route Step <span className="text-danger">*</span>
        </label>
        <select
          className="form-select"
          value={formData.route_step_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              route_step_id: e.target.value,
            })
          }
          disabled={isEditing}
        >
          <option value="">Select Route Step</option>
          {routeSteps.map((r) => (
            <option
              key={r.route_step_id}
              value={r.route_step_id}
            >
              SEQ {r.seq_no} - Stage {r.stage_id}
            </option>
          ))}
        </select>
      </div>

      {/* Part */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Part <span className="text-danger">*</span>
        </label>
        <select
          className="form-select"
          value={formData.part_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              part_id: e.target.value,
            })
          }
          disabled={isEditing}
        >
          <option value="">Select Part</option>
          {parts.map((p) => (
            <option
              key={p.part_id}
              value={p.part_id}
            >
              {p.part_no} - {p.part_name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Quantity Required <span className="text-danger">*</span>
        </label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Quantity"
          value={formData.qty_required}
          onChange={(e) =>
            setFormData({
              ...formData,
              qty_required: e.target.value,
            })
          }
        />
      </div>

      {/* Scan Policy */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Scan Policy
        </label>
        <select
          className="form-select"
          value={formData.scan_policy}
          onChange={(e) =>
            setFormData({
              ...formData,
              scan_policy: e.target.value,
            })
          }
        >
          <option value="EACH_PART">EACH_PART</option>
          <option value="BATCH_ONCE">BATCH_ONCE</option>
        </select>
      </div>

      {/* Mandatory */}
      <div className="form-check mb-4">
        <input
          type="checkbox"
          className="form-check-input"
          checked={formData.mandatory}
          onChange={(e) =>
            setFormData({
              ...formData,
              mandatory: e.target.checked,
            })
          }
        />
        <label className="form-check-label fw-semibold">
          Mandatory
        </label>
      </div>

      {/* Buttons */}
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
    </div>
  );
};

export default RoutePartRequirementMaster;
