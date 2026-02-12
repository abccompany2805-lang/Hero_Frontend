import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const API = `${API_BASE_URL}/api/stagepartrequirementmaster`;

const emptyForm = {
  route_step_id: "",
  part_id: "",
  quantity_required: 1,
  scan_policy: "",
  mandatory: true,
};

const StagePartRequirementMaster = () => {
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    route_step_id: "",
    part_id: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  

  /* ================= LOAD ================= */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(API);
    setRows(res.data);
  };

  /* ================= FILTER ================= */
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        String(r.route_step_id)
          .includes(filters.route_step_id) &&
        String(r.part_id).includes(filters.part_id)
    );
  }, [rows, filters]);

  /* ================= ACTIONS ================= */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      stage_part_req_id: row.stage_part_req_id,
      route_step_id: row.route_step_id,
      part_id: row.part_id,
      quantity_required: row.quantity_required,
      scan_policy: row.scan_policy || "",
      mandatory: row.mandatory,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.route_step_id || !formData.part_id) {
      alert("Route Step ID and Part ID are required");
      return;
    }

    if (isEditing) {
      await axios.put(
        `${API}/${formData.stage_part_req_id}`,
        formData
      );
    } else {
      await axios.post(API, formData);
    }

    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      await axios.delete(`${API}/${id}`);
      fetchData();
    }
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
            <h4 className="fw-bold mb-1">Stage Part Requirement Master</h4>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Route Step ID"
              style={{ width: 160 }}
              value={filters.route_step_id}
              onChange={(e) =>
                setFilters({ ...filters, route_step_id: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Part ID"
              style={{ width: 160 }}
              value={filters.part_id}
              onChange={(e) =>
                setFilters({ ...filters, part_id: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ route_step_id: "", part_id: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add
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
              <th>Route Step ID</th>
              <th>Part ID</th>
              <th>Qty</th>
              <th>Scan Policy</th>
              <th>Mandatory</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => (
              <tr key={row.stage_part_req_id}>
                <td>{i + 1}</td>
                <td>{row.route_step_id}</td>
                <td>{row.part_id}</td>
                <td>{row.quantity_required}</td>
                <td>{row.scan_policy}</td>
                <td>
                  <span
                    className={`badge ${
                      row.mandatory ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {row.mandatory ? "Yes" : "No"}
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
                      handleDelete(row.stage_part_req_id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
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
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Requirement" : "Add Requirement"}
            </h5>

            {[
              ["Route Step ID", "route_step_id"],
              ["Part ID", "part_id"],
              ["Quantity", "quantity_required"],
              ["Scan Policy", "scan_policy"],
            ].map(([label, key]) => (
              <div className="mb-2" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-control"
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}

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
              <label className="form-check-label">Mandatory</label>
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
            <h5 className="mb-3">Requirement Details</h5>

            {[
              ["Route Step ID", viewData.route_step_id],
              ["Part ID", viewData.part_id],
              ["Quantity", viewData.quantity_required],
              ["Scan Policy", viewData.scan_policy],
              ["Mandatory", viewData.mandatory ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="d-flex justify-content-between mb-1">
                <strong className="text-muted">{k}</strong>
                <span>{v ?? "-"}</span>
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

export default StagePartRequirementMaster;
