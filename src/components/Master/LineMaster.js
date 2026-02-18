import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const emptyForm = {
  line_code: "",
  line_name: "",
  plant_id: "",
  pitch_mm: "",
  is_active: true,
};


const LineMaster = () => {
  // const [allLines, setAllLines] = useState([]);
  // const [plants, setPlants] = useState([]);
  // const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    line_code: "",
    line_name: "",
    plant_id: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* =====================================================
     FETCH PLANTS (FOR DROPDOWN)
  ===================================================== */
const { data: plants = [] } = useQuery({
  queryKey: ["plants"],
  queryFn: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/plants`);
    return res.data;
  },
});


  /* =====================================================
     FETCH LINES
  ===================================================== */
const {
  data: allLines = [],
  isLoading: loading,
  refetch,
} = useQuery({
  queryKey: ["lines"],
  queryFn: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/lines`);
    return res.data;
  },
});

const queryClient = useQueryClient();


const saveMutation = useMutation({
  mutationFn: async (payload) => {
    if (isEditing) {
      return axios.put(
        `${API_BASE_URL}/api/lines/${formData.line_id}`,
        payload
      );
    } else {
      return axios.post(`${API_BASE_URL}/api/lines`, payload);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["lines"]);
    setShowModal(false);
  },
});


  /* =====================================================
     FILTER
  ===================================================== */
  const filteredLines = useMemo(() => {
    return allLines.filter(
      (l) =>
        l.line_code
          ?.toLowerCase()
          .includes(filters.line_code.toLowerCase()) &&
        l.line_name
          ?.toLowerCase()
          .includes(filters.line_name.toLowerCase()) &&
        (filters.plant_id
          ? String(l.plant_id) === filters.plant_id
          : true)
    );
  }, [allLines, filters]);

  /* =====================================================
     HELPERS
  ===================================================== */
  const getPlantName = (plant_id) => {
    return plants.find((p) => p.plant_id === plant_id)?.plant_name || "-";
  };

  /* =====================================================
     HANDLERS
  ===================================================== */
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

  /* =====================================================
     POST / PUT
  ===================================================== */
// const handleSave = async () => {
//   try {
//     const payload = {
//       ...formData,
//       pitch_mm: Number(formData.pitch_mm),
//     };

//     if (isEditing) {
//       await axios.put(
//         `${API_BASE_URL}/api/lines/${formData.line_id}`,
//         payload
//       );
//     } else {
//       await axios.post(
//         `${API_BASE_URL}/api/lines`,
//         payload
//       );
//     }

//     setShowModal(false);
//     fetchLines();
//   } catch (err) {
//     console.error("Save failed", err.response?.data || err);
//     alert("Failed to save line");
//   }
// };

const handleSave = () => {
  const payload = {
    ...formData,
    pitch_mm: Number(formData.pitch_mm),
  };

  saveMutation.mutate(payload);
};


