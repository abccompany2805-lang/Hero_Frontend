import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Eye, RotateCcw } from "lucide-react";
import API_BASE_URL from "../../config";

const MAP_API = `${API_BASE_URL}/api/stagedocumentmaps`;
const ROUTE_STEP_API = `${API_BASE_URL}/api/routestepmaster`;
const DOC_VERSION_API = `${API_BASE_URL}/api/documentversions`;
const STAGE_API = `${API_BASE_URL}/api/stagemaster`;

const emptyForm = {
  route_step_id: "",
  document_version_id: "",
  mandatory_ready: false,
  mandatory_acknowledgement: false,
  training_required: false,
};

const StageDocumentMapMaster = () => {
  const [rows, setRows] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [docVersions, setDocVersions] = useState([]);
  const [stages, setStages] = useState([]);

  const [filters, setFilters] = useState({
    route_step_id: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  // ================= LOAD =================
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [m, rs, dv, st] = await Promise.all([
      axios.get(MAP_API),
      axios.get(ROUTE_STEP_API),
      axios.get(DOC_VERSION_API),
      axios.get(STAGE_API),
    ]);

    setRows(m.data);
    setRouteSteps(rs.data);
    setDocVersions(dv.data);
    setStages(st.data);
  };

  // ================= HELPERS =================
  const getStageName = (stageId) =>
    stages.find((s) => s.stage_id === stageId)?.stage_name || stageId;

  const getRouteStepLabel = (id) => {
    const rs = routeSteps.find((r) => r.route_step_id === id);
    if (!rs) return id;
    return `${getStageName(rs.stage_id)} → Seq ${rs.sequence_no}`;
  };

  const getDocVersionLabel = (id) => {
    const dv = docVersions.find((d) => d.document_version_id === id);
    if (!dv) return id;
    return `Doc ${dv.document_id} | ${dv.version_no}`;
  };

  // ================= FILTER =================
  const filteredRows = useMemo(() => {
    return rows.filter((r) =>
      String(r.route_step_id).includes(filters.route_step_id)
    );
  }, [rows, filters]);

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      stage_document_map_id: row.stage_document_map_id,
      route_step_id: String(row.route_step_id),
      document_version_id: String(row.document_version_id),
      mandatory_ready: row.mandatory_ready,
      mandatory_acknowledgement: row.mandatory_acknowledgement,
      training_required: row.training_required,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.route_step_id || !formData.document_version_id) {
      alert("Route Step and Document Version are required");
      return;
    }

    const payload = {
      route_step_id: Number(formData.route_step_id),
      document_version_id: Number(formData.document_version_id),
      mandatory_ready: formData.mandatory_ready,
      mandatory_acknowledgement: formData.mandatory_acknowledgement,
      training_required: formData.training_required,
    };

    if (isEditing) {
      await axios.put(
        `${MAP_API}/${formData.stage_document_map_id}`,
        payload
      );
    } else {
      await axios.post(MAP_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this mapping?")) {
      await axios.delete(`${MAP_API}/${id}`);
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
          <h4 className="fw-bold mb-0">Stage Document Mapping</h4>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Route Step ID"
              style={{ width: 160 }}
              value={filters.route_step_id}
              onChange={(e) =>
                setFilters({ route_step_id: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() => setFilters({ route_step_id: "" })}
            >
              <RotateCcw size={14} />
            </button>

            <button className="btn btn-danger btn-sm" onClick={handleAdd}>
              <Plus size={14} /> Add Mapping
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
              <th>Route Step</th>
              <th>Document Version</th>
              <th>Ready</th>
              <th>Ack</th>
              <th>Training</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.stage_document_map_id}>
                <td>{i + 1}</td>
                <td>{getRouteStepLabel(r.route_step_id)}</td>
                <td>{getDocVersionLabel(r.document_version_id)}</td>
                <td>{r.mandatory_ready ? "Yes" : "No"}</td>
                <td>{r.mandatory_acknowledgement ? "Yes" : "No"}</td>
                <td>{r.training_required ? "Yes" : "No"}</td>
                <td className="text-end">
                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleView(r)}>
                    <Eye size={14} />
                  </button>
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(r)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(r.stage_document_map_id)}>
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

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={modalBackdrop}>
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
            <h5 className="mb-3">
              {isEditing ? "Edit Mapping" : "Add Mapping"}
            </h5>

            <div className="mb-2">
              <label className="form-label">Route Step</label>
              <select
                className="form-select"
                value={formData.route_step_id}
                onChange={(e) =>
                  setFormData({ ...formData, route_step_id: e.target.value })
                }
              >
                <option value="">Select</option>
                {routeSteps.map((r) => (
                  <option key={r.route_step_id} value={r.route_step_id}>
                    {getRouteStepLabel(r.route_step_id)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Document Version</label>
              <select
                className="form-select"
                value={formData.document_version_id}
                onChange={(e) =>
                  setFormData({ ...formData, document_version_id: e.target.value })
                }
              >
                <option value="">Select</option>
                {docVersions.map((d) => (
                  <option key={d.document_version_id} value={d.document_version_id}>
                    {getDocVersionLabel(d.document_version_id)}
                  </option>
                ))}
              </select>
            </div>

            {[
              ["mandatory_ready", "Mandatory Ready"],
              ["mandatory_acknowledgement", "Mandatory Acknowledgement"],
              ["training_required", "Training Required"],
            ].map(([key, label]) => (
              <div className="form-check mt-2" key={key}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.checked })
                  }
                />
                <label className="form-check-label">{label}</label>
              </div>
            ))}

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && viewData && (
        <div style={modalBackdrop}>
          <div className="bg-white rounded-4 shadow p-4" style={{ width: 480 }}>
            <h5 className="mb-3">Mapping Details</h5>

            {[
              ["Route Step", getRouteStepLabel(viewData.route_step_id)],
              ["Document Version", getDocVersionLabel(viewData.document_version_id)],
              ["Mandatory Ready", viewData.mandatory_ready ? "Yes" : "No"],
              ["Mandatory Acknowledgement", viewData.mandatory_acknowledgement ? "Yes" : "No"],
              ["Training Required", viewData.training_required ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="d-flex justify-content-between mb-1">
                <strong className="text-muted">{k}</strong>
                <span>{v}</span>
              </div>
            ))}

            <div className="text-end mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050,
};

export default StageDocumentMapMaster;
