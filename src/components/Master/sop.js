import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";

/* ================= EMPTY FORM ================= */
const emptyForm = {
  stage_id: "",
  model_id: "",
  media_type: "",
  media_name: "",
};

/* ================= MASTER DATA (Mock) ================= */
// Later replace with API calls
const stageMaster = [
  { stage_id: 1, stage_name: "Engine Fitment" },
  { stage_id: 2, stage_name: "Torque Tightening" },
];

const modelMaster = [
  { model_id: 1, model_name: "Pulsar 125" },
  { model_id: 2, model_name: "Discover 110" },
];

const SopMaster = () => {
  const [sops, setSops] = useState([
    {
      id: 1,
      stage_id: 1,
      model_id: 1,
      media_type: "Video",
      media_name: "engine_fitment.mp4",
      added_by: "Admin",
      added_at: "22-01-2026 10:15:22",
    },
  ]);

  const [filters, setFilters] = useState({
    stage: "",
    model: "",
    media_type: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FILTER LOGIC ================= */
  const filteredSops = useMemo(() => {
    return sops.filter((s) => {
      const stageName =
        stageMaster.find((st) => st.stage_id === s.stage_id)
          ?.stage_name || "";

      const modelName =
        modelMaster.find((m) => m.model_id === s.model_id)
          ?.model_name || "";

      return (
        stageName.toLowerCase().includes(filters.stage.toLowerCase()) &&
        modelName.toLowerCase().includes(filters.model.toLowerCase()) &&
        s.media_type.toLowerCase().includes(filters.media_type.toLowerCase())
      );
    });
  }, [sops, filters]);

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

  const handleSave = () => {
    const now = new Date().toLocaleString("en-GB");

    if (isEditing) {
      setSops((prev) =>
        prev.map((s) =>
          s.id === formData.id ? { ...s, ...formData } : s
        )
      );
    } else {
      setSops((prev) => [
        ...prev,
        {
          ...formData,
          id: Date.now(),
          added_by: "Admin",
          added_at: now,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this SOP?")) {
      setSops((prev) => prev.filter((s) => s.id !== id));
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid py-4">
      {/* ================= HEADER ================= */}
      <div className="card shadow-sm border-0 rounded-4 mb-5">
        <div
          className="card-body d-flex justify-content-between align-items-center"
          style={{ position: "relative", padding: "16px 20px" }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "4px",
              height: "95%",
              backgroundColor: "#dc2626",
              transform: "translateY(3%)",
            }}
          />

          <div>
            <h4 className="fw-bold mb-1">SOP Master</h4>
            <small className="text-muted">
              Manage SOP media mapped with Stage and Model
            </small>
          </div>
        </div>
      </div>

      {/* ================= TABLE + FILTER ================= */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          {/* Filters */}
          <div className="d-flex justify-content-end gap-3 flex-wrap mb-3">
            {[
              { key: "stage", placeholder: "Stage Name" },
              { key: "model", placeholder: "Model Name" },
              { key: "media_type", placeholder: "Media Type" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                className="form-control"
                placeholder={placeholder}
                value={filters[key]}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
                style={{ width: "220px" }}
              />
            ))}

            <button
              className="btn btn-warning btn-sm"
              onClick={() =>
                setFilters({ stage: "", model: "", media_type: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-2"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add SOP
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="border-bottom">
                <tr className="text-muted">
                  <th>Sr No</th>
                  <th>Stage</th>
                  <th>Model</th>
                  <th>Media Type</th>
                  <th>Media Name</th>
                  <th>Added At</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSops.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      {
                        stageMaster.find(
                          (s) => s.stage_id === row.stage_id
                        )?.stage_name
                      }
                    </td>
                    <td>
                      {
                        modelMaster.find(
                          (m) => m.model_id === row.model_id
                        )?.model_name
                      }
                    </td>
                    <td>{row.media_type}</td>
                    <td>{row.media_name}</td>
                    <td>{row.added_at}</td>
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
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSops.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
          <div className="bg-white rounded-4 shadow" style={{ width: 450 }}>
            <div className="d-flex justify-content-between p-3 border-bottom">
              <h5>{isEditing ? "Edit SOP" : "Add SOP"}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            <div className="p-3">
              <div className="mb-3">
                <label className="form-label">Stage</label>
                <select
                  className="form-select"
                  value={formData.stage_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stage_id: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Stage</option>
                  {stageMaster.map((s) => (
                    <option key={s.stage_id} value={s.stage_id}>
                      {s.stage_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Model</label>
                <select
                  className="form-select"
                  value={formData.model_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      model_id: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Model</option>
                  {modelMaster.map((m) => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.model_name}
                    </option>
                  ))}
                </select>
              </div>

              {["media_type", "media_name"].map((k) => (
                <div className="mb-3" key={k}>
                  <label className="form-label">
                    {k.replace("_", " ").toUpperCase()}
                  </label>
                  <input
                    className="form-control"
                    value={formData[k]}
                    onChange={(e) =>
                      setFormData({ ...formData, [k]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end gap-2 p-3 border-top">
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
          <div className="bg-white rounded-4 shadow" style={{ width: 420 }}>
            <div className="d-flex justify-content-between p-3 border-bottom">
              <h5>SOP Details</h5>
              <button className="btn-close" onClick={() => setShowView(false)} />
            </div>

            <div className="p-3">
              <p><strong>Stage:</strong> {
                stageMaster.find(s => s.stage_id === viewData.stage_id)?.stage_name
              }</p>
              <p><strong>Model:</strong> {
                modelMaster.find(m => m.model_id === viewData.model_id)?.model_name
              }</p>
              <p><strong>Media Type:</strong> {viewData.media_type}</p>
              <p><strong>Media Name:</strong> {viewData.media_name}</p>
              <p><strong>Added By:</strong> {viewData.added_by}</p>
              <p><strong>Added At:</strong> {viewData.added_at}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SopMaster;
