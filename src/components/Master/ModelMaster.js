// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
// import API_BASE_URL from "../../config";

// const API_URL = `${API_BASE_URL}/api/modelmaster`;

// const emptyForm = {
//   model_sku_name: "",
//   model_sku_code: "",
//   product_family: "",
//   effective_date: "",
//   status: true,
//   variant_attributes: [{ key: "", value: "" }],
// };

// const ModelMaster = () => {
//   const [allModels, setAllModels] = useState([]);
//   const [filters, setFilters] = useState({
//     model_sku_name: "",
//     model_sku_code: "",
//   });

//   const [formData, setFormData] = useState(emptyForm);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showView, setShowView] = useState(false);
//   const [viewData, setViewData] = useState(null);

//   // ================= FETCH =================
//   useEffect(() => {
//     fetchModels();
//   }, []);

//   const fetchModels = async () => {
//     const res = await axios.get(API_URL);
//     setAllModels(res.data);
//   };

//   // ================= FILTER =================
//   const filteredModels = useMemo(() => {
//     return allModels.filter(
//       (m) =>
//         m.model_sku_name
//           .toLowerCase()
//           .includes(filters.model_sku_name.toLowerCase()) &&
//         m.model_sku_code
//           .toLowerCase()
//           .includes(filters.model_sku_code.toLowerCase())
//     );
//   }, [allModels, filters]);

//   // ================= VARIANT ATTR =================
//   const addVariantRow = () => {
//     setFormData({
//       ...formData,
//       variant_attributes: [
//         ...formData.variant_attributes,
//         { key: "", value: "" },
//       ],
//     });
//   };

//   const updateVariantRow = (index, field, value) => {
//     const updated = [...formData.variant_attributes];
//     updated[index][field] = value;
//     setFormData({ ...formData, variant_attributes: updated });
//   };

//   const removeVariantRow = (index) => {
//     setFormData({
//       ...formData,
//       variant_attributes: formData.variant_attributes.filter(
//         (_, i) => i !== index
//       ),
//     });
//   };

//   const buildVariantObject = () => {
//     const obj = {};
//     formData.variant_attributes.forEach(({ key, value }) => {
//       if (key) obj[key] = value;
//     });
//     return obj;
//   };

//   // ================= CRUD =================
//   const handleAdd = () => {
//     setIsEditing(false);
//     setFormData(emptyForm);
//     setShowModal(true);
//   };

