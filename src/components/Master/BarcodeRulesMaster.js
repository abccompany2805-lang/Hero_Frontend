import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Eye , RotateCcw} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  part_id: "",
  regex_pattern: "",
  min_len: "",
  max_len: "",
  allow_duplicate: false,
  model_pos_start: "",
  model_pos_end: "",
  partno_pos_start: "",
  partno_pos_end: "",
  is_active: true,
};

/* ================= API ================= */

const fetchRules = async () => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/part-barcode-rules`
  );
  return data;
};

const fetchParts = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/parts`);
  return data;
};

const PartBarcodeRuleMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    regex_pattern: "",
     part_id: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
const [viewData, setViewData] = useState(null);


  /* ================= FETCH ================= */

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["partBarcodeRules"],
    queryFn: fetchRules,
  });

  const { data: parts = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: fetchParts,
  });

  /* ================= HELPERS ================= */

  const getPartName = (id) => {
    const part = parts.find((p) => p.part_id === id);
    return part
      ? `${part.part_no} - ${part.part_name}`
      : "-";
  };

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: (newData) =>
      axios.post(
        `${API_BASE_URL}/api/part-barcode-rules`,
        newData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["partBarcodeRules"]);
      setShowModal(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Insert failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      axios.put(
        `${API_BASE_URL}/api/part-barcode-rules/${updatedData.rule_id}`,
        updatedData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["partBarcodeRules"]);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(
        `${API_BASE_URL}/api/part-barcode-rules/${id}`
      ),
    onSuccess: () =>
      queryClient.invalidateQueries(["partBarcodeRules"]),
  });

  /* ================= FILTER ================= */

