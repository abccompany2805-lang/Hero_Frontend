import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";

const emptyForm = {
  stage_id: "",
  part_id: "",
  scan_type: "",
  is_mandatory: false,
};

const PartScanningMaster = () => {
  // 🔹 Dummy master data (replace with API later)
  const stages = [
    { stage_id: "1", stage_name: "Engine Fitment" },
    { stage_id: "2", stage_name: "Torque Station" },
  ];

  const parts = [
    { part_id: "P1", part_name: "Engine Block" },
    { part_id: "P2", part_name: "Crank Shaft" },
  ];

  const [allMappings, setAllMappings] = useState([
    {
      stage_id: "1",
      stage_name: "Engine Fitment",
      part_id: "P1",
      part_name: "Engine Block",
      scan_type: "QR",
      is_mandatory: true,
      created_at: "22-01-2026 07:17:18",
      updated_at: "22-01-2026 07:17:18",
    },
  ]);

  const [filters, setFilters] = useState({
    stage_name: "",
    part_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Filter logic
  const filteredMappings = useMemo(() => {
    return allMappings.filter(
      (m) =>
        m.stage_name
          .toLowerCase()
          .includes(filters.stage_name.toLowerCase()) &&
        m.part_name
          .toLowerCase()
          .includes(filters.part_name.toLowerCase())
    );
  }, [allMappings, filters]);

  // 🔹 Handlers
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

  const handleSave = () => {
    const now = new Date().toLocaleString("en-GB");

    const stage = stages.find((s) => s.stage_id === formData.stage_id);
    const part = parts.find((p) => p.part_id === formData.part_id);

    if (isEditing) {
      setAllMappings((prev) =>
        prev.map((m) =>
          m.stage_id === formData.stage_id &&
          m.part_id === formData.part_id
            ? {
                ...m,
                ...formData,
                stage_name: stage?.stage_name,
                part_name: part?.part_name,
                updated_at: now,
              }
            : m
        )
      );
    } else {
      setAllMappings((prev) => [
        ...prev,
        {
          ...formData,
          stage_name: stage?.stage_name,
          part_name: part?.part_name,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (row) => {
    if (window.confirm("Delete this mapping?")) {
      setAllMappings((prev) =>
        prev.filter(
          (m) =>
            !(
              m.stage_id === row.stage_id &&
              m.part_id === row.part_id
            )
        )
      );
    }
  };

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
            <h4 className="fw-bold mb-1">Part Scanning Master</h4>
            <small className="text-muted">
              Configure part scanning rules per stage
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
              { key: "stage_name", placeholder: "Stage Name" },
              { key: "part_name", placeholder: "Part Name" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                className="form-control"
                placeholder={placeholder}
                value={filters[key]}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
                style={{ width: "220px", transition: "0.2s" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.boxShadow =
                    "0 0 0 0.15rem rgba(220,38,38,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ced4da";
                  e.target.style.boxShadow = "none";
                }}
              />
            ))}

            <button
              className="btn btn-warning btn-sm d-flex align-items-center"
              style={{ height: "32px" }}
              onClick={() =>
                setFilters({ stage_name: "", part_name: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-2"
              style={{ height: "32px" }}
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Mapping
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="border-bottom">
                <tr className="text-muted">
                  <th>Sr No</th>
                  <th>Stage Name</th>
                  <th>Part Name</th>
                  <th>Scan Type</th>
                  <th>Mandatory</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((row, index) => (
                  <tr key={`${row.stage_id}-${row.part_id}`}>
                    <td>{index + 1}</td>
                    <td>{row.stage_name}</td>
                    <td>{row.part_name}</td>
                    <td>{row.scan_type}</td>
                    <td>
                      {row.is_mandatory ? "Yes" : "No"}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEdit(row)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMappings.length === 0 && (
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
          <div className="bg-white rounded-4 shadow" style={{ width: 450 }}>
            <div className="d-flex justify-content-between p-3 border-bottom">
              <h5>{isEditing ? "Edit Mapping" : "Add Mapping"}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            <div className="p-3">
              {/* Stage */}
              <div className="mb-3">
                <label className="form-label">Stage</label>
                <select
                  className="form-control"
                  disabled={isEditing}
                  value={formData.stage_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stage_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select Stage</option>
                  {stages.map((s) => (
                    <option key={s.stage_id} value={s.stage_id}>
                      {s.stage_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Part */}
              <div className="mb-3">
                <label className="form-label">Part</label>
                <select
                  className="form-control"
                  disabled={isEditing}
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
                      {p.part_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scan Type */}
              <div className="mb-3">
                <label className="form-label">Scan Type</label>
                <input
                  className="form-control"
                  value={formData.scan_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scan_type: e.target.value,
                    })
                  }
                />
              </div>

              {/* Mandatory */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.is_mandatory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_mandatory: e.target.checked,
                    })
                  }
                />
                <label className="form-check-label">
                  Is Mandatory
                </label>
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

    </div>
  );
};

export default PartScanningMaster;