//   const handleEdit = (row) => {
//     setIsEditing(true);
//     setFormData({
//       model_id: row.model_id,
//       model_sku_name: row.model_sku_name,
//       model_sku_code: row.model_sku_code,
//       product_family: row.product_family || "",
//       effective_date: row.effective_date
//         ? row.effective_date.substring(0, 10)
//         : "",
//       status: row.status,
//       variant_attributes: Object.entries(row.variant_attributes || {}).map(
//         ([k, v]) => ({ key: k, value: v })
//       ),
//     });
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     const payload = {
//       model_sku_name: formData.model_sku_name,
//       model_sku_code: formData.model_sku_code,
//       product_family: formData.product_family,
//       effective_date: formData.effective_date,
//       status: formData.status,
//       variant_attributes: buildVariantObject(),
//     };

//     if (isEditing) {
//       await axios.put(`${API_URL}/${formData.model_id}`, payload);
//     } else {
//       await axios.post(API_URL, payload);
//     }

//     setShowModal(false);
//     fetchModels();
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this model?")) {
//       await axios.delete(`${API_URL}/${id}`);
//       fetchModels();
//     }
//   };

//   const handleView = (row) => {
//     setViewData(row);
//     setShowView(true);
//   };

//   // ================= UI =================
//   return (
//     <div className="container-fluid py-4">
//       {/* HEADER */}
//       <div className="card shadow-sm border-0 rounded-4 mb-4">
//         <div className="card-body">
//           <h4 className="fw-bold mb-1">Model Master</h4>
//           <small className="text-muted">
//             Model, product family & variant configuration
//           </small>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="card shadow-sm border-0 rounded-4">
//         <div className="card-body">
//           {/* FILTERS */}
//           <div className="d-flex justify-content-end gap-2 mb-3 flex-wrap">
//             <input
//               className="form-control"
//               placeholder="Model Name"
//               value={filters.model_sku_name}
//               onChange={(e) =>
//                 setFilters({ ...filters, model_sku_name: e.target.value })
//               }
//               style={{ width: 220 }}
//             />
//             <input
//               className="form-control"
//               placeholder="Model SKU"
//               value={filters.model_sku_code}
//               onChange={(e) =>
//                 setFilters({ ...filters, model_sku_code: e.target.value })
//               }
//               style={{ width: 220 }}
//             />

//             <button
//               className="btn btn-warning btn-sm"
//               onClick={() =>
//                 setFilters({ model_sku_name: "", model_sku_code: "" })
//               }
//             >
//               <RotateCcw size={14} />
//             </button>

//             <button className="btn btn-danger btn-sm" onClick={handleAdd}>
//               <Plus size={14} /> Add Model
//             </button>
//           </div>

//           {/* TABLE */}
//           <div className="table-responsive">
//             <table className="table align-middle">
//               <thead className="text-muted">
//                 <tr>
//                   <th>Sr No</th>
//                   <th>Model Name</th>
//                   <th>Model SKU</th>
//                   <th>Product Family</th>
//                   <th>Effective Date</th>
//                   <th>Status</th>
//                   <th>Created At</th>
//                   <th className="text-end">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredModels.map((row, i) => (
//                   <tr key={row.model_id}>
//                     <td>{i + 1}</td>
//                     <td>{row.model_sku_name}</td>
//                     <td>{row.model_sku_code}</td>
//                     <td>{row.product_family}</td>
//                     <td>
//                       {row.effective_date
//                         ? new Date(row.effective_date).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           row.status ? "bg-success" : "bg-secondary"
//                         }`}
//                       >
//                         {row.status ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td>
//                       {row.created_at
//                         ? new Date(row.created_at).toLocaleString()
//                         : "-"}
//                     </td>
//                     <td className="text-end">
//                       <button
//                         className="btn btn-outline-secondary btn-sm me-2"
//                         onClick={() => handleView(row)}
//                       >
//                         <Eye size={14} />
//                       </button>
//                       <button
//                         className="btn btn-outline-primary btn-sm me-2"
//                         onClick={() => handleEdit(row)}
//                       >
//                         <Pencil size={14} />
//                       </button>
//                       <button
//                         className="btn btn-outline-danger btn-sm"
//                         onClick={() => handleDelete(row.model_id)}
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}

//                 {filteredModels.length === 0 && (
//                   <tr>
//                     <td colSpan="8" className="text-center text-muted">
//                       No records found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* ADD / EDIT MODAL */}
//       {showModal && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1050,
//           }}
//         >
//           <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
//             <h5 className="mb-3">
//               {isEditing ? "Edit Model" : "Add Model"}
//             </h5>

//             <input
//               className="form-control mb-2"
//               placeholder="Model Name"
//               value={formData.model_sku_name}
//               onChange={(e) =>
//                 setFormData({ ...formData, model_sku_name: e.target.value })
//               }
//             />

//             <input
//               className="form-control mb-2"
//               placeholder="Model SKU"
//               disabled={isEditing}
//               value={formData.model_sku_code}
//               onChange={(e) =>
//                 setFormData({ ...formData, model_sku_code: e.target.value })
//               }
//             />

//             <input
//               className="form-control mb-2"
//               placeholder="Product Family (e.g. Motorcycle)"
//               value={formData.product_family}
//               onChange={(e) =>
//                 setFormData({ ...formData, product_family: e.target.value })
//               }
//             />

//             <input
//               type="date"
//               className="form-control mb-3"
//               value={formData.effective_date}
//               onChange={(e) =>
//                 setFormData({ ...formData, effective_date: e.target.value })
//               }
//             />

//             <div className="form-check mb-3">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 checked={formData.status}
//                 onChange={(e) =>
//                   setFormData({ ...formData, status: e.target.checked })
//                 }
//               />
//               <label className="form-check-label">Active</label>
//             </div>

