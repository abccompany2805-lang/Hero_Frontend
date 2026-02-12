// import { useState, useEffect, useMemo } from "react";
// import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
// import axios from "axios";
// import API_BASE_URL from "../../config";

// const emptyForm = {
//   stage_no: "",
//   stage_code: "",
//   stage_name: "",
//   line_id: "",
//   stage_type: "",
//   mandatory: false,
//   status: true,
// };

// const StageMaster = () => {
//   const [allStages, setAllStages] = useState([]);
//   const [lines, setLines] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [filters, setFilters] = useState({
//     stage_no: "",
//     stage_name: "",
//     line_id: "",
//   });

//   const [formData, setFormData] = useState(emptyForm);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showView, setShowView] = useState(false);
//   const [viewData, setViewData] = useState(null);

//   /* =====================================================
//      FETCH LINES (FOR DROPDOWN)
//   ===================================================== */
//   const fetchLines = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/linemaster`);
//       setLines(res.data || []);
//     } catch (err) {
//       console.error("Failed to load lines", err);
//     }
//   };

//   /* =====================================================
//      FETCH STAGES
//   ===================================================== */
//   const fetchStages = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_BASE_URL}/api/stagemaster`);
//       setAllStages(res.data || []);
//     } catch (err) {
//       console.error("Failed to load stages", err);
//       alert("Failed to load stage data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLines();
//     fetchStages();
//   }, []);

//   /* =====================================================
//      HELPERS
//   ===================================================== */
//   const getLineName = (line_id) => {
//     return lines.find((l) => l.line_id === line_id)?.line_name || "-";
//   };

//   /* =====================================================
//      FILTER
//   ===================================================== */
//   const filteredStages = useMemo(() => {
//     return allStages.filter(
//       (s) =>
//         s.stage_no
//           ?.toString()
//           .includes(filters.stage_no) &&
//         s.stage_name
//           ?.toLowerCase()
//           .includes(filters.stage_name.toLowerCase()) &&
//         (filters.line_id
//           ? String(s.line_id) === filters.line_id
//           : true)
//     );
//   }, [allStages, filters]);

//   /* =====================================================
//      HANDLERS
//   ===================================================== */
//   const handleAdd = () => {
//     setIsEditing(false);
//     setFormData(emptyForm);
//     setShowModal(true);
//   };

//   const handleEdit = (row) => {
//     setIsEditing(true);
//     setFormData(row);
//     setShowModal(true);
//   };

//   const handleView = (row) => {
//     setViewData(row);
//     setShowView(true);
//   };

//   /* =====================================================
//      POST / PUT
//   ===================================================== */
//   const handleSave = async () => {
//     try {
//       const payload = {
//         ...formData,
//         stage_no: Number(formData.stage_no),
//         line_id: Number(formData.line_id),
//       };

//       if (isEditing) {
//         await axios.put(
//           `${API_BASE_URL}/api/stagemaster/${formData.stage_id}`,
//           payload
//         );
//       } else {
//         await axios.post(
//           `${API_BASE_URL}/api/stagemaster`,
//           payload
//         );
//       }

//       setShowModal(false);
//       fetchStages();
//     } catch (err) {
//       console.error("Save failed", err);
//       alert("Failed to save stage");
//     }
//   };

//   /* =====================================================
//      DELETE
//   ===================================================== */
//   const handleDelete = async (stage_id) => {
//     if (!window.confirm("Delete this stage?")) return;

//     try {
//       await axios.delete(
//         `${API_BASE_URL}/api/stagemaster/${stage_id}`
//       );
//       fetchStages();
//     } catch (err) {
//       console.error("Delete failed", err);
//       alert("Failed to delete stage");
//     }
//   };

//   return (
//     <div className="container-fluid py-4">

//       {/* ================= HEADER ================= */}
//       <div className="card shadow-sm border-0 rounded-4 mb-4">
//         <div className="card-body">
//           <h4 className="fw-bold mb-1">Stage Master</h4>
//           <small className="text-muted">
//             Manage stage configuration and line mapping
//           </small>
//         </div>
//       </div>

//       {/* ================= FILTERS ================= */}
//       <div className="d-flex justify-content-end gap-3 flex-wrap mb-3">
//         <input
//           className="form-control"
//           placeholder="Stage No"
//           value={filters.stage_no}
//           onChange={(e) =>
//             setFilters({ ...filters, stage_no: e.target.value })
//           }
//           style={{ width: 200 }}
//         />

//         <input
//           className="form-control"
//           placeholder="Stage Name"
//           value={filters.stage_name}
//           onChange={(e) =>
//             setFilters({ ...filters, stage_name: e.target.value })
//           }
//           style={{ width: 220 }}
//         />

//         <select
//           className="form-control"
//           value={filters.line_id}
//           onChange={(e) =>
//             setFilters({ ...filters, line_id: e.target.value })
//           }
//           style={{ width: 220 }}
//         >
//           <option value="">All Lines</option>
//           {lines.map((l) => (
//             <option key={l.line_id} value={l.line_id}>
//               {l.line_name}
//             </option>
//           ))}
//         </select>

