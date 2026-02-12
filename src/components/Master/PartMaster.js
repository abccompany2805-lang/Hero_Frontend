import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/partmaster`;

const emptyForm = {
  part_number: "",
  part_name: "",
  category: "",
  supplier: "",
  traceability_type: "",
  status: true,
};

const PartMaster = () => {
  const [allParts, setAllParts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    part_number: "",
    part_name: "",
    category: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */
  const fetchParts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setAllParts(res.data || []);
    } catch (e) {
      alert("Failed to load parts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  /* ================= FILTER ================= */
  const filteredParts = useMemo(() => {
    return allParts.filter(
      (p) =>
        p.part_number
          ?.toLowerCase()
          .includes(filters.part_number.toLowerCase()) &&
        p.part_name
          ?.toLowerCase()
          .includes(filters.part_name.toLowerCase()) &&
        p.category
          ?.toLowerCase()
          .includes(filters.category.toLowerCase())
    );
  }, [allParts, filters]);

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

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${formData.part_id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setShowModal(false);
      fetchParts();
    } catch (e) {
      alert("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this part?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchParts();
  };

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
            <h4 className="fw-bold mb-1">Part Master</h4>
            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Part Number"
              style={{ width: 180 }}
              value={filters.part_number}
              onChange={(e) =>
                setFilters({ ...filters, part_number: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Part Name"
              style={{ width: 180 }}
              value={filters.part_name}
              onChange={(e) =>
                setFilters({ ...filters, part_name: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Category"
              style={{ width: 180 }}
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ part_number: "", part_name: "", category: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Part
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
              <th>Part Code</th>
              <th>Part Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Traceability</th>
              <th>Status</th>
              <th>Updated</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              filteredParts.map((row, i) => (
                <tr key={row.part_id}>
                  <td>{i + 1}</td>
                  <td>{row.part_number}</td>
                  <td>{row.part_name}</td>
                  <td>{row.category}</td>
                  <td>{row.supplier}</td>
                  <td>{row.traceability_type}</td>
                  <td>
                    <span
                      className={`badge ${
                        row.status ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {row.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {row.updated_at
                      ? new Date(row.updated_at).toLocaleString()
                      : "-"}
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
                      onClick={() => handleDelete(row.part_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredParts.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Part" : "Add Part"}
            </h5>

            {[
              { k: "part_number", l: "Part Number", dis: isEditing },
              { k: "part_name", l: "Part Name" },
              { k: "category", l: "Category" },
              { k: "supplier", l: "Supplier" },
              { k: "traceability_type", l: "Traceability Type" },
            ].map(({ k, l, dis }) => (
              <div className="mb-2" key={k}>
                <label className="form-label">{l}</label>
                <input
                  className="form-control"
                  disabled={dis}
                  value={formData[k]}
                  onChange={(e) =>
                    setFormData({ ...formData, [k]: e.target.value })
                  }
                />
              </div>
            ))}

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked })
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
            <h5 className="mb-3">Part Details</h5>

            <div className="d-flex flex-column gap-2">
              {Object.entries(viewData).map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between">
                  <strong className="text-muted">
                    {k.replace(/_/g, " ")}
                  </strong>
                  <span>{String(v)}</span>
                </div>
              ))}
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

export default PartMaster;