const deleteMutation = useMutation({
  mutationFn: async (id) =>
    axios.delete(`${API_BASE_URL}/api/lines/${id}`),
  onSuccess: () => {
    queryClient.invalidateQueries(["lines"]);
  },
});

  /* =====================================================
     DELETE
  ===================================================== */
  // const handleDelete = async (line_id) => {
  //   if (!window.confirm("Delete this line?")) return;

  //   try {
  //     await axios.delete(
  //       `${API_BASE_URL}/api/lines/${line_id}`
  //     );
  //     fetchLines();
  //   } catch (err) {
  //     console.error("Delete failed", err);
  //     alert("Failed to delete line");
  //   }
  // };

  // return (
  //   <div className="container-fluid py-4">

  //     {/* ================= HEADER ================= */}
  //     <div className="card shadow-sm border-0 rounded-4 mb-4">
  //       <div className="card-body">
  //         <h4 className="fw-bold mb-1">Line Master</h4>
  //         <small className="text-muted">
  //           Manage production lines and plant mapping
  //         </small>
  //       </div>
  //     </div>

  //     {/* ================= FILTERS ================= */}
  //     <div className="d-flex justify-content-end gap-3 flex-wrap mb-3">
  //       <input
  //         className="form-control"
  //         placeholder="Line Code"
  //         value={filters.line_code}
  //         onChange={(e) =>
  //           setFilters({ ...filters, line_code: e.target.value })
  //         }
  //         style={{ width: 220 }}
  //       />

  //       <input
  //         className="form-control"
  //         placeholder="Line Name"
  //         value={filters.line_name}
  //         onChange={(e) =>
  //           setFilters({ ...filters, line_name: e.target.value })
  //         }
  //         style={{ width: 220 }}
  //       />

  //       <select
  //         className="form-control"
  //         value={filters.plant_id}
  //         onChange={(e) =>
  //           setFilters({ ...filters, plant_id: e.target.value })
  //         }
  //         style={{ width: 220 }}
  //       >
  //         <option value="">All Plants</option>
  //         {plants.map((p) => (
  //           <option key={p.plant_id} value={p.plant_id}>
  //             {p.plant_name}
  //           </option>
  //         ))}
  //       </select>

  //       <button
  //         className="btn btn-warning btn-sm"
  //         onClick={() =>
  //           setFilters({
  //             line_code: "",
  //             line_name: "",
  //             plant_id: "",
  //           })
  //         }
  //       >
  //         <RotateCcw size={14} />
  //       </button>

  //       <button
  //         className="btn btn-danger btn-sm d-flex align-items-center gap-2"
  //         onClick={handleAdd}
  //       >
  //         <Plus size={14} />
  //         Add Line
  //       </button>
  //     </div>

  //     {/* ================= TABLE ================= */}
  //     <div className="table-responsive card shadow-sm border-0 rounded-4">
  //       <table className="table align-middle mb-0">
  //         <thead className="border-bottom">
  //           <tr className="text-muted">
  //             <th>Sr</th>
  //             <th>Line Code</th>
  //             <th>Line Name</th>
  //             <th>Plant</th>
  //             <th>Product Type</th>
  //             <th>Line Type</th>
  //             <th>Pitch / Index (sec)</th>
  //             <th>Status</th>
  //             <th className="text-end">Actions</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {loading && (
  //             <tr>
  //               <td colSpan="9" className="text-center py-4">
  //                 Loading...
  //               </td>
  //             </tr>
  //           )}

  //           {!loading &&
  //             filteredLines.map((row, i) => (
  //               <tr key={row.line_id}>
  //                 <td>{i + 1}</td>
  //                 <td>{row.line_code}</td>
  //                 <td>{row.line_name}</td>
  //                 <td>{getPlantName(row.plant_id)}</td>
  //                 <td>{row.product_type}</td>
  //                 <td>{row.line_type}</td>
  //                 <td>{row.pitch_or_index_time}</td>
  //                 <td>
  //                   <span
  //                     className={`badge ${
  //                       row.status ? "bg-success" : "bg-danger"
  //                     }`}
  //                   >
  //                     {row.status ? "Active" : "Inactive"}
  //                   </span>
  //                 </td>
  //                 <td className="text-end">
  //                   <button
  //                     className="btn btn-outline-secondary btn-sm me-2"
  //                     onClick={() => handleView(row)}
  //                   >
  //                     <Eye size={14} />
  //                   </button>
  //                   <button
  //                     className="btn btn-outline-primary btn-sm me-2"
  //                     onClick={() => handleEdit(row)}
  //                   >
  //                     <Pencil size={14} />
  //                   </button>
  //                   <button
  //                     className="btn btn-outline-danger btn-sm"
  //                     onClick={() => handleDelete(row.line_id)}
  //                   >
  //                     <Trash2 size={14} />
  //                   </button>
  //                 </td>
  //               </tr>
  //             ))}

  //           {!loading && filteredLines.length === 0 && (
  //             <tr>
  //               <td colSpan="9" className="text-center text-muted py-4">
  //                 No records found
  //               </td>
  //             </tr>
  //           )}
  //         </tbody>
  //       </table>
  //     </div>

  //     {/* ================= ADD / EDIT MODAL ================= */}
  //     {showModal && (
  //       <div
  //         style={{
  //           position: "fixed",
  //           inset: 0,
  //           background: "rgba(0,0,0,0.5)",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           zIndex: 1050,
  //         }}>
  //         <div className="bg-white rounded-4 shadow p-3" style={{ width: 480 }}>
  //           <h5>{isEditing ? "Edit Line" : "Add Line"}</h5>

  //           <div className="mb-3">
  //             <label className="form-label">Plant</label>
  //             <select
  //               className="form-control"
  //               value={formData.plant_id}
  //               onChange={(e) =>
  //                 setFormData({
  //                   ...formData,
  //                   plant_id: e.target.value,
  //                 })
  //               }
  //             >
  //               <option value="">Select Plant</option>
  //               {plants.map((p) => (
  //                 <option key={p.plant_id} value={p.plant_id}>
  //                   {p.plant_name}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>

  //           {[
  //             { k: "line_code", l: "Line Code" },
  //             { k: "line_name", l: "Line Name" },
  //             { k: "product_type", l: "Product Type" },
  //             { k: "line_type", l: "Line Type" },
  //             {
  //               k: "pitch_or_index_time",
  //               l: "Pitch / Index Time (sec)",
  //             },
  //           ].map(({ k, l }) => (
  //             <div className="mb-3" key={k}>
  //               <label className="form-label">{l}</label>
  //               <input
  //                 className="form-control"
  //                 value={formData[k]}
  //                 onChange={(e) =>
  //                   setFormData({
  //                     ...formData,
  //                     [k]: e.target.value,
  //                   })
  //                 }
  //               />
  //             </div>
  //           ))}

  //           <div className="form-check mb-3">
  //             <input
  //               className="form-check-input"
  //               type="checkbox"
  //               checked={formData.status}
  //               onChange={(e) =>
  //                 setFormData({
  //                   ...formData,
  //                   status: e.target.checked,
  //                 })
  //               }
  //             />
  //             <label className="form-check-label">
  //               Active
  //             </label>
  //           </div>

  //           <div className="d-flex justify-content-end gap-2">
  //             <button
  //               className="btn btn-secondary"
  //               onClick={() => setShowModal(false)}
  //             >
  //               Cancel
  //             </button>
  //             <button className="btn btn-danger" onClick={handleSave}>
  //               Save
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     {/* ================= VIEW MODAL ================= */}
  //     {showView && viewData && (
  //       <div
  //         style={{
  //           position: "fixed",
  //           inset: 0,
  //           background: "rgba(0,0,0,0.5)",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           zIndex: 1050,
  //         }}>
  //         <div className="bg-white rounded-4 shadow p-3" style={{ width: 420 }}>
  //           <h5>Line Details</h5>
  //           {Object.entries(viewData).map(([k, v]) => (
  //             <div key={k}>
  //               <strong>{k.replace(/_/g, " ")}:</strong>{" "}
  //               {k === "plant_id" ? getPlantName(v) : String(v)}
  //             </div>
  //           ))}
  //           <button
  //             className="btn btn-secondary mt-3"
  //             onClick={() => setShowView(false)}
  //           >
  //             Close
  //           </button>
  //         </div>
  //       </div>
  //     )}

  //   </div>
  // );