//         <button
//           className="btn btn-warning btn-sm"
//           onClick={() =>
//             setFilters({
//               stage_no: "",
//               stage_name: "",
//               line_id: "",
//             })
//           }
//         >
//           <RotateCcw size={14} />
//         </button>

//         <button
//           className="btn btn-danger btn-sm d-flex align-items-center gap-2"
//           onClick={handleAdd}
//         >
//           <Plus size={14} />
//           Add Stage
//         </button>
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="table-responsive card shadow-sm border-0 rounded-4">
//         <table className="table align-middle mb-0">
//           <thead className="border-bottom">
//             <tr className="text-muted">
//               <th>Sr</th>
//               <th>Stage No</th>
//               <th>Stage Code</th>
//               <th>Stage Name</th>
//               <th>Line</th>
//               <th>Stage Type</th>
//               <th>Mandatory</th>
//               <th>Status</th>
//               <th className="text-end">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan="9" className="text-center py-4">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading &&
//               filteredStages.map((row, i) => (
//                 <tr key={row.stage_id}>
//                   <td>{i + 1}</td>
//                   <td>{row.stage_no}</td>
//                   <td>{row.stage_code}</td>
//                   <td>{row.stage_name}</td>
//                   <td>{getLineName(row.line_id)}</td>
//                   <td>{row.stage_type}</td>
//                   <td>{row.mandatory ? "Yes" : "No"}</td>
//                   <td>
//                     <span
//                       className={`badge ${
//                         row.status ? "bg-success" : "bg-danger"
//                       }`}
//                     >
//                       {row.status ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td className="text-end">
//                     <button
//                       className="btn btn-outline-secondary btn-sm me-2"
//                       onClick={() => handleView(row)}
//                     >
//                       <Eye size={14} />
//                     </button>
//                     <button
//                       className="btn btn-outline-primary btn-sm me-2"
//                       onClick={() => handleEdit(row)}
//                     >
//                       <Pencil size={14} />
//                     </button>
//                     <button
//                       className="btn btn-outline-danger btn-sm"
//                       onClick={() => handleDelete(row.stage_id)}
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//             {!loading && filteredStages.length === 0 && (
//               <tr>
//                 <td colSpan="9" className="text-center text-muted py-4">
//                   No records found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ================= ADD / EDIT MODAL ================= */}
//       {showModal && (
//                 <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1050,
//           }}>
//           <div className="bg-white rounded-4 shadow p-3" style={{ width: 480 }}>
//             <h5>{isEditing ? "Edit Stage" : "Add Stage"}</h5>

//             <div className="mb-3">
//               <label className="form-label">Line</label>
//               <select
//                 className="form-control"
//                 value={formData.line_id}
//                 onChange={(e) =>
//                   setFormData({ ...formData, line_id: e.target.value })
//                 }
//               >
//                 <option value="">Select Line</option>
//                 {lines.map((l) => (
//                   <option key={l.line_id} value={l.line_id}>
//                     {l.line_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {[
//               { k: "stage_no", l: "Stage No" },
//               { k: "stage_code", l: "Stage Code" },
//               { k: "stage_name", l: "Stage Name" },
//               { k: "stage_type", l: "Stage Type" },
//             ].map(({ k, l }) => (
//               <div className="mb-3" key={k}>
//                 <label className="form-label">{l}</label>
//                 <input
//                   className="form-control"
//                   disabled={k === "stage_no" && isEditing}
//                   value={formData[k]}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       [k]: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             ))}

//             <div className="form-check mb-2">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 checked={formData.mandatory}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     mandatory: e.target.checked,
//                   })
//                 }
//               />
//               <label className="form-check-label">
//                 Mandatory Stage
//               </label>
//             </div>

//             <div className="form-check mb-3">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 checked={formData.status}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     status: e.target.checked,
//                   })
//                 }
//               />
//               <label className="form-check-label">
//                 Active
//               </label>
//             </div>

//             <div className="d-flex justify-content-end gap-2">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowModal(false)}
//               >
//                 Cancel
//               </button>
//               <button className="btn btn-danger" onClick={handleSave}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= VIEW MODAL ================= */}
//       {showView && viewData && (
//                <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1050,
//           }}>
//           <div className="bg-white rounded-4 shadow p-3" style={{ width: 420 }}>
//             <h5>Stage Details</h5>
//             {Object.entries(viewData).map(([k, v]) => (
//               <div key={k}>
//                 <strong>{k.replace(/_/g, " ")}:</strong>{" "}
//                 {k === "line_id" ? getLineName(v) : String(v)}
//               </div>
//             ))}
//             <button
//               className="btn btn-secondary mt-3"
//               onClick={() => setShowView(false)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default StageMaster;


import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  stage_no: "",
  stage_code: "",
  stage_name: "",
  line_id: "",
  stage_type: "",
  mandatory: false,
  status: true,
};