//             <h6>Variant Attributes</h6>
//             {formData.variant_attributes.map((row, i) => (
//               <div className="d-flex gap-2 mb-2" key={i}>
//                 <input
//                   className="form-control"
//                   placeholder="Key"
//                   value={row.key}
//                   onChange={(e) =>
//                     updateVariantRow(i, "key", e.target.value)
//                   }
//                 />
//                 <input
//                   className="form-control"
//                   placeholder="Value"
//                   value={row.value}
//                   onChange={(e) =>
//                     updateVariantRow(i, "value", e.target.value)
//                   }
//                 />
//                 <button
//                   className="btn btn-outline-danger"
//                   onClick={() => removeVariantRow(i)}
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}

//             <button
//               className="btn btn-outline-primary btn-sm mb-3"
//               onClick={addVariantRow}
//             >
//               + Add Attribute
//             </button>

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

//       {/* VIEW MODAL */}
//       {showView && viewData && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1050,
//           }}
//         >
//           <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
//             <h5 className="mb-3">Model Details</h5>

//             <p><strong>Name:</strong> {viewData.model_sku_name}</p>
//             <p><strong>SKU:</strong> {viewData.model_sku_code}</p>
//             <p><strong>Product Family:</strong> {viewData.product_family}</p>
//             <p>
//               <strong>Effective Date:</strong>{" "}
//               {viewData.effective_date
//                 ? new Date(viewData.effective_date).toLocaleDateString()
//                 : "-"}
//             </p>
//             <p>
//               <strong>Status:</strong>{" "}
//               {viewData.status ? "Active" : "Inactive"}
//             </p>

//             <h6 className="mt-3">Variant Attributes</h6>
//             {Object.entries(viewData.variant_attributes || {}).map(
//               ([k, v]) => (
//                 <div key={k}>
//                   <strong>{k}:</strong> {v}
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ModelMaster;


import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import API_BASE_URL from "../../config";


const API_URL = `${API_BASE_URL}/api/modelmaster`;

const emptyForm = {
  model_sku_name: "",
  model_sku_code: "",
  product_family: "",
  effective_date: "",
  status: true,
  variant_attributes: [{ key: "", value: "" }],
};

