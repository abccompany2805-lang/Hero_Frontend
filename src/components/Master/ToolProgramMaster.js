import { useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../../config";

const TOOL_PROGRAM_API = `${API_BASE_URL}/api/tool-programs`;
const TOOL_API = `${API_BASE_URL}/api/tools`;

const emptyForm = {
  tool_id: "",
  program_no: "",
  program_name: "",
  is_active: true,
};

const ToolProgramMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    tool_code: "",
    program_no: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */

  const { data: programs = [] } = useQuery({
    queryKey: ["tool-programs"],
    queryFn: async () => {
      const res = await axios.get(TOOL_PROGRAM_API);
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

  /* ================= TOOL MAP (FAST LOOKUP) ================= */

  const toolMap = useMemo(() => {
    const map = {};
    tools.forEach((t) => {
      map[t.tool_id] = t.tool_code;
    });
    return map;
  }, [tools]);

  /* ================= FILTER ================= */

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const toolCode = toolMap[p.tool_id] || "";

      return (
        toolCode
          .toLowerCase()
          .includes(filters.tool_code.toLowerCase()) &&
        String(p.program_no || "")
          .toLowerCase()
          .includes(filters.program_no.toLowerCase())
      );
    });
  }, [programs, filters, toolMap]);

  /* ================= MUTATIONS ================= */

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return axios.put(
          `${TOOL_PROGRAM_API}/${formData.program_id}`,
          payload
        );
      }
      return axios.post(TOOL_PROGRAM_API, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-programs"] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${TOOL_PROGRAM_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-programs"] });
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
    setFormData({
      program_id: row.program_id,
      tool_id: row.tool_id,
      program_no: String(row.program_no),
      program_name: row.program_name || "",
      is_active: row.is_active,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.tool_id) {
      alert("Please select Tool");
      return;
    }

    if (!formData.program_no) {
      alert("Program No is required");
      return;
    }

    const payload = {
      tool_id: formData.tool_id, // ✅ UUID
      program_no: Number(formData.program_no),
      program_name: formData.program_name,
      is_active: formData.is_active,
    };

    saveMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this program?")) return;
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
          <div>
            <h4 className="fw-bold mb-1">Tool Program Master</h4>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Tool Code"
              style={{ width: 120 }}
              value={filters.tool_code}
              onChange={(e) =>
                setFilters({ ...filters, tool_code: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Program No"
              style={{ width: 120 }}
              value={filters.program_no}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  program_no: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ tool_code: "", program_no: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Program
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
              <th>Tool</th>
              <th>Program No</th>
              <th>Program Name</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((row, i) => (
              <tr key={row.program_id}>
                <td>{i + 1}</td>
                <td>{toolMap[row.tool_id] || "-"}</td>
                <td>{row.program_no}</td>
                <td>{row.program_name}</td>
                <td>
                  <span
                    className={`badge ${
                      row.is_active
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
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
                    onClick={() =>
                      handleDelete(row.program_id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredPrograms.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Tool Program" : "Add Tool Program"}
            </h5>

            <select
              className="form-control mb-2"
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

            <input
              type="number"
              className="form-control mb-2"
              placeholder="Program No"
              value={formData.program_no}
              onChange={(e) =>
                setFormData({ ...formData, program_no: e.target.value })
              }
            />

            <input
              className="form-control mb-2"
              placeholder="Program Name"
              value={formData.program_name}
              onChange={(e) =>
                setFormData({ ...formData, program_name: e.target.value })
              }
            />

            <div className="form-check mb-3">
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
              <label className="form-check-label">Active</label>
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
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 420 }}>
            <h5 className="mb-3">Tool Program Details</h5>

            {[
              ["Tool", toolMap[viewData.tool_id]],
              ["Program No", viewData.program_no],
              ["Program Name", viewData.program_name],
              ["Status", viewData.is_active ? "Active" : "Inactive"],
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
      )}
    </div>
  );
};

export default ToolProgramMaster;
