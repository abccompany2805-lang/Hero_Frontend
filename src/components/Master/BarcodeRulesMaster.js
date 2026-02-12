import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const BARCODE_RULE_API = `${API_BASE_URL}/api/barcoderulesmaster`;
const PART_API = `${API_BASE_URL}/api/partmaster`;

const emptyForm = {
  part_id: "",
  barcode_type: "",
  regex_pattern: "",
  length_validation: "",
  duplicate_allowed: false,
};

const BarcodeRuleMaster = () => {
  const [rules, setRules] = useState([]);
  const [parts, setParts] = useState([]);

  const [filters, setFilters] = useState({
    part_id: "",
    barcode_type: "",
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
    const [r, p] = await Promise.all([
      axios.get(BARCODE_RULE_API),
      axios.get(PART_API),
    ]);
    setRules(r.data);
    setParts(p.data);
  };

  // ================= FILTER =================
  const filteredRules = useMemo(() => {
    return rules.filter(
      (r) =>
        String(r.part_id).includes(filters.part_id) &&
        (r.barcode_type || "")
          .toLowerCase()
          .includes(filters.barcode_type.toLowerCase())
    );
  }, [rules, filters]);

  // ================= HELPERS =================
  const getPartName = (id) =>
    parts.find((p) => p.part_id === id)?.part_name ||
    parts.find((p) => p.part_id === id)?.sku ||
    id;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      barcode_rule_id: row.barcode_rule_id,
      part_id: String(row.part_id),
      barcode_type: row.barcode_type,
      regex_pattern: row.regex_pattern || "",
      length_validation: row.length_validation || "",
      duplicate_allowed: row.duplicate_allowed,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.part_id) {
      alert("Part is required");
      return;
    }
    if (!formData.barcode_type) {
      alert("Barcode Type is required");
      return;
    }

    const payload = {
      part_id: Number(formData.part_id),
      barcode_type: formData.barcode_type,
      regex_pattern: formData.regex_pattern,
      length_validation: formData.length_validation
        ? Number(formData.length_validation)
        : null,
      duplicate_allowed: formData.duplicate_allowed,
    };

    if (isEditing) {
      await axios.put(
        `${BARCODE_RULE_API}/${formData.barcode_rule_id}`,
        payload
      );
    } else {
      await axios.post(BARCODE_RULE_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this barcode rule?")) {
      await axios.delete(`${BARCODE_RULE_API}/${id}`);
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
      {/* ================= HEADER + FILTERS ================= */}
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
            <h4 className="fw-bold mb-1">Barcode Rule Master</h4>
            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Part ID"
              style={{ width: 120 }}
              value={filters.part_id}
              onChange={(e) =>
                setFilters({ ...filters, part_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Barcode Type"
              style={{ width: 160 }}
              value={filters.barcode_type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  barcode_type: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ part_id: "", barcode_type: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Rule
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
              <th>Part</th>
              <th>Barcode Type</th>
              <th>Regex</th>
              <th>Length</th>
              <th>Duplicate</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((r, i) => (
              <tr key={r.barcode_rule_id}>
                <td>{i + 1}</td>
                <td>{getPartName(r.part_id)}</td>
                <td>{r.barcode_type}</td>
                <td className="text-truncate" style={{ maxWidth: 220 }}>
                  {r.regex_pattern}
                </td>
                <td>{r.length_validation}</td>
                <td>
                  <span
                    className={`badge ${
                      r.duplicate_allowed
                        ? "bg-warning text-dark"
                        : "bg-success"
                    }`}
                  >
                    {r.duplicate_allowed ? "Allowed" : "Not Allowed"}
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
                    onClick={() =>
                      handleDelete(r.barcode_rule_id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRules.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Barcode Rule" : "Add Barcode Rule"}
            </h5>

            <div className="mb-2">
              <label className="form-label">Part</label>
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
                  <option key={p.part_id} value={p.part_id}>
                    {p.part_name || p.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Barcode Type</label>
              <input
                className="form-control"
                value={formData.barcode_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    barcode_type: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Regex Pattern</label>
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

            <div className="mb-2">
              <label className="form-label">Length Validation</label>
              <input
                type="number"
                className="form-control"
                value={formData.length_validation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    length_validation: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.duplicate_allowed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duplicate_allowed: e.target.checked,
                  })
                }
              />
              <label className="form-check-label">
                Allow Duplicate Barcode
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleSave}>
                Save
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
            <h5 className="mb-3">Barcode Rule Details</h5>

            {[
              ["Part", getPartName(viewData.part_id)],
              ["Barcode Type", viewData.barcode_type],
              ["Regex", viewData.regex_pattern],
              ["Length", viewData.length_validation],
              [
                "Duplicate",
                viewData.duplicate_allowed ? "Allowed" : "Not Allowed",
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
      )}
    </div>
  );
};

export default BarcodeRuleMaster;
