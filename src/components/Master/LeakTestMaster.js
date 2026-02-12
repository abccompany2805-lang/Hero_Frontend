import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";

/* ================= EMPTY FORM ================= */
const emptyForm = {
  stage_id: "",
  pressure_limit: "",
  cycle_time: "",
};

/* ================= STAGE MASTER (Mock) ================= */
/* Replace with API later */
const stageMaster = [
  { stage_id: 1, stage_name: "Engine Fitment" },
  { stage_id: 2, stage_name: "Leak Test Station" },
  { stage_id: 3, stage_name: "Final Inspection" },
];

const LeakTestMaster = () => {
  const [records, setRecords] = useState([
    {
      id: 1,
      stage_id: 2,
      pressure_limit: "5 bar",
      cycle_time: "30 sec",
      created_by: "Admin",
      created_at: "22-01-2026 12:20:15",
    },
  ]);

  const [filters, setFilters] = useState({
    stage: "",
    pressure_limit: "",
    cycle_time: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FILTER LOGIC ================= */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const stageName =
        stageMaster.find((s) => s.stage_id === r.stage_id)?.stage_name || "";

      return (
        stageName.toLowerCase().includes(filters.stage.toLowerCase()) &&
        r.pressure_limit
          .toLowerCase()
          .includes(filters.pressure_limit.toLowerCase()) &&
        r.cycle_time
          .toLowerCase()
          .includes(filters.cycle_time.toLowerCase())
      );
    });
  }, [records, filters]);

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
      setRecords((prev) =>
        prev.map((r) =>
          r.id === formData.id ? { ...r, ...formData } : r
        )
      );
    } else {
      setRecords((prev) => [
        ...prev,
        {
          ...formData,
          id: Date.now(),
          created_by: "Admin",
          created_at: now,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this record?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
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
            <h4 className="fw-bold mb-1">Leak Test Master</h4>
            <small className="text-muted">
              Configure leak test pressure and cycle time
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
              { key: "pressure_limit", placeholder: "Pressure Limit" },
              { key: "cycle_time", placeholder: "Cycle Time" },
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
                  stage: "",
                  pressure_limit: "",
                  cycle_time: "",
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
              Add Leak Test
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="border-bottom">
                <tr className="text-muted">
                  <th>Sr No</th>
                  <th>Stage</th>
                  <th>Pressure Limit</th>
                  <th>Cycle Time</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      {
                        stageMaster.find(
                          (s) => s.stage_id === row.stage_id
                        )?.stage_name
                      }
                    </td>
                    <td>{row.pressure_limit}</td>
                    <td>{row.cycle_time}</td>
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
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
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
          <div className="bg-white rounded-4 shadow" style={{ width: 420 }}>
            <div className="d-flex justify-content-between p-3 border-bottom">
              <h5>{isEditing ? "Edit Leak Test" : "Add Leak Test"}</h5>
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

              {[
                { k: "pressure_limit", l: "Pressure Limit" },
                { k: "cycle_time", l: "Cycle Time" },
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
          <div className="bg-white rounded-4 shadow" style={{ width: 400 }}>
            <div className="d-flex justify-content-between p-3 border-bottom">
              <h5>Leak Test Details</h5>
              <button className="btn-close" onClick={() => setShowView(false)} />
            </div>

            <div className="p-3">
              <p>
                <strong>Stage:</strong>{" "}
                {
                  stageMaster.find(
                    (s) => s.stage_id === viewData.stage_id
                  )?.stage_name
                }
              </p>
              <p>
                <strong>Pressure Limit:</strong> {viewData.pressure_limit}
              </p>
              <p>
                <strong>Cycle Time:</strong> {viewData.cycle_time}
              </p>
              <p>
                <strong>Created By:</strong> {viewData.created_by}
              </p>
              <p>
                <strong>Created At:</strong> {viewData.created_at}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeakTestMaster;
