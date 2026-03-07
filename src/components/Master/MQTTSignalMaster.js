// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
// import API_BASE_URL from "../../config";

// const MQTT_SIGNAL_API = `${API_BASE_URL}/api/mqtt-signal`;
// const STAGE_API = `${API_BASE_URL}/api/stages`;
// const LOGICAL_NAME_API = `${API_BASE_URL}/api/logical-names`;

// const emptyForm = {
//   mqtt_signal_id: "",
//   stage_id: "",
//   stage_no: "",
//   logical_name: "",
//   topic: "",
//   payload_format: "RAW",
//   json_key: "",
//   success_value: "",
//   fail_value: "",
//   active: true,
// };



// const MqttSignalMaster = () => {
//   const [signals, setSignals] = useState([]);
//   const [stages, setStages] = useState([]);

//   const [filters, setFilters] = useState({
//     stage_id: "",
//     logical_name: "",
//   });

//   const [formData, setFormData] = useState(emptyForm);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showView, setShowView] = useState(false);
//   const [viewData, setViewData] = useState(null);




//   // ================= LOAD DATA =================
//   useEffect(() => {
//     fetchAll();
//   }, []);

// const fetchAll = async () => {
//   try {
//     const [r, s, l] = await Promise.all([
//       axios.get(MQTT_SIGNAL_API),
//       axios.get(STAGE_API),
//       axios.get(LOGICAL_NAME_API),
//     ]);

//     const mqttData = Array.isArray(r.data)
//       ? r.data
//       : r.data?.data || [];

//     const stageData = Array.isArray(s.data)
//       ? s.data
//       : s.data?.data || [];

//     const logicalData = Array.isArray(l.data)
//       ? l.data
//       : l.data?.data || [];

//     setSignals(mqttData);
//     setStages(stageData);
//     setLogicalNames(logicalData);

//   } catch (err) {
//     console.error("Error loading data:", err);
//     setSignals([]);
//     setStages([]);
//     setLogicalNames([]);
//   }
// };
//   // ================= FILTER =================
// const filteredSignals = useMemo(() => {
//   if (!Array.isArray(signals)) return [];

//   return signals.filter((s) => {
//     const stageMatch = filters.stage_id
//       ? s.stage_id === filters.stage_id
//       : true;

//     const logicalMatch = s.logical_name
//       ?.toLowerCase()
//       .includes(filters.logical_name.toLowerCase());

//     return stageMatch && logicalMatch;
//   });
// }, [signals, filters]);

//   // ================= HELPERS =================
//   const getStageName = (id) => {
//     const stage = stages.find((s) => s.stage_id === id);
//     return stage ? stage.stage_name : "Unknown";
//   };


//   const [logicalNames, setLogicalNames] = useState([]);
//   // ================= CRUD =================
//   const handleAdd = () => {
//     setIsEditing(false);
//     setFormData(emptyForm);
//     setShowModal(true);
//   };

// const handleEdit = (row) => {
//   const stageObj = stages.find(
//     (s) => s.stage_id === row.stage_id
//   );

//   setIsEditing(true);
//   setFormData({
//     mqtt_signal_id: row.mqtt_signal_id,
//     stage_id: row.stage_id,
//     stage_no: stageObj?.stage_no || "",
//     logical_name: row.logical_name,
//     topic: row.topic,
//     payload_format: row.payload_format || "RAW",
//     json_key: row.json_key || "",
//     success_value: row.success_value || "",
//     fail_value: row.fail_value || "",
//     active: row.active,
//   });

//   setShowModal(true);
// };



// const handleSave = async () => {
//   if (
//     !formData.stage_id ||
//     !formData.logical_name ||
   
//     !formData.topic
//   ) {
//    alert("Stage and Logical Name are required");
//     return;
//   }

