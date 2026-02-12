import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config"; // adjust if needed

const emptyForm = {
  plant_code: "",
  plant_name: "",
  location: "",
  time_zone: "",
   working_calendar: {}, 
};

const PlantMaster = () => {
  const [allPlants, setAllPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarRows, setCalendarRows] = useState([]);


  const [filters, setFilters] = useState({
    plant_code: "",
    plant_name: "",
    location: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* =====================================================
     GET : FETCH PLANTS
  ===================================================== */
  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/plantmaster`);
      setAllPlants(res.data || []);
    } catch (err) {
      console.error("Failed to fetch plants", err);
      alert("Failed to load plant data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */
  const filteredPlants = useMemo(() => {
    return allPlants.filter(
      (p) =>
        p.plant_code
          ?.toString()
          .includes(filters.plant_code) &&
        p.plant_name
          ?.toLowerCase()
          .includes(filters.plant_name.toLowerCase()) &&
        p.location
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
    );
  }, [allPlants, filters]);

  /* =====================================================
     HANDLERS
  ===================================================== */
const handleAdd = () => {
  setIsEditing(false);
  setFormData(emptyForm);
  setCalendarRows([]);
  setShowModal(true);
};

 const handleEdit = (row) => {
  setIsEditing(true);
  setFormData(row);
  setCalendarRows(
    row.working_calendar
      ? Object.entries(row.working_calendar)
      : []
  );
  setShowModal(true);
};
const addCalendarRow = () => {
  setCalendarRows([...calendarRows, ["", ""]]);
};

const updateCalendarKey = (i, key) => {
  const rows = [...calendarRows];
  rows[i][0] = key;
  setCalendarRows(rows);
};

const updateCalendarValue = (i, value) => {
  const rows = [...calendarRows];
  rows[i][1] = value;
  setCalendarRows(rows);
};

const removeCalendarRow = (i) => {
  setCalendarRows(calendarRows.filter((_, idx) => idx !== i));
};


  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  /* =====================================================
     POST / PUT
  ===================================================== */
const handleSave = async () => {
  try {
    const working_calendar = {};

    calendarRows.forEach(([k, v]) => {
      if (!k) return;
      working_calendar[k] = v
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    });

    const payload = {
      ...formData,
      working_calendar,
    };

    if (isEditing) {
      await axios.put(
        `${API_BASE_URL}/api/plantmaster/${formData.plant_id}`,
        payload
      );
    } else {
      await axios.post(
        `${API_BASE_URL}/api/plantmaster`,
        payload
      );
    }

    setShowModal(false);
    fetchPlants();
  } catch (err) {
    console.error("Save failed", err.response?.data || err);
    alert("Failed to save plant");
  }
};


  /* =====================================================
     DELETE
  ===================================================== */
  const handleDelete = async (plant_id) => {
    if (!window.confirm("Delete this plant?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/plantmaster/${plant_id}`
      );
      fetchPlants();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete plant");
    }
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
          <h4 className="fw-bold mb-1">Plant Master</h4>
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <input
            className="form-control"
            placeholder="Plant Code"
            style={{ width: 160 }}
            value={filters.plant_code}
            onChange={(e) =>
              setFilters({ ...filters, plant_code: e.target.value })
            }
          />

          <input
            className="form-control"
            placeholder="Plant Name"
            style={{ width: 180 }}
            value={filters.plant_name}
            onChange={(e) =>
              setFilters({ ...filters, plant_name: e.target.value })
            }
          />

          <input
            className="form-control"
            placeholder="Location"
            style={{ width: 160 }}
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
          />

          <button
            className="btn btn-sm"
            style={{ background: "#d3e7f3" }}
            onClick={() =>
              setFilters({
                plant_code: "",
                plant_name: "",
                location: "",
              })
            }
          >
            <RotateCcw size={14} />
          </button>

          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={handleAdd}
          >
            <Plus size={14} />
            Add Plant
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
            <th>Plant Code</th>
            <th>Plant Name</th>
            <th>Location</th>
            <th>Time Zone</th>
            <th>Working Calendar</th>
            <th>Created At</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="8" className="text-center py-4">
                Loading...
              </td>
            </tr>
          )}

          {!loading &&
            filteredPlants.map((row, i) => (
              <tr key={row.plant_id}>
                <td>{i + 1}</td>
                <td>{row.plant_code}</td>
                <td>{row.plant_name}</td>
                <td>{row.location}</td>
                <td>{row.time_zone}</td>
                <td>
                  {typeof row.working_calendar === "object"
                    ? Object.entries(row.working_calendar).map(
                        ([k, v]) => `${k}: ${v}`
                      ).join(", ")
                    : row.working_calendar}
                </td>
                <td>
                  {row.created_at
                    ? new Date(row.created_at).toLocaleString()
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
                    onClick={() => handleDelete(row.plant_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

          {!loading && filteredPlants.length === 0 && (
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
        <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
          <h5 className="mb-3">
            {isEditing ? "Edit Plant" : "Add Plant"}
          </h5>

          {[
            { k: "plant_code", l: "Plant Code" },
            { k: "plant_name", l: "Plant Name" },
            { k: "location", l: "Location" },
            { k: "time_zone", l: "Time Zone" },
            
          ].map(({ k, l }) => (
            <div className="mb-2" key={k}>
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
{/* ================= WORKING CALENDAR ================= */}
<div className="mt-3">
  <strong className="text-muted">Working Calendar</strong>

  {calendarRows.map(([key, value], i) => (
    <div key={i} className="d-flex gap-2 mt-2">
      <input
        className="form-control"
        placeholder="Key (e.g. weekly_off)"
        value={key}
        onChange={(e) => updateCalendarKey(i, e.target.value)}
      />
      <input
        className="form-control"
        placeholder="Value (comma separated)"
        value={value}
        onChange={(e) => updateCalendarValue(i, e.target.value)}
      />
      <button
        className="btn btn-outline-danger btn-sm"
        onClick={() => removeCalendarRow(i)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  ))}

  <button
    className="btn btn-outline-primary btn-sm mt-2"
    onClick={addCalendarRow}
    style={{ fontSize: 18 }}
  >
    +
  </button>
</div>

          <div className="d-flex justify-content-end gap-2 mt-3">
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

    {/* ================= VIEW MODAL (FIXED) ================= */}
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
          <h5 className="mb-3">Plant Details</h5>

          <div className="d-flex flex-column gap-2">
            {Object.entries(viewData).map(([k, v]) => (
              <div
                key={k}
                className="d-flex justify-content-between align-items-start"
              >
                <strong className="text-muted">
                  {k.replace(/_/g, " ")}
                </strong>
                <span className="text-end">
                  {typeof v === "object" && v !== null
                    ? Object.entries(v).map(
                        ([ik, iv]) => `${ik}: ${iv}`
                      ).join(", ")
                    : String(v)}
                </span>
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

export default PlantMaster;