const handleDelete = (line_id) => {
  if (!window.confirm("Delete this line?")) return;
  deleteMutation.mutate(line_id);
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
          <h4 className="fw-bold mb-1">Line Master</h4>
        
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <input
            className="form-control"
            placeholder="Line Code"
            style={{ width: 160 }}
            value={filters.line_code}
            onChange={(e) =>
              setFilters({ ...filters, line_code: e.target.value })
            }
          />

          <input
            className="form-control"
            placeholder="Line Name"
            style={{ width: 180 }}
            value={filters.line_name}
            onChange={(e) =>
              setFilters({ ...filters, line_name: e.target.value })
            }
          />

          <select
            className="form-control"
            style={{ width: 180 }}
            value={filters.plant_id}
            onChange={(e) =>
              setFilters({ ...filters, plant_id: e.target.value })
            }
          >
            <option value="">All Plants</option>
            {plants.map((p) => (
              <option key={p.plant_id} value={p.plant_id}>
                {p.plant_name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-sm"
            style={{ background: "#d3e7f3" }}
            onClick={() =>
              setFilters({ line_code: "", line_name: "", plant_id: "" })
            }
          >
            <RotateCcw size={14} />
          </button>

          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={handleAdd}
          >
            <Plus size={14} />
            Add Line
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
            <th>Line Code</th>
            <th>Line Name</th>
            <th>Plant</th>
            <th>Pitch (mm)</th>
<th>Status</th>
<th>Created At</th>

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
            filteredLines.map((row, i) => (
              <tr key={row.line_id}>
                <td>{i + 1}</td>
                <td>{row.line_code}</td>
                <td>{row.line_name}</td>
                <td>{getPlantName(row.plant_id)}</td>
                <td>{row.pitch_mm}</td>
<td>
  <span className={`badge ${row.is_active ? "bg-success" : "bg-danger"}`}>
    {row.is_active ? "Active" : "Inactive"}
  </span>
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
                    onClick={() => handleDelete(row.line_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

          {!loading && filteredLines.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center text-muted py-4">
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
        <div className="bg-white rounded-4 shadow p-3" style={{ width: 480 }}>
          <h5 className="mb-3">{isEditing ? "Edit Line" : "Add Line"}</h5>

          <div className="mb-3">
            <label className="form-label">Plant</label>
            <select
              className="form-control"
              value={formData.plant_id}
              onChange={(e) =>
                setFormData({ ...formData, plant_id: e.target.value })
              }
            >
              <option value="">Select Plant</option>
              {plants.map((p) => (
                <option key={p.plant_id} value={p.plant_id}>
                  {p.plant_name}
                </option>
              ))}
            </select>
          </div>

 {[
  { k: "line_code", l: "Line Code" },
  { k: "line_name", l: "Line Name" },
  { k: "pitch_mm", l: "Pitch (mm)" },
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


          <div className="form-check mb-3">
         <input
  className="form-check-input"
  type="checkbox"
  checked={formData.is_active}
  onChange={(e) =>
    setFormData({ ...formData, is_active: e.target.checked })
  }
/>

            <label className="form-check-label">Active</label>
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
          <h5 className="mb-3">Line Details</h5>

          <div className="d-flex flex-column gap-2">
          {Object.entries(viewData)
  .filter(([k]) => k !== "line_id")
  .map(([k, v]) => (
    <div key={k} className="d-flex justify-content-between align-items-start">
      
      {/* ===== FIELD LABEL FIX ===== */}
      <strong className="text-muted">
        {k === "plant_id"
          ? "Plant Name"
          : k === "is_active"
          ? "Status"
          : k.replace(/_/g, " ")}
      </strong>

      {/* ===== FIELD VALUE FIX ===== */}
      <span className="text-end">
        {k === "plant_id" ? (
          getPlantName(v)
        ) : k === "is_active" ? (
          <span className={`badge ${v ? "bg-success" : "bg-danger"}`}>
            {v ? "Active" : "Inactive"}
          </span>
        ) : (
          v ?? "-"
        )}
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

export default LineMaster;