//   // ✅ ONLY send columns that exist in DB
//   const payload = {
//     stage_id: formData.stage_id,
//     logical_name: formData.logical_name.trim(),
//     topic: formData.topic.trim(),
//     payload_format: formData.payload_format || "RAW",
//     json_key: formData.json_key || null,
//     success_value: formData.success_value || null,
//     fail_value: formData.fail_value || null,
//     active: formData.active,
//   };

//   try {
//     if (isEditing) {
//       await axios.put(
//         `${MQTT_SIGNAL_API}/${formData.mqtt_signal_id}`,
//         payload
//       );
//     } else {
//       await axios.post(MQTT_SIGNAL_API, payload);
//     }

//     setShowModal(false);
//     setFormData(emptyForm);   // reset form
//     fetchAll();

//   } catch (err) {
//   console.log("FULL ERROR:", err);
//   console.log("RESPONSE DATA:", err.response?.data);

//   alert(
//     err.response?.data?.message ||
//     err.response?.data?.error ||
//     JSON.stringify(err.response?.data) ||
//     "Database Error"
//   );
// }
// };

//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this MQTT signal?")) {
//       await axios.delete(`${MQTT_SIGNAL_API}/${id}`);
//       fetchAll();
//     }
//   };

//   const handleView = (row) => {
//     setViewData(row);
//     setShowView(true);
//   };

//   // ================= UI =================
//   return (
//     <div className="container-fluid py-3">

//       {/* HEADER */}
//       <div className="card shadow-sm rounded-4 mb-3 mx-2"
//           style={{
//           borderLeft: "5px solid #dc3545",
//           borderTop: 0,
//           borderRight: 0,
//           borderBottom: 0,
//         }}>
//         <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">

//           <h4 className="fw-bold mb-0">MQTT Signal Master</h4>

//           <div className="d-flex gap-2 flex-wrap align-items-center">

//             {/* Stage Filter */}
//             <select
//               className="form-control"
//               style={{ width: 200 }}
//               value={filters.stage_id}
//               onChange={(e) =>
//                 setFilters({ ...filters, stage_id: e.target.value })
//               }
//             >
//               <option value="">All Stages</option>
//               {stages.map((s) => (
//                 <option key={s.stage_id} value={s.stage_id}>
//                   {s.stage_name}
//                 </option>
//               ))}
//             </select>

//             {/* Logical Name Filter */}
//             <input
//               className="form-control"
//               placeholder="Logical Name"
//               style={{ width: 180 }}
//               value={filters.logical_name}
//               onChange={(e) =>
//                 setFilters({
//                   ...filters,
//                   logical_name: e.target.value,
//                 })
//               }
//             />

//             <button
//               className="btn btn-sm"
//               style={{ background: "#d3e7f3" }}
//               onClick={() =>
//                 setFilters({ stage_id: "", logical_name: "" })
//               }
//             >
//               <RotateCcw size={14} />
//             </button>

