import { useState, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  RotateCcw
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/operations`;
const STAGE_API = `${API_BASE_URL}/api/stages`;

const emptyForm = {
  operation_code: "",
  operation_name: "",
  operation_type: "",
  process_type: "",
  is_ctq: false,
  qgate_stage_id: "",
  is_active: true,
};

const ProcessMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    operation_code: "",
    operation_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH OPERATIONS ================= */
  const { data: operations = [] } = useQuery({
    queryKey: ["operations"],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data;
    },
  });

  /* ================= FETCH STAGES ================= */
  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const res = await axios.get(STAGE_API);
      return res.data;
    },
  });

  /* ================= FILTER ================= */
  const filteredOperations = useMemo(() => {
    return operations.filter(
      (p) =>
        p.operation_code
          ?.toLowerCase()
          .includes(filters.operation_code.toLowerCase()) &&
        p.operation_name
          ?.toLowerCase()
          .includes(filters.operation_name.toLowerCase())
    );
  }, [operations, filters]);

  /* ================= SAVE ================= */
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return axios.put(`${API_URL}/${formData.operation_id}`, payload);
      } else {
        return axios.post(API_URL, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["operations"]);
      setShowModal(false);
    },
  });

  /* ================= DELETE ================= */
  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["operations"]);
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
    setFormData(row);
    setShowModal(true);
  };

  const handleSave = () => {
    const payload = {
      operation_code: formData.operation_code,
      operation_name: formData.operation_name,
      operation_type: formData.operation_type,
      process_type:
        formData.operation_type === "PROCESS"
          ? formData.process_type
          : null,
      is_ctq: formData.is_ctq,
      qgate_stage_id: formData.qgate_stage_id || null,
      is_active: formData.is_active,
    };

    saveMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this operation?")) {
      deleteMutation.mutate(id);
    }
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
          <h4 className="fw-bold mb-1">Operation Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Operation Code"
              style={{ width: 160 }}
              value={filters.operation_code}
              onChange={(e) =>
                setFilters({ ...filters, operation_code: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Operation Name"
              style={{ width: 180 }}
              value={filters.operation_name}
              onChange={(e) =>
                setFilters({ ...filters, operation_name: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ operation_code: "", operation_name: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Operation
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead className="border-bottom">
            <tr className="text-muted">
              <th>Sr</th>
              <th>Op Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Process Type</th>
              <th>CTQ</th>
              <th>QGate Stage</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOperations.map((row, i) => (
              <tr key={row.operation_id}>
                <td>{i + 1}</td>
                <td>{row.operation_code}</td>
                <td>{row.operation_name}</td>
                <td>{row.operation_type}</td>
                <td>{row.process_type || "-"}</td>
                <td>{row.is_ctq ? "Yes" : "No"}</td>
                <td>
                  {
                    stages.find(s => s.stage_id === row.qgate_stage_id)?.stage_no || "-"
                  }
                </td>
                <td>{row.is_active ? "Active" : "Inactive"}</td>
                <td className="text-end">
                  <button className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(row)}>
                    <Eye size={14} />
                  </button>
                  <button className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(row)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(row.operation_id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


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
    <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
      <h5 className="mb-3">Operation Details</h5>

      <div className="d-flex flex-column gap-2">

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Operation Code</strong>
          <span>{viewData.operation_code}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Operation Name</strong>
          <span>{viewData.operation_name}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Operation Type</strong>
          <span>{viewData.operation_type}</span>
        </div>

        {viewData.operation_type === "PROCESS" && (
          <div className="d-flex justify-content-between">
            <strong className="text-muted">Process Type</strong>
            <span>{viewData.process_type || "-"}</span>
          </div>
        )}

        <div className="d-flex justify-content-between">
          <strong className="text-muted">CTQ</strong>
          <span>{viewData.is_ctq ? "Yes" : "No"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">QGate Stage</strong>
          <span>
            {
              stages.find(
                (s) => s.stage_id === viewData.qgate_stage_id
              )?.stage_no || "-"
            }
          </span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Status</strong>
          <span>{viewData.is_active ? "Active" : "Inactive"}</span>
        </div>

        <div className="d-flex justify-content-between">
          <strong className="text-muted">Created At</strong>
          <span>
            {viewData.created_at
              ? new Date(viewData.created_at).toLocaleString()
              : "-"}
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

      {/* ADD / EDIT MODAL */}
{showModal && (
  <div style={modalStyle}>
    <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
      <h5 className="mb-4">
        {isEditing ? "Edit Operation" : "Add Operation"}
      </h5>

      {/* Operation Code */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Operation Code <span className="text-danger">*</span>
        </label>
        <input
          className="form-control"
          placeholder="Enter Operation Code"
          disabled={isEditing}
          value={formData.operation_code}
          onChange={(e) =>
            setFormData({ ...formData, operation_code: e.target.value })
          }
        />
      </div>

      {/* Operation Name */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Operation Name <span className="text-danger">*</span>
        </label>
        <input
          className="form-control"
          placeholder="Enter Operation Name"
          value={formData.operation_name}
          onChange={(e) =>
            setFormData({ ...formData, operation_name: e.target.value })
          }
        />
      </div>

      {/* Operation Type */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Operation Type <span className="text-danger">*</span>
        </label>
        <select
          className="form-select"
          value={formData.operation_type}
          onChange={(e) =>
            setFormData({ ...formData, operation_type: e.target.value })
          }
        >
          <option value="">Select Operation Type</option>
          <option value="PART_SCAN">Part Scan</option>
          <option value="PROCESS">Process</option>
          <option value="POKA_YOKE">Pokayoke</option>
        </select>
      </div>

      {/* Process Type */}
      {formData.operation_type === "PROCESS" && (
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Process Type <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={formData.process_type || ""}
            onChange={(e) =>
              setFormData({ ...formData, process_type: e.target.value })
            }
          >
            <option value="">Select Process Type</option>
            <option value="DC_TOOL">DC TOOL</option>
            <option value="LEAK_TEST">LEAK TEST</option>
            <option value="VISION">VISION</option>
            <option value="MANUAL">MANUAL</option>
          </select>
        </div>
      )}

      {/* Stage Dropdown */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Stage <span className="text-danger">*</span>
        </label>
        <select
          className="form-select"
          value={formData.qgate_stage_id || ""}
          onChange={(e) =>
            setFormData({ ...formData, qgate_stage_id: e.target.value })
          }
        >
          <option value="">Select Stage</option>
          {stages.map((stage) => (
            <option key={stage.stage_id} value={stage.stage_id}>
              Stage {stage.stage_no}
            </option>
          ))}
        </select>
      </div>

      {/* CTQ */}
      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.is_ctq}
          onChange={(e) =>
            setFormData({ ...formData, is_ctq: e.target.checked })
          }
        />
        <label className="form-check-label fw-semibold">
          Is CTQ (Critical To Quality)
        </label>
      </div>

      {/* Active */}
      <div className="form-check mb-4">
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

const modalStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050,
};

export default ProcessMaster;