const StageMaster = () => {
  const [allStages, setAllStages] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    stage_no: "",
    stage_name: "",
    line_id: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */
  const fetchLines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/linemaster`);
      setLines(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/stagemaster`);
      setAllStages(res.data || []);
    } catch (e) {
      alert("Failed to load stages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
    fetchStages();
  }, []);

  const getLineName = (line_id) =>
    lines.find((l) => l.line_id === line_id)?.line_name || "-";

  /* ================= FILTER ================= */
  const filteredStages = useMemo(() => {
    return allStages.filter(
      (s) =>
        s.stage_no?.toString().includes(filters.stage_no) &&
        s.stage_name
          ?.toLowerCase()
          .includes(filters.stage_name.toLowerCase()) &&
        (filters.line_id ? String(s.line_id) === filters.line_id : true)
    );
  }, [allStages, filters]);

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
      const payload = {
        ...formData,
        stage_no: Number(formData.stage_no),
        line_id: Number(formData.line_id),
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/stagemaster/${formData.stage_id}`,
          payload
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/stagemaster`, payload);
      }

      setShowModal(false);
      fetchStages();
    } catch (e) {
      alert("Save failed");
    }
  };

  const handleDelete = async (stage_id) => {
    if (!window.confirm("Delete this stage?")) return;
    await axios.delete(`${API_BASE_URL}/api/stagemaster/${stage_id}`);
    fetchStages();
  };

  return (
    <div className="container-fluid py-3">

      {/* ================= HEADER + FILTERS ================= */}
<div
   className="card shadow-sm rounded-4 mb-2 mx-2"
  style={{
    borderLeft: "5px solid #dc3545",
    borderTop: "0",
    borderRight: "0",
    borderBottom: "0",
  }}
>

        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">

          <div>
            <h4 className="fw-bold mb-1">Stage Master</h4>
            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Stage No"
              style={{ width: 120 }}
              value={filters.stage_no}
              onChange={(e) =>
                setFilters({ ...filters, stage_no: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Stage Name"
              style={{ width: 180 }}
              value={filters.stage_name}
              onChange={(e) =>
                setFilters({ ...filters, stage_name: e.target.value })
              }
            />

            <select
              className="form-control"
              style={{ width: 180 }}
              value={filters.line_id}
              onChange={(e) =>
                setFilters({ ...filters, line_id: e.target.value })
              }
            >
              <option value="">All Lines</option>
              {lines.map((l) => (
                <option key={l.line_id} value={l.line_id}>
                  {l.line_name}
                </option>
              ))}
            </select>

            <button
              className="btn  btn-sm" style={{background: "#d3e7f3", }}
              onClick={() =>
                setFilters({ stage_no: "", stage_name: "", line_id: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Stage
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
              <th>Stage No</th>
              <th>Stage Code</th>
              <th>Stage Name</th>
              <th>Line</th>
              <th>Stage Type</th>
              <th>Mandatory</th>
              <th>Status</th>
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
              filteredStages.map((row, i) => (
                <tr key={row.stage_id}>
                  <td>{i + 1}</td>
                  <td>{row.stage_no}</td>
                  <td>{row.stage_code}</td>
                  <td>{row.stage_name}</td>
                  <td>{getLineName(row.line_id)}</td>
                  <td>{row.stage_type}</td>
                  <td>{row.mandatory ? "Yes" : "No"}</td>
                  <td>
                    <span
                      className={`badge ${
                        row.status ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {row.status ? "Active" : "Inactive"}
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
                      onClick={() => handleDelete(row.stage_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredStages.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            <h5 className="mb-3">Stage Details</h5>

            <div className="d-flex flex-column gap-2">
              {Object.entries(viewData).map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between">
                  <strong className="text-muted">
                    {k.replace(/_/g, " ")}
                  </strong>
                  <span>
                    {k === "line_id" ? getLineName(v) : String(v)}
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
        {isEditing ? "Edit Stage" : "Add Stage"}
      </h5>

      {/* Line */}
      <div className="mb-2">
        <label className="form-label">Line</label>
        <select
          className="form-control"
          value={formData.line_id}
          onChange={(e) =>
            setFormData({ ...formData, line_id: e.target.value })
          }
        >
          <option value="">Select Line</option>
          {lines.map((l) => (
            <option key={l.line_id} value={l.line_id}>
              {l.line_name}
            </option>
          ))}
        </select>
      </div>

      {/* Stage fields */}
      {[
        { key: "stage_no", label: "Stage No" },
        { key: "stage_code", label: "Stage Code" },
        { key: "stage_name", label: "Stage Name" },
        { key: "stage_type", label: "Stage Type" },
      ].map(({ key, label }) => (
        <div className="mb-2" key={key}>
          <label className="form-label">{label}</label>
          <input
            className="form-control"
            disabled={key === "stage_no" && isEditing}
            value={formData[key]}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
          />
        </div>
      ))}

      {/* Mandatory */}
      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.mandatory}
          onChange={(e) =>
            setFormData({ ...formData, mandatory: e.target.checked })
          }
        />
        <label className="form-check-label">
          Mandatory Stage
        </label>
      </div>

      {/* Status */}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.checked })
          }
        />
        <label className="form-check-label">
          Active
        </label>
      </div>

      {/* Actions */}
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

    </div>
  );
};

export default StageMaster;
