import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const ROUTE_API = `${API_BASE_URL}/api/routestepmaster`;
const STAGE_API = `${API_BASE_URL}/api/stagemaster`;
const PROCESS_API = `${API_BASE_URL}/api/processmaster`;
const MODEL_API = `${API_BASE_URL}/api/modelmaster`;


const emptyForm = {
  model_id: "",
  stage_id: "",
  process_id: "",
  sequence_no: "",
  mandatory: true,
  allow_bypass: false,
  max_entry_count: 1,
};


const RouteStepMaster = () => {
  const [routeSteps, setRouteSteps] = useState([]);
  const [stages, setStages] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [models, setModels] = useState([]);


  const [filters, setFilters] = useState({
    stage_id: "",
    process_id: "",
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
  const [r, s, p, m] = await Promise.all([
    axios.get(ROUTE_API),
    axios.get(STAGE_API),
    axios.get(PROCESS_API),
    axios.get(MODEL_API),
  ]);

  setRouteSteps(r.data);
  setStages(s.data);
  setProcesses(p.data);
  setModels(m.data);
};


  // ================= FILTER =================
  const filteredRouteSteps = useMemo(() => {
    return routeSteps.filter(
      (r) =>
        String(r.stage_id).includes(filters.stage_id) &&
        String(r.process_id).includes(filters.process_id)
    );
  }, [routeSteps, filters]);

  // ================= HELPERS =================
  const getStageName = (id) =>
    stages.find((s) => s.stage_id === id)?.stage_name || id;

  const getProcessName = (id) =>
    processes.find((p) => p.process_id === id)?.operation_name || id;

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

const handleEdit = (row) => {
  setIsEditing(true);
  setFormData({
    route_step_id: row.route_step_id,
    model_id: row.model_id,
    stage_id: row.stage_id,
    process_id: row.process_id,
    sequence_no: row.sequence_no,
    mandatory: row.mandatory,
    allow_bypass: row.allow_bypass,
    max_entry_count: row.max_entry_count,
  });
  setShowModal(true);
};


  const handleSave = async () => {

const payload = {
 model_id: formData.model_id ? Number(formData.model_id) : null,

  stage_id: Number(formData.stage_id),
  process_id: Number(formData.process_id),
  sequence_no: Number(formData.sequence_no),
  mandatory: formData.mandatory,
  allow_bypass: formData.allow_bypass,
  max_entry_count: Number(formData.max_entry_count),
};


    if (isEditing) {
      await axios.put(
        `${ROUTE_API}/${formData.route_step_id}`,
        payload
      );
    } else {
      await axios.post(ROUTE_API, payload);
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this route step?")) {
      await axios.delete(`${ROUTE_API}/${id}`);
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
          <h4 className="fw-bold mb-1">Route Step Master</h4>
          
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <input
            className="form-control"
            placeholder="Stage ID"
            style={{ width: 140 }}
            value={filters.stage_id}
            onChange={(e) =>
              setFilters({ ...filters, stage_id: e.target.value })
            }
          />

          <input
            className="form-control"
            placeholder="Process ID"
            style={{ width: 140 }}
            value={filters.process_id}
            onChange={(e) =>
              setFilters({ ...filters, process_id: e.target.value })
            }
          />

          <button
            className="btn btn-sm"
            style={{ background: "#d3e7f3" }}
            onClick={() =>
              setFilters({ stage_id: "", process_id: "" })
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

    {/* ================= TABLE ================= */}
    <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
      <table className="table table-bordered align-middle mb-0">
        <thead className="border-bottom">
          <tr className="text-muted">
            <th>Sr</th>
            <th>Stage</th>
            <th>Process</th>
            <th>Model</th>
            <th>Seq</th>
            <th>Mandatory</th>
            <th>Bypass</th>
            <th>Max Entry</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRouteSteps.map((row, i) => (
            <tr key={row.route_step_id}>
              <td>{i + 1}</td>
              <td>{getStageName(row.stage_id)}</td>
              <td>{getProcessName(row.process_id)}</td>
              <td>
  {models.find(m => m.model_id === row.model_id)?.model_sku_name || row.model_id}
</td>

              <td>{row.sequence_no}</td>
              <td>
                <span
                  className={`badge ${
                    row.mandatory ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {row.mandatory ? "Yes" : "No"}
                </span>
              </td>
              <td>
                <span
                  className={`badge ${
                    row.allow_bypass ? "bg-warning text-dark" : "bg-secondary"
                  }`}
                >
                  {row.allow_bypass ? "Yes" : "No"}
                </span>
              </td>
              <td>{row.max_entry_count}</td>
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
          ))}

          {filteredRouteSteps.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4">
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
            {isEditing ? "Edit Route Step" : "Add Route Step"}
          </h5>

          <select
            className="form-control mb-2"
            value={formData.stage_id}
            onChange={(e) =>
              setFormData({ ...formData, stage_id: e.target.value })
            }
          >
            <option value="">Select Stage</option>
            {stages.map((s) => (
              <option key={s.stage_id} value={s.stage_id}>
                {s.stage_name}
              </option>
            ))}
          </select>

          <select
            className="form-control mb-2"
            value={formData.process_id}
            onChange={(e) =>
              setFormData({ ...formData, process_id: e.target.value })
            }
          >
            <option value="">Select Process</option>
            {processes.map((p) => (
              <option key={p.process_id} value={p.process_id}>
                {p.operation_name}
              </option>
            ))}
          </select>
          {/* MODEL */}
<div className="mb-2">
  <label className="form-label">Model</label>
  <select
    className="form-control"
    value={formData.model_id}
    onChange={(e) =>
      setFormData({ ...formData, model_id: e.target.value })
    }
  >
    <option value="">Select Model</option>
    {models.map((m) => (
      <option key={m.model_id} value={m.model_id}>
        {m.model_sku_name}
      </option>
    ))}
  </select>
</div>


          <input
            type="number"
            className="form-control mb-2"
            placeholder="Sequence No"
            value={formData.sequence_no}
            onChange={(e) =>
              setFormData({ ...formData, sequence_no: e.target.value })
            }
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Max Entry Count"
            value={formData.max_entry_count}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_entry_count: e.target.value,
              })
            }
          />

          <div className="form-check mb-2">
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

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={formData.allow_bypass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allow_bypass: e.target.checked,
                })
              }
            />
            <label className="form-check-label">Allow Bypass</label>
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
        <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
          <h5 className="mb-3">Route Step Details</h5>

          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Stage</strong>
              <span>{getStageName(viewData.stage_id)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Process</strong>
              <span>{getProcessName(viewData.process_id)}</span>
            </div>
            <div className="d-flex justify-content-between">
  <strong className="text-muted">Model</strong>
  <span>
    {models.find(m => m.model_id === viewData.model_id)?.model_sku_name}
  </span>
</div>

            <div className="d-flex justify-content-between">
              <strong className="text-muted">Sequence</strong>
              <span>{viewData.sequence_no}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Mandatory</strong>
              <span>{viewData.mandatory ? "Yes" : "No"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Allow Bypass</strong>
              <span>{viewData.allow_bypass ? "Yes" : "No"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Max Entry</strong>
              <span>{viewData.max_entry_count}</span>
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
  </div>
);

};

export default RouteStepMaster;