//             <button
//               className="btn btn-danger btn-sm d-flex align-items-center gap-1"
//               onClick={handleAdd}
//             >
//               <Plus size={14} />
//               Add Signal
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
//         <table className="table table-bordered align-middle mb-0">
//           <thead>
//             <tr>
//               <th>Sr</th>
//               <th>Stage</th>
//               <th>Logical Name</th>
//               <th>Topic</th>
//               <th>Payload</th>
//               <th>Status</th>
//               <th className="text-end">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredSignals.map((s, i) => (
//               <tr key={s.mqtt_signal_id}>
//                 <td>{i + 1}</td>
//                 <td>{getStageName(s.stage_id)}</td>
//                 <td>{s.logical_name}</td>
//                 <td className="text-truncate" style={{ maxWidth: 260 }}>
//                   {s.topic}
//                 </td>
//                 <td>{s.payload_format}</td>
//                 <td>
//                   <span className={`badge ${s.active ? "bg-success" : "bg-secondary"}`}>
//                     {s.active ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="text-end">
//                   <button
//                     className="btn btn-outline-secondary btn-sm me-2"
//                     onClick={() => handleView(s)}
//                   >
//                     <Eye size={14} />
//                   </button>
//                   <button
//                     className="btn btn-outline-primary btn-sm me-2"
//                     onClick={() => handleEdit(s)}
//                   >
//                     <Pencil size={14} />
//                   </button>
//                   <button
//                     className="btn btn-outline-danger btn-sm"
//                     onClick={() => handleDelete(s.mqtt_signal_id)}
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {filteredSignals.length === 0 && (
//               <tr>
//                 <td colSpan="7" className="text-center text-muted py-4">
//                   No records found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       {/* ================= ADD / EDIT MODAL ================= */}
// {showModal && (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       background: "rgba(0,0,0,0.55)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1050,
//     }}
//   >
//     <div
//       className="bg-white rounded-4 shadow-lg p-4"
//       style={{ width: 560, maxHeight: "90vh", overflowY: "auto" }}
//     >
//       <h5 className="fw-bold mb-3 text-danger">
//         {isEditing ? "Edit MQTT Signal" : "Add MQTT Signal"}
//       </h5>

//       {/* Stage */}
//       <div className="mb-3">
//   <label className="form-label fw-semibold">Stage *</label>
//   <select
//     className="form-select"
//     value={formData.stage_id}
// onChange={(e) => {
//   const selectedStage = stages.find(
//     (s) => s.stage_id === e.target.value
//   );

//   const generatedTopic =
//     selectedStage?.stage_no && formData.logical_name
//       ? `ST${selectedStage.stage_no}_${formData.logical_name}`
//       : "";

//   setFormData({
//     ...formData,
//     stage_id: selectedStage.stage_id,
//     stage_no: selectedStage.stage_no,
//     topic: generatedTopic,
//   });
// }}
//   >
//     <option value="">Select Stage</option>
//     {stages.map((s) => (
//       <option key={s.stage_id} value={s.stage_id}>
//         Stage {s.stage_no} - {s.stage_name}
//       </option>
//     ))}
//   </select>
// </div>

//       {/* Logical Name */}
//       <div className="mb-3">
//         <label className="form-label fw-semibold">Logical Name *</label>
//       <select
//   className="form-select"
//   value={formData.logical_name}
//   onChange={(e) => {
//     const selectedLogical = e.target.value;

//     const generatedTopic =
//       formData.stage_no && selectedLogical
//         ? `ST${formData.stage_no}_${selectedLogical}`
//         : "";

//     setFormData({
//       ...formData,
//       logical_name: selectedLogical,
//       topic: generatedTopic,
//     });
//   }}
// >
//   <option value="">Select Logical Name</option>
//   {logicalNames.map((ln) => (
//     <option key={ln.logical_id} value={ln.logical_name}>
//       {ln.logical_name}
//     </option>
//   ))}
// </select>
//       </div>

//       {/* Topic */}
//       {/* Signal Type Dropdown */}

// <div className="mb-3">
//   <label className="form-label fw-semibold">
//     Auto Generated Topic
//   </label>
//   <input
//     type="text"
//     className="form-control bg-light"
//     value={formData.topic}
//     readOnly
//   />
// </div>
//       {/* Payload Format */}
//       <div className="mb-3">
//         <label className="form-label fw-semibold">Payload Format</label>
//         <select
//           className="form-select"
//           value={formData.payload_format}
//           onChange={(e) =>
//             setFormData({ ...formData, payload_format: e.target.value })
//           }
//         >
//           <option value="RAW">RAW</option>
//           <option value="JSON">JSON</option>
//           <option value="TEXT">TEXT</option>
//         </select>
//       </div>

//       {/* JSON Key */}
//       {formData.payload_format === "JSON" && (
//         <div className="mb-3">
//           <label className="form-label fw-semibold">JSON Key</label>
//           <input
//             type="text"
//             className="form-control"
//             placeholder="e.g. result / torque"
//             value={formData.json_key}
//             onChange={(e) =>
//               setFormData({ ...formData, json_key: e.target.value })
//             }
//           />
//         </div>
//       )}

//       {/* Success / Fail */}
//       <div className="row">
//         <div className="col-md-6 mb-3">
//           <label className="form-label fw-semibold">Success Value</label>
//           <input
//             type="text"
//             className="form-control"
//             value={formData.success_value}
//             onChange={(e) =>
//               setFormData({ ...formData, success_value: e.target.value })
//             }
//           />
//         </div>

//         <div className="col-md-6 mb-3">
//           <label className="form-label fw-semibold">Fail Value</label>
//           <input
//             type="text"
//             className="form-control"
//             value={formData.fail_value}
//             onChange={(e) =>
//               setFormData({ ...formData, fail_value: e.target.value })
//             }
//           />
//         </div>
//       </div>

//       {/* Active Toggle */}
//       <div className="form-check form-switch mb-4">
//         <input
//           className="form-check-input"
//           type="checkbox"
//           checked={formData.active}
//           onChange={(e) =>
//             setFormData({ ...formData, active: e.target.checked })
//           }
//         />
//         <label className="form-check-label fw-semibold">
//           Active Signal
//         </label>
//       </div>

//       {/* Buttons */}
//       <div className="d-flex justify-content-end gap-2">
//         <button
//           className="btn btn-secondary"
//           onClick={() => setShowModal(false)}
//         >
//           Cancel
//         </button>

//         <button className="btn btn-danger" onClick={handleSave}>
//           {isEditing ? "Update Signal" : "Save Signal"}
//         </button>
//       </div>
//     </div>
//   </div>
// )}


// {/* ================= VIEW MODAL ================= */}
// {showView && viewData && (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       background: "rgba(0,0,0,0.55)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1050,
//     }}
//   >
//     <div
//       className="bg-white rounded-4 shadow-lg p-4"
//       style={{ width: 480 }}
//     >
//       <h5 className="fw-bold mb-3 text-danger">
//         MQTT Signal Details
//       </h5>

//       <div className="mb-2">
//         <strong className="text-muted">Stage:</strong>{" "}
//         {getStageName(viewData.stage_id)}
//       </div>

//       <div className="mb-2">
//         <strong className="text-muted">Logical Name:</strong>{" "}
//         {viewData.logical_name}
//       </div>

//       <div className="mb-2">
//         <strong className="text-muted">Topic:</strong>{" "}
//         <span className="text-break">{viewData.topic}</span>
//       </div>

//       <div className="mb-2">
//         <strong className="text-muted">Payload Format:</strong>{" "}
//         {viewData.payload_format}
//       </div>

//       {viewData.payload_format === "JSON" && (
//         <div className="mb-2">
//           <strong className="text-muted">JSON Key:</strong>{" "}
//           {viewData.json_key || "-"}
//         </div>
//       )}

//       <div className="mb-2">
//         <strong className="text-muted">Success Value:</strong>{" "}
//         {viewData.success_value || "-"}
//       </div>

//       <div className="mb-2">
//         <strong className="text-muted">Fail Value:</strong>{" "}
//         {viewData.fail_value || "-"}
//       </div>

//       <div className="mb-2">
//         <strong className="text-muted">Status:</strong>{" "}
//         <span
//           className={`badge ${
//             viewData.active ? "bg-success" : "bg-secondary"
//           }`}
//         >
//           {viewData.active ? "Active" : "Inactive"}
//         </span>
//       </div>

//       <div className="text-end mt-4">
//         <button
//           className="btn btn-secondary btn-sm"
//           onClick={() => setShowView(false)}
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default MqttSignalMaster;



import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";

const MQTT_SIGNAL_API = `${API_BASE_URL}/api/mqtt-signal`;
const STAGE_API = `${API_BASE_URL}/api/stages`;
const LOGICAL_NAME_API = `${API_BASE_URL}/api/logical-names`;
const STAGE_DETAIL_BY_NO_API = `${API_BASE_URL}/api/stages/details/by-stage-no`;

const emptyForm = {
  mqtt_signal_id: "",
  stage_id: "",
  stage_no: "",
  logical_name: "",
  topic: "",
  payload_format: "RAW",
  json_key: "",
  success_value: "",
  fail_value: "",
  active: true,
};

const MqttSignalMaster = () => {
  const [signals, setSignals] = useState([]);
  const [stages, setStages] = useState([]);
  const [logicalNames, setLogicalNames] = useState([]);

  const [filters, setFilters] = useState({
    stage_id: "",
    logical_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [r, s, l] = await Promise.all([
        axios.get(MQTT_SIGNAL_API),
        axios.get(STAGE_API),
        axios.get(LOGICAL_NAME_API),
      ]);

      const mqttData = Array.isArray(r.data) ? r.data : r.data?.data || [];
      const stageData = Array.isArray(s.data) ? s.data : s.data?.data || [];
      const logicalData = Array.isArray(l.data) ? l.data : l.data?.data || [];

      setSignals(mqttData);
      setStages(stageData);
      setLogicalNames(logicalData);
    } catch (err) {
      console.error("Error loading data:", err);
      setSignals([]);
      setStages([]);
      setLogicalNames([]);
    }
  };

  // ================= FILTER =================
  const filteredSignals = useMemo(() => {
    if (!Array.isArray(signals)) return [];

    return signals.filter((s) => {
      const stageMatch = filters.stage_id ? s.stage_id === filters.stage_id : true;

      const logicalMatch = s.logical_name
        ?.toLowerCase()
        .includes(filters.logical_name.toLowerCase());

      return stageMatch && logicalMatch;
    });
  }, [signals, filters]);

  // ================= HELPERS =================
  const getStageName = (id) => {
    const stage = stages.find((s) => s.stage_id === id);
    return stage ? stage.stage_name : "Unknown";
  };

  const getStageById = (id) => stages.find((s) => s.stage_id === id) || null;

  const isTorqueAngleBase = (logicalName) =>
    logicalName === "Torque" || logicalName === "Angle";

  const generateNameList = (base, count) => {
    const names = [];
    for (let i = 1; i <= count; i++) {
      names.push(`${base}${i}`);
    }
    return names;
  };

  // Create missing logical names in m_logical_name
  const ensureLogicalNamesExist = async (base, count) => {
    const targetNames = generateNameList(base, count);

    // Existing names in master
    const existingNamesSet = new Set(
      logicalNames.map((ln) => ln.logical_name?.toUpperCase())
    );

    const missingNames = targetNames.filter(
      (name) => !existingNamesSet.has(name.toUpperCase())
    );

    if (missingNames.length === 0) return;

    try {
      await Promise.all(
        missingNames.map((name) =>
          axios.post(LOGICAL_NAME_API, { logical_name: name })
        )
      );

      // Refresh logical names
      const l = await axios.get(LOGICAL_NAME_API);
      const logicalData = Array.isArray(l.data) ? l.data : l.data?.data || [];
      setLogicalNames(logicalData);
    } catch (err) {
      console.error("Error creating logical names:", err);
      throw err;
    }
  };

  // Bulk-create MQTT signals for Torque/Angle based on tightening_cnt
  const createTorqueAngleSignalsForStage = async (base) => {
    const stageObj = getStageById(formData.stage_id);
    if (!stageObj || !stageObj.stage_no) {
      alert("Stage details not found or invalid stage_no.");
      return;
    }

    // 1. Get tightening_cnt from stage details API
    let tighteningCnt = 0;
    try {
      const resp = await axios.get(
        `${STAGE_DETAIL_BY_NO_API}/${stageObj.stage_no}`
      );
      const data = resp.data?.data || {};
      const recipeDetails = data.recipe_details || [];
      if (recipeDetails.length > 0) {
        tighteningCnt = Number(recipeDetails[0].tightening_cnt || 0);
      }
    } catch (err) {
      console.error("Error fetching stage details:", err);
      alert("Unable to fetch tightening count for the selected stage.");
      return;
    }

    if (!tighteningCnt || tighteningCnt <= 0) {
      alert("Tightening count is 0 or not configured for this stage.");
      return;
    }

    // 2. Ensure logical names (Torque1..N / Angle1..N) exist in master
    try {
      await ensureLogicalNamesExist(base, tighteningCnt);
    } catch {
      alert("Error while creating logical names in master.");
      return;
    }

    // 3. Prepare MQTT payloads for this stage
    const logicalList = generateNameList(base, tighteningCnt);

    // Existing signals for this stage to avoid duplicates
    const existingForStage = signals.filter(
      (s) => s.stage_id === formData.stage_id
    );
    const existingNameSet = new Set(
      existingForStage.map((s) => s.logical_name?.toUpperCase())
    );

    const payloadsToInsert = logicalList
      .filter((ln) => !existingNameSet.has(ln.toUpperCase()))
      .map((logicalName) => ({
        stage_id: formData.stage_id,
       logical_name: logicalName,
        topic: `ST${stageObj.stage_no}_${logicalName}`,
        payload_format: formData.payload_format || "RAW",
        json_key: formData.payload_format === "JSON" ? formData.json_key || null : null,
        success_value: formData.success_value || null,
        fail_value: formData.fail_value || null,
        active: formData.active,
      }));

    if (payloadsToInsert.length === 0) {
      alert(
        `${base} topics for this stage are already configured. No new records to create.`
      );
      return;
    }

    // 4. Insert all MQTT signals
    try {
      await Promise.all(
        payloadsToInsert.map((p) => axios.post(MQTT_SIGNAL_API, p))
      );
      alert(
        `Created ${payloadsToInsert.length} ${base} MQTT signal(s) for this stage.`
      );
      setShowModal(false);
      setFormData(emptyForm);
      fetchAll();
    } catch (err) {
      console.error("Error creating MQTT signals:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error while creating MQTT signals."
      );
    }
  };

  // ================= CRUD =================
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    const stageObj = stages.find((s) => s.stage_id === row.stage_id);

    setIsEditing(true);
    setFormData({
      mqtt_signal_id: row.mqtt_signal_id,
      stage_id: row.stage_id,
      stage_no: stageObj?.stage_no || "",
      logical_name: row.logical_name,
      topic: row.topic,
      payload_format: row.payload_format || "RAW",
      json_key: row.json_key || "",
      success_value: row.success_value || "",
      fail_value: row.fail_value || "",
      active: row.active,
    });

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.stage_id || !formData.logical_name) {
      alert("Stage and Logical Name are required");
      return;
    }

    const isTorqueOrAngleBase =
      !isEditing && isTorqueAngleBase(formData.logical_name);

    // For Torque/Angle base in ADD mode: bulk create based on tightening_cnt
    if (isTorqueOrAngleBase) {
      setIsSaving(true);
      try {
        await createTorqueAngleSignalsForStage(formData.logical_name);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // For normal single logical name (including Torque1, Angle1 etc.) or EDIT mode
    if (!formData.topic) {
      // For safety, derive topic if possible
      const stageObj = getStageById(formData.stage_id);
      if (stageObj?.stage_no && formData.logical_name) {
        formData.topic = `ST${stageObj.stage_no}_${formData.logical_name}`;
      }
    }

    const payload = {
      stage_id: formData.stage_id,
      logical_name: formData.logical_name.trim(),
      topic: formData.topic.trim(),
      payload_format: formData.payload_format || "RAW",
      json_key:
        formData.payload_format === "JSON"
          ? formData.json_key || null
          : null,
      success_value: formData.success_value || null,
      fail_value: formData.fail_value || null,
      active: formData.active,
    };

    try {
      setIsSaving(true);
      if (isEditing) {
        await axios.put(
          `${MQTT_SIGNAL_API}/${formData.mqtt_signal_id}`,
          payload
        );
      } else {
        await axios.post(MQTT_SIGNAL_API, payload);
      }

      setShowModal(false);
      setFormData(emptyForm);
      fetchAll();
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE DATA:", err.response?.data);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          JSON.stringify(err.response?.data) ||
          "Database Error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this MQTT signal?")) {
      await axios.delete(`${MQTT_SIGNAL_API}/${id}`);
      fetchAll();
    }
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  // ================= UI =================
  // Filter out Torque1..N & Angle1..N from normal dropdown (we handle via base Torque/Angle)
  const otherLogicalNames = logicalNames.filter((ln) => {
    const name = (ln.logical_name || "").toUpperCase();
    if (/^TORQUE\d+$/.test(name)) return false;
    if (/^ANGLE\d+$/.test(name)) return false;
    return true;
  });

  return (
    <div className="container-fluid py-3">
      {/* HEADER */}
      <div
        className="card shadow-sm rounded-4 mb-3 mx-2"
        style={{
          borderLeft: "5px solid #dc3545",
          borderTop: 0,
          borderRight: 0,
          borderBottom: 0,
        }}
      >
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h4 className="fw-bold mb-0">MQTT Signal Master</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Stage Filter */}
            <select
              className="form-control"
              style={{ width: 200 }}
              value={filters.stage_id}
              onChange={(e) =>
                setFilters({ ...filters, stage_id: e.target.value })
              }
            >
              <option value="">All Stages</option>
              {stages.map((s) => (
                <option key={s.stage_id} value={s.stage_id}>
                  {s.stage_name}
                </option>
              ))}
            </select>

            {/* Logical Name Filter */}
            <input
              className="form-control"
              placeholder="Logical Name"
              style={{ width: 180 }}
              value={filters.logical_name}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  logical_name: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ stage_id: "", logical_name: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Signal
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Stage</th>
              <th>Logical Name</th>
              <th>Topic</th>
              <th>Payload</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map((s, i) => (
              <tr key={s.mqtt_signal_id}>
                <td>{i + 1}</td>
                <td>{getStageName(s.stage_id)}</td>
                <td>{s.logical_name}</td>
                <td className="text-truncate" style={{ maxWidth: 260 }}>
                  {s.topic}
                </td>
                <td>{s.payload_format}</td>
                <td>
                  <span
                    className={`badge ${
                      s.active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => handleView(s)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(s)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(s.mqtt_signal_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredSignals.length === 0 && (
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
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ width: 560, maxHeight: "90vh", overflowY: "auto" }}
          >
            <h5 className="fw-bold mb-3 text-danger">
              {isEditing ? "Edit MQTT Signal" : "Add MQTT Signal"}
            </h5>

            {/* Stage */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Stage *</label>
              <select
                className="form-select"
                value={formData.stage_id}
                onChange={(e) => {
                  const selectedStage = stages.find(
                    (s) => s.stage_id === e.target.value
                  );

                  setFormData((prev) => ({
                    ...prev,
                    stage_id: selectedStage?.stage_id || "",
                    stage_no: selectedStage?.stage_no || "",
                    // topic preview will be derived later based on logical_name
                  }));
                }}
              >
                <option value="">Select Stage</option>
                {stages.map((s) => (
                  <option key={s.stage_id} value={s.stage_id}>
                    Stage {s.stage_no} - {s.stage_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Logical Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Logical Name *
              </label>
              <select
                className="form-select"
                value={formData.logical_name}
                onChange={(e) => {
                  const selectedLogical = e.target.value;

                  // Topic preview (for non-bulk case)
                  let topicPreview = "";
                  if (formData.stage_no && selectedLogical) {
                    if (isTorqueAngleBase(selectedLogical)) {
                      topicPreview = `ST${formData.stage_no}_${selectedLogical}1..N (auto)`;
                    } else {
                      topicPreview = `ST${formData.stage_no}_${selectedLogical}`;
                    }
                  }

                  setFormData((prev) => ({
                    ...prev,
                    logical_name: selectedLogical,
                    topic: topicPreview,
                  }));
                }}
              >
                <option value="">Select Logical Name</option>

                {/* Base Torque/Angle options for auto generation */}
                <option value="Torque">Torque (auto Torque1..N)</option>
                <option value="Angle">Angle (auto Angle1..N)</option>

                {otherLogicalNames.length > 0 && (
                  <optgroup label="Other Logical Names">
                    {otherLogicalNames.map((ln) => (
                      <option
                        key={ln.logical_id}
                        value={ln.logical_name}
                      >
                        {ln.logical_name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {!isEditing &&
                isTorqueAngleBase(formData.logical_name) && (
                  <small className="text-muted">
                    Based on tightening count, multiple MQTT topics will
                    be auto-created for this stage (e.g. ST30_
                    {formData.logical_name}1..N).
                  </small>
                )}
            </div>

            {/* Topic Preview */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Auto Generated Topic / Preview
              </label>
              <input
                type="text"
                className="form-control bg-light"
                value={formData.topic}
                readOnly
              />
            </div>

            {/* Payload Format */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Payload Format
              </label>
              <select
                className="form-select"
                value={formData.payload_format}
                onChange={(e) =>
                  setFormData({ ...formData, payload_format: e.target.value })
                }
              >
                <option value="RAW">RAW</option>
                <option value="JSON">JSON</option>
                <option value="TEXT">TEXT</option>
              </select>
            </div>

            {/* JSON Key */}
            {formData.payload_format === "JSON" && (
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  JSON Key
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. result / torque"
                  value={formData.json_key}
                  onChange={(e) =>
                    setFormData({ ...formData, json_key: e.target.value })
                  }
                />
              </div>
            )}

            {/* Success / Fail */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Success Value
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.success_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      success_value: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Fail Value
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fail_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fail_value: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
              <label className="form-check-label fw-semibold">
                Active Signal
              </label>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                  ? "Update Signal"
                  : "Save Signal"}
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
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ width: 480 }}
          >
            <h5 className="fw-bold mb-3 text-danger">
              MQTT Signal Details
            </h5>

            <div className="mb-2">
              <strong className="text-muted">Stage:</strong>{" "}
              {getStageName(viewData.stage_id)}
            </div>

            <div className="mb-2">
              <strong className="text-muted">Logical Name:</strong>{" "}
              {viewData.logical_name}
            </div>

            <div className="mb-2">
              <strong className="text-muted">Topic:</strong>{" "}
              <span className="text-break">{viewData.topic}</span>
            </div>

            <div className="mb-2">
              <strong className="text-muted">Payload Format:</strong>{" "}
              {viewData.payload_format}
            </div>

            {viewData.payload_format === "JSON" && (
              <div className="mb-2">
                <strong className="text-muted">JSON Key:</strong>{" "}
                {viewData.json_key || "-"}
              </div>
            )}

            <div className="mb-2">
              <strong className="text-muted">Success Value:</strong>{" "}
              {viewData.success_value || "-"}
            </div>

            <div className="mb-2">
              <strong className="text-muted">Fail Value:</strong>{" "}
              {viewData.fail_value || "-"}
            </div>

            <div className="mb-2">
              <strong className="text-muted">Status:</strong>{" "}
              <span
                className={`badge ${
                  viewData.active ? "bg-success" : "bg-secondary"
                }`}
              >
                {viewData.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="text-end mt-4">
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

export default MqttSignalMaster;