const ModelMaster = () => {
  const [allModels, setAllModels] = useState([]);
  const [filters, setFilters] = useState({
    model_sku_name: "",
    model_sku_code: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const res = await axios.get(API_URL);
    setAllModels(res.data || []);
  };

  /* ================= FILTER ================= */
  const filteredModels = useMemo(() => {
    return allModels.filter(
      (m) =>
        m.model_sku_name
          .toLowerCase()
          .includes(filters.model_sku_name.toLowerCase()) &&
        m.model_sku_code
          .toLowerCase()
          .includes(filters.model_sku_code.toLowerCase())
    );
  }, [allModels, filters]);

  /* ================= CRUD ================= */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      model_id: row.model_id,
      model_sku_name: row.model_sku_name,
      model_sku_code: row.model_sku_code,
      product_family: row.product_family || "",
      effective_date: row.effective_date
        ? row.effective_date.substring(0, 10)
        : "",
      status: row.status,
      variant_attributes: Object.entries(row.variant_attributes || {}).map(
        ([k, v]) => ({ key: k, value: v })
      ),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      model_sku_name: formData.model_sku_name,
      model_sku_code: formData.model_sku_code,
      product_family: formData.product_family,
      effective_date: formData.effective_date,
      status: formData.status,
      variant_attributes: Object.fromEntries(
        formData.variant_attributes.filter(v => v.key).map(v => [v.key, v.value])
      ),
    };

    if (isEditing) {
      await axios.put(`${API_URL}/${formData.model_id}`, payload);
    } else {
      await axios.post(API_URL, payload);
    }

    setShowModal(false);
    fetchModels();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this model?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchModels();
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  const addVariantRow = () => {
  setFormData({
    ...formData,
    variant_attributes: [
      ...formData.variant_attributes,
      { key: "", value: "" },
    ],
  });
};

const updateVariantRow = (index, field, value) => {
  const updated = [...formData.variant_attributes];
  updated[index][field] = value;
  setFormData({ ...formData, variant_attributes: updated });
};

const removeVariantRow = (index) => {
  setFormData({
    ...formData,
    variant_attributes: formData.variant_attributes.filter(
      (_, i) => i !== index
    ),
  });
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
            <h4 className="fw-bold mb-1">Model Master</h4>
            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Model Name"
              style={{ width: 180 }}
              value={filters.model_sku_name}
              onChange={(e) =>
                setFilters({ ...filters, model_sku_name: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Model SKU"
              style={{ width: 180 }}
              value={filters.model_sku_code}
              onChange={(e) =>
                setFilters({ ...filters, model_sku_code: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ model_sku_name: "", model_sku_code: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleAdd}
            >
              <Plus size={14} />
              Add Model
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
              <th>Model Name</th>
              <th>Model SKU</th>
              <th>Product Family</th>
              <th>Effective Date</th>
              <th>Status</th>
              <th>Created At</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((row, i) => (
              <tr key={row.model_id}>
                <td>{i + 1}</td>
                <td>{row.model_sku_name}</td>
                <td>{row.model_sku_code}</td>
                <td>{row.product_family}</td>
                <td>
                  {row.effective_date
                    ? new Date(row.effective_date).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      row.status ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {row.status ? "Active" : "Inactive"}
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
                    onClick={() => handleDelete(row.model_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredModels.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
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
            <h5 className="mb-3">Model Details</h5>

            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <strong className="text-muted">Model Name</strong>
                <span>{viewData.model_sku_name}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-muted">Model SKU</strong>
                <span>{viewData.model_sku_code}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-muted">Product Family</strong>
                <span>{viewData.product_family}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-muted">Effective Date</strong>
                <span>
                  {viewData.effective_date
                    ? new Date(viewData.effective_date).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-muted">Status</strong>
                <span>{viewData.status ? "Active" : "Inactive"}</span>
              </div>
              {/* ================= VARIANT ATTRIBUTES ================= */}
{viewData.variant_attributes &&
  Object.keys(viewData.variant_attributes).length > 0 && (
    <>
      <div className="mt-2">
        <strong className="text-muted">Variant Attributes</strong>
      </div>

      {Object.entries(viewData.variant_attributes).map(([key, value]) => (
        <div
          key={key}
          className="d-flex justify-content-between"
        >
          <span className="text-muted">{key}</span>
          <span>{value}</span>
        </div>
      ))}
    </>
)}

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
    <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
      <h5 className="mb-3">
        {isEditing ? "Edit Model" : "Add Model"}
      </h5>

      <div className="mb-2">
        <label className="form-label">Model Name</label>
        <input
          className="form-control"
          value={formData.model_sku_name}
          onChange={(e) =>
            setFormData({ ...formData, model_sku_name: e.target.value })
          }
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Model SKU</label>
        <input
          className="form-control"
          disabled={isEditing}
          value={formData.model_sku_code}
          onChange={(e) =>
            setFormData({ ...formData, model_sku_code: e.target.value })
          }
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Product Family</label>
        <input
          className="form-control"
          value={formData.product_family}
          onChange={(e) =>
            setFormData({ ...formData, product_family: e.target.value })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Effective Date</label>
        <input
          type="date"
          className="form-control"
          value={formData.effective_date}
          onChange={(e) =>
            setFormData({ ...formData, effective_date: e.target.value })
          }
        />
      </div>

      {/* ================= VARIANT ATTRIBUTES ================= */}
<div className="mt-3">
  <label className="form-label fw-semibold">
    Variant Attributes (Key – Value)
  </label>

  {formData.variant_attributes.map((row, index) => (
    <div
      key={index}
      className="d-flex gap-2 align-items-center mb-2"
    >
      <input
        className="form-control"
        placeholder="Key (e.g. Color)"
        value={row.key}
        onChange={(e) =>
          updateVariantRow(index, "key", e.target.value)
        }
      />

      <input
        className="form-control"
        placeholder="Value (e.g. Red)"
        value={row.value}
        onChange={(e) =>
          updateVariantRow(index, "value", e.target.value)
        }
      />

      <button
        className="btn btn-outline-danger btn-sm  d-flex align-items-center justify-content-center"
  style={{
    width: 35,
    height: 30,
    padding: 6,
  }}
        onClick={() => removeVariantRow(index)}
        title="Remove"
      >
        ✕
      </button>


<button
  className="btn btn-outline-primary btn-sm  d-flex align-items-center justify-content-center"
  style={{
    width: 35,
    height: 30,
    padding: 3,
  }}
  onClick={addVariantRow}
>
  <Plus size={20} />
</button>

    </div>
  ))}


</div>


      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.checked })
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


    </div>
  );
};

export default ModelMaster;
