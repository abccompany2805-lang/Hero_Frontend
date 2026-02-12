import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";

/* ================= EMPTY FORM ================= */
const emptyForm = {
  tool_name: "",
  tool_type: "",
  stage_id: "",
  make_model: "",
  ip_address: "",
};

/* ================= STAGE MASTER (Mock) ================= */
/* Replace later with API */
const stageMaster = [
  { stage_id: 1, stage_name: "Engine Fitment" },
  { stage_id: 2, stage_name: "Torque Tightening" },
  { stage_id: 3, stage_name: "Final Inspection" },
];

const DCToolMaster = () => {
  const [tools, setTools] = useState([
    {
      tool_id: 1,
      tool_name: "Desoutter DC Tool",
      tool_type: "DC Tool",
      stage_id: 2,
      make_model: "Desoutter CVI3",
      ip_address: "192.168.1.50",
      created_by: "Admin",
      created_at: "22-01-2026 11:10:30",
    },
  ]);

  const [filters, setFilters] = useState({
    tool_name: "",
    tool_type: "",
    stage: "",
    ip_address: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FILTER LOGIC ================= */
  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      const stageName =
        stageMaster.find((s) => s.stage_id === t.stage_id)?.stage_name || "";

      return (
        t.tool_name.toLowerCase().includes(filters.tool_name.toLowerCase()) &&
        t.tool_type.toLowerCase().includes(filters.tool_type.toLowerCase()) &&
        stageName.toLowerCase().includes(filters.stage.toLowerCase()) &&
        t.ip_address.toLowerCase().includes(filters.ip_address.toLowerCase())
      );
    });
  }, [tools, filters]);

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
      setTools((prev) =>
        prev.map((t) =>
          t.tool_id === formData.tool_id ? { ...t, ...formData } : t
        )
      );
    } else {
      setTools((prev) => [
        ...prev,
        {
          ...formData,
          tool_id: Date.now(),
          created_by: "Admin",
          created_at: now,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this tool?")) {
      setTools((prev) => prev.filter((t) => t.tool_id !== id));
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
            <h4 className="fw-bold mb-1">DC Tool Master</h4>
            <small className="text-muted">
              Manage DC tools and stage mapping
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
              { key: "tool_name", placeholder: "Tool Name" },
              { key: "tool_type", placeholder: "Tool Type" },
              { key: "stage", placeholder: "Stage Name" },
              { key: "ip_address", placeholder: "IP Address" },
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
                setFilters({
                  tool_name: "",
                  tool_type: "",
                  stage: "",
                  ip_address: "",
                })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-2"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Tool
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="border-bottom">
                <tr className="text-muted">
                  <th>Sr No</th>
                  <th>Tool Name</th>
                  <th>Tool Type</th>
                  <th>Stage</th>
                  <th>IP Address</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((row, index) => (
                  <tr key={row.tool_id}>
                    <td>{index + 1}</td>
                    <td>{row.tool_name}</td>
                    <td>{row.tool_type}</td>
                    <td>
                      {
                        stageMaster.find(
                          (s) => s.stage_id === row.stage_id
                        )?.stage_name
                      }
                    </td>
                    <td>{row.ip_address}</td>
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
                        onClick={() => handleDelete(row.tool_id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTools.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
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
          <div className="bg-white rounded-4 shadow" style={{ width: 460 }}>
            <div className="d-flex justify-content-between p-3 border-bottom">
              <h5>{isEditing ? "Edit DC Tool" : "Add DC Tool"}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            <div className="p-3">
              {[
                { k: "tool_name", l: "Tool Name" },
                { k: "tool_type", l: "Tool Type" },
                { k: "make_model", l: "Make / Model" },
                { k: "ip_address", l: "IP Address" },
              ].map(({ k, l }) => (
                <div className="mb-3" key={k}>
                  <label className="form-label">{l}</label>
                  <input
                    className="form-control"
                    value={formData[k]}
                    onChange={(e) =>
                      setFormData({ ...formData, [k]: e.target.value })
                    }
                  />
                </div>
              ))}

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
              <h5>DC Tool Details</h5>
              <button className="btn-close" onClick={() => setShowView(false)} />
            </div>

            <div className="p-3">
              <p><strong>Tool Name:</strong> {viewData.tool_name}</p>
              <p><strong>Tool Type:</strong> {viewData.tool_type}</p>
              <p><strong>Stage:</strong> {
                stageMaster.find(s => s.stage_id === viewData.stage_id)?.stage_name
              }</p>
              <p><strong>Make / Model:</strong> {viewData.make_model}</p>
              <p><strong>IP Address:</strong> {viewData.ip_address}</p>
              <p><strong>Created By:</strong> {viewData.created_by}</p>
              <p><strong>Created At:</strong> {viewData.created_at}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DCToolMaster;