const filteredData = useMemo(() => {
  return rules.filter((row) => {
    const regexMatch = filters.regex_pattern
      ? row.regex_pattern
          ?.toLowerCase()
          .includes(filters.regex_pattern.toLowerCase())
      : true;

    const partMatch = filters.part_id
      ? row.part_id === filters.part_id
      : true;

    return regexMatch && partMatch;
  });
}, [rules, filters]);


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
    if (!window.confirm("Delete this rule?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.part_id || !formData.regex_pattern) {
      alert("Part and Regex Pattern are required");
      return;
    }

    if (
      formData.min_len &&
      formData.max_len &&
      Number(formData.min_len) >
        Number(formData.max_len)
    ) {
      alert("Min length cannot be greater than Max length");
      return;
    }

    if (
      formData.model_pos_start &&
      formData.model_pos_end &&
      Number(formData.model_pos_start) >
        Number(formData.model_pos_end)
    ) {
      alert("Model start cannot be greater than Model end");
      return;
    }

    if (
      formData.partno_pos_start &&
      formData.partno_pos_end &&
      Number(formData.partno_pos_start) >
        Number(formData.partno_pos_end)
    ) {
      alert("Part start cannot be greater than Part end");
      return;
    }

    const payload = {
      ...formData,
      min_len: formData.min_len
        ? Number(formData.min_len)
        : null,
      max_len: formData.max_len
        ? Number(formData.max_len)
        : null,
      model_pos_start: formData.model_pos_start
        ? Number(formData.model_pos_start)
        : null,
      model_pos_end: formData.model_pos_end
        ? Number(formData.model_pos_end)
        : null,
      partno_pos_start: formData.partno_pos_start
        ? Number(formData.partno_pos_start)
        : null,
      partno_pos_end: formData.partno_pos_end
        ? Number(formData.partno_pos_end)
        : null,
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
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h4 className="fw-bold mb-1">
            Part Barcode Rule Master
          </h4>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Search Regex"
              style={{ width: 200 }}
              value={filters.regex_pattern}
              onChange={(e) =>
                setFilters({
                  regex_pattern: e.target.value,
                })
              }
            />
<select
  className="form-control"
  style={{ width: 220 }}
  value={filters.part_id}
  onChange={(e) =>
    setFilters({
      ...filters,
      part_id: e.target.value,
    })
  }
>
  <option value="">All Parts</option>
  {parts.map((p) => (
    <option key={p.part_id} value={p.part_id}>
      {p.part_no} - {p.part_name}
    </option>
  ))}
</select>
<button
  className="btn btn-sm"
  style={{ background: "#d3e7f3" }}
  onClick={() =>
    setFilters({
      regex_pattern: "",
      part_id: "",
    })
  }
>
  <RotateCcw size={14} />
</button>

            <button
              className="btn btn-danger btn-sm"
              onClick={handleAdd}
            >
              <Plus size={14} /> Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Part</th>
              <th>Regex</th>
              <th>Min</th>
              <th>Max</th>
              <th>Duplicate</th>
              <th>Status</th>
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
              filteredData.map((row, i) => (
                <tr key={row.rule_id}>
                  <td>{i + 1}</td>
                  <td>{getPartName(row.part_id)}</td>
                  <td>{row.regex_pattern}</td>
                  <td>{row.min_len}</td>
                  <td>{row.max_len}</td>
                  <td>
                    {row.allow_duplicate ? (
                      <span className="badge bg-warning text-dark">
                        Allowed
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        Not Allowed
                      </span>
                    )}
                  </td>
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
                 <td className="text-end">
  <button
    className="btn btn-outline-secondary btn-sm me-2"
    onClick={() => {
      setViewData(row);
      setShowView(true);
    }}
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
    onClick={() => handleDelete(row.rule_id)}
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
      style={{ width: 600 }}
    >
      <h5 className="mb-3">
        {isEditing ? "Edit Rule" : "Add Rule"}
      </h5>

      {/* PART */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Part
        </label>
        <select
          className="form-control"
          value={formData.part_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              part_id: e.target.value,
            })
          }
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

      {/* REGEX */}
      <div className="mb-2">
        <label className="form-label fw-semibold">
          Regex Pattern
        </label>
        <input
          className="form-control"
          value={formData.regex_pattern}
          onChange={(e) =>
            setFormData({
              ...formData,
              regex_pattern: e.target.value,
            })
          }
        />
      </div>

      {/* LENGTH */}
      <div className="row">
        <div className="col">
          <label className="form-label fw-semibold">
            Min Length
          </label>
          <input
            className="form-control"
            value={formData.min_len}
            onChange={(e) =>
              setFormData({
                ...formData,
                min_len: e.target.value,
              })
            }
          />
        </div>
        <div className="col">
          <label className="form-label fw-semibold">
            Max Length
          </label>
          <input
            className="form-control"
            value={formData.max_len}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_len: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* MODEL POS */}
      <div className="row mt-2">
        <div className="col">
          <label className="form-label fw-semibold">
            Model Position Start
          </label>
          <input
            className="form-control"
            value={formData.model_pos_start}
            onChange={(e) =>
              setFormData({
                ...formData,
                model_pos_start: e.target.value,
              })
            }
          />
        </div>
        <div className="col">
          <label className="form-label fw-semibold">
            Model Position End
          </label>
          <input
            className="form-control"
            value={formData.model_pos_end}
            onChange={(e) =>
              setFormData({
                ...formData,
                model_pos_end: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* PART POS */}
      <div className="row mt-2">
        <div className="col">
          <label className="form-label fw-semibold">
            Part Position Start
          </label>
          <input
            className="form-control"
            value={formData.partno_pos_start}
            onChange={(e) =>
              setFormData({
                ...formData,
                partno_pos_start: e.target.value,
              })
            }
          />
        </div>
        <div className="col">
          <label className="form-label fw-semibold">
            Part Position End
          </label>
          <input
            className="form-control"
            value={formData.partno_pos_end}
            onChange={(e) =>
              setFormData({
                ...formData,
                partno_pos_end: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* DUPLICATE */}
      <div className="form-check mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.allow_duplicate}
          onChange={(e) =>
            setFormData({
              ...formData,
              allow_duplicate: e.target.checked,
            })
          }
        />
        <label className="form-check-label fw-semibold">
          Allow Duplicate
        </label>
      </div>

      <div className="d-flex justify-content-end mt-3 gap-2">
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

{showView && viewData && (
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
      <h5 className="mb-3">Rule Details</h5>

      {(() => {
        const part = parts.find(
          (p) => p.part_id === viewData.part_id
        );

        return (
          <div className="d-flex flex-column gap-2">

            <div className="d-flex justify-content-between">
              <strong className="text-muted">Part</strong>
              <span>
                {part
                  ? `${part.part_no} - ${part.part_name}`
                  : "-"}
              </span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">Regex Pattern</strong>
              <span>{viewData.regex_pattern}</span>
            </div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">Length</strong>
              <span>
                {viewData.min_len} - {viewData.max_len}
              </span>
            </div>

            {/* MODEL POS IF EXISTS */}
            {viewData.model_pos_start &&
              viewData.model_pos_end && (
                <div className="d-flex justify-content-between">
                  <strong className="text-muted">
                    Model Position
                  </strong>
                  <span>
                    {viewData.model_pos_start} -{" "}
                    {viewData.model_pos_end}
                  </span>
                </div>
              )}

            {/* PART POS IF EXISTS */}
            {viewData.partno_pos_start &&
              viewData.partno_pos_end && (
                <div className="d-flex justify-content-between">
                  <strong className="text-muted">
                    Part Position
                  </strong>
                  <span>
                    {viewData.partno_pos_start} -{" "}
                    {viewData.partno_pos_end}
                  </span>
                </div>
              )}

            <div className="d-flex justify-content-between">
              <strong className="text-muted">
                Allow Duplicate
              </strong>
              <span>
                {viewData.allow_duplicate ? "Yes" : "No"}
              </span>
            </div>

          </div>
        );
      })()}

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

export default PartBarcodeRuleMaster;
