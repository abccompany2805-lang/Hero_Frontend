import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  RotateCcw
} from "lucide-react";

import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/processmaster`;

const emptyForm = {
  operation_code: "",
  operation_name: "",
  operation_type: "",
  ctq_flag: false,
  standard_cycle_time: "",
  mandatory: false,
};

const ProcessMaster = () => {
  const [processes, setProcesses] = useState([]);
  const [filters, setFilters] = useState({
    operation_code: "",
    operation_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    const res = await axios.get(API_URL);
    setProcesses(res.data);
  };

  // ================= FILTER =================
  const filteredProcesses = useMemo(() => {
    return processes.filter(
      (p) =>
        p.operation_code
          .toLowerCase()
          .includes(filters.operation_code.toLowerCase()) &&
        p.operation_name
          .toLowerCase()
          .includes(filters.operation_name.toLowerCase())
    );
  }, [processes, filters]);

  // ================= CRUD =================
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

  const handleSave = async () => {
    const payload = {
      operation_code: formData.operation_code,
      operation_name: formData.operation_name,
      operation_type: formData.operation_type,
      ctq_flag: formData.ctq_flag,
      standard_cycle_time: Number(formData.standard_cycle_time),
      mandatory: formData.mandatory,
    };

    if (isEditing) {
      await axios.put(`${API_URL}/${formData.process_id}`, payload);
    } else {
      await axios.post(API_URL, payload);
    }

    setShowModal(false);
    fetchProcesses();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this process?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchProcesses();
    }
  };

  const handleView = (row) => {
    setViewData(row);
    setShowView(true);
  };

  // ================= UI =================
  // return (
  //   <div className="container-fluid py-4">
  //     {/* HEADER */}
  //     <div className="card shadow-sm border-0 rounded-4 mb-4">
  //       <div className="card-body">
  //         <h4 className="fw-bold mb-1">Process Master</h4>
  //         <small className="text-muted">
  //           Define operations, CTQ flags and cycle time
  //         </small>
  //       </div>
  //     </div>

  //     {/* TABLE */}
  //     <div className="card shadow-sm border-0 rounded-4">
  //       <div className="card-body">
  //         {/* FILTERS */}
  //         <div className="d-flex justify-content-end gap-2 mb-3 flex-wrap">
  //           <input
  //             className="form-control"
  //             placeholder="Operation Code"
  //             value={filters.operation_code}
  //             onChange={(e) =>
  //               setFilters({ ...filters, operation_code: e.target.value })
  //             }
  //             style={{ width: 220 }}
  //           />
  //           <input
  //             className="form-control"
  //             placeholder="Operation Name"
  //             value={filters.operation_name}
  //             onChange={(e) =>
  //               setFilters({ ...filters, operation_name: e.target.value })
  //             }
  //             style={{ width: 220 }}
  //           />

  //           <button
  //             className="btn btn-warning btn-sm"
  //             onClick={() =>
  //               setFilters({ operation_code: "", operation_name: "" })
  //             }
  //           >
  //             <RotateCcw size={14} />
  //           </button>

  //           <button className="btn btn-danger btn-sm" onClick={handleAdd}>
  //             <Plus size={14} /> Add Process
  //           </button>
  //         </div>

  //         {/* TABLE */}
  //         <div className="table-responsive">
  //           <table className="table align-middle">
  //             <thead className="text-muted">
  //               <tr>
  //                 <th>#</th>
  //                 <th>Op Code</th>
  //                 <th>Operation Name</th>
  //                 <th>Type</th>
  //                 <th>CTQ</th>
  //                 <th>Cycle Time (sec)</th>
  //                 <th>Mandatory</th>
  //                 <th>Created At</th>
  //                 <th className="text-end">Actions</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {filteredProcesses.map((row, i) => (
  //                 <tr key={row.process_id}>
  //                   <td>{i + 1}</td>
  //                   <td>{row.operation_code}</td>
  //                   <td>{row.operation_name}</td>
  //                   <td>{row.operation_type}</td>
  //                   <td>
  //                     <span
  //                       className={`badge ${
  //                         row.ctq_flag ? "bg-danger" : "bg-secondary"
  //                       }`}
  //                     >
  //                       {row.ctq_flag ? "CTQ" : "Non-CTQ"}
  //                     </span>
  //                   </td>
  //                   <td>{row.standard_cycle_time}</td>
  //                   <td>
  //                     <span
  //                       className={`badge ${
  //                         row.mandatory ? "bg-success" : "bg-secondary"
  //                       }`}
  //                     >
  //                       {row.mandatory ? "Yes" : "No"}
  //                     </span>
  //                   </td>
  //                   <td>
  //                     {new Date(row.created_at).toLocaleString()}
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
  //                       onClick={() => handleDelete(row.process_id)}
  //                     >
  //                       <Trash2 size={14} />
  //                     </button>
  //                   </td>
  //                 </tr>
  //               ))}

  //               {filteredProcesses.length === 0 && (
  //                 <tr>
  //                   <td colSpan="9" className="text-center text-muted">
  //                     No records found
  //                   </td>
  //                 </tr>
  //               )}
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>
  //     </div>

  //     {/* ADD / EDIT MODAL */}
  //     {showModal && (
  //                       <div
  //         style={{
  //           position: "fixed",
  //           inset: 0,
  //           background: "rgba(0,0,0,0.5)",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           zIndex: 1050,
  //         }}>
  //         <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
  //           <h5 className="mb-3">
  //             {isEditing ? "Edit Process" : "Add Process"}
  //           </h5>

  //           <input
  //             className="form-control mb-2"
  //             placeholder="Operation Code"
  //             disabled={isEditing}
  //             value={formData.operation_code}
  //             onChange={(e) =>
  //               setFormData({ ...formData, operation_code: e.target.value })
  //             }
  //           />

  //           <input
  //             className="form-control mb-2"
  //             placeholder="Operation Name"
  //             value={formData.operation_name}
  //             onChange={(e) =>
  //               setFormData({ ...formData, operation_name: e.target.value })
  //             }
  //           />

  //           <input
  //             className="form-control mb-2"
  //             placeholder="Operation Type"
  //             value={formData.operation_type}
  //             onChange={(e) =>
  //               setFormData({ ...formData, operation_type: e.target.value })
  //             }
  //           />

  //           <input
  //             type="number"
  //             className="form-control mb-3"
  //             placeholder="Standard Cycle Time (sec)"
  //             value={formData.standard_cycle_time}
  //             onChange={(e) =>
  //               setFormData({
  //                 ...formData,
  //                 standard_cycle_time: e.target.value,
  //               })
  //             }
  //           />

  //           <div className="form-check mb-2">
  //             <input
  //               className="form-check-input"
  //               type="checkbox"
  //               checked={formData.ctq_flag}
  //               onChange={(e) =>
  //                 setFormData({ ...formData, ctq_flag: e.target.checked })
  //               }
  //             />
  //             <label className="form-check-label">
  //               CTQ Operation
  //             </label>
  //           </div>

  //           <div className="form-check mb-3">
  //             <input
  //               className="form-check-input"
  //               type="checkbox"
  //               checked={formData.mandatory}
  //               onChange={(e) =>
  //                 setFormData({ ...formData, mandatory: e.target.checked })
  //               }
  //             />
  //             <label className="form-check-label">
  //               Mandatory Operation
  //             </label>
  //           </div>

  //           <div className="d-flex justify-content-end gap-2">
  //             <button
  //               className="btn btn-secondary"
  //               onClick={() => setShowModal(false)}
  //             >
  //               Cancel
  //             </button>
  //             <button
  //               className="btn btn-danger"
  //               onClick={handleSave}
  //             >
  //               Save
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     {/* VIEW MODAL */}
  //     {showView && viewData && (
  //                      <div
  //         style={{
  //           position: "fixed",
  //           inset: 0,
  //           background: "rgba(0,0,0,0.5)",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           zIndex: 1050,
  //         }}>
  //         <div className="bg-white rounded-4 shadow p-4" style={{ width: 450 }}>
  //           <h5 className="mb-3">Process Details</h5>

  //           {[
  //             ["Operation Code", viewData.operation_code],
  //             ["Operation Name", viewData.operation_name],
  //             ["Operation Type", viewData.operation_type],
  //             ["CTQ", viewData.ctq_flag ? "Yes" : "No"],
  //             ["Mandatory", viewData.mandatory ? "Yes" : "No"],
  //             ["Cycle Time", viewData.standard_cycle_time + " sec"],
  //           ].map(([k, v]) => (
  //             <p key={k}>
  //               <strong>{k}:</strong> {v}
  //             </p>
  //           ))}
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );


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
          <h4 className="fw-bold mb-1">Process Master</h4>
       
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <input
            className="form-control"
            placeholder="Operation Code"
            style={{ width: 160 }}
            value={filters.operation_code}
            onChange={(e) =>
              setFilters({ ...filters, operation_code: e.target.value })
            }
          />

          <input
            className="form-control"
            placeholder="Operation Name"
            style={{ width: 180 }}
            value={filters.operation_name}
            onChange={(e) =>
              setFilters({ ...filters, operation_name: e.target.value })
            }
          />

          <button
            className="btn btn-sm"
            style={{ background: "#d3e7f3" }}
            onClick={() =>
              setFilters({ operation_code: "", operation_name: "" })
            }
          >
            <RotateCcw size={14} />
          </button>

          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={handleAdd}
          >
            <Plus size={14} />
            Add Process
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
            <th>Op Code</th>
            <th>Operation Name</th>
            <th>Type</th>
            <th>CTQ</th>
            <th>Cycle Time (sec)</th>
            <th>Mandatory</th>
            <th>Created At</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProcesses.map((row, i) => (
            <tr key={row.process_id}>
              <td>{i + 1}</td>
              <td>{row.operation_code}</td>
              <td>{row.operation_name}</td>
              <td>{row.operation_type}</td>
              <td>
                <span
                  className={`badge ${
                    row.ctq_flag ? "bg-danger" : "bg-secondary"
                  }`}
                >
                  {row.ctq_flag ? "CTQ" : "Non-CTQ"}
                </span>
              </td>
              <td>{row.standard_cycle_time}</td>
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
                  onClick={() => handleDelete(row.process_id)}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}

          {filteredProcesses.length === 0 && (
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
        <div className="bg-white rounded-4 shadow p-4" style={{ width: 520 }}>
          <h5 className="mb-3">
            {isEditing ? "Edit Process" : "Add Process"}
          </h5>

          <input
            className="form-control mb-2"
            placeholder="Operation Code"
            disabled={isEditing}
            value={formData.operation_code}
            onChange={(e) =>
              setFormData({ ...formData, operation_code: e.target.value })
            }
          />

          <input
            className="form-control mb-2"
            placeholder="Operation Name"
            value={formData.operation_name}
            onChange={(e) =>
              setFormData({ ...formData, operation_name: e.target.value })
            }
          />

          <input
            className="form-control mb-2"
            placeholder="Operation Type"
            value={formData.operation_type}
            onChange={(e) =>
              setFormData({ ...formData, operation_type: e.target.value })
            }
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Standard Cycle Time (sec)"
            value={formData.standard_cycle_time}
            onChange={(e) =>
              setFormData({
                ...formData,
                standard_cycle_time: e.target.value,
              })
            }
          />

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={formData.ctq_flag}
              onChange={(e) =>
                setFormData({ ...formData, ctq_flag: e.target.checked })
              }
            />
            <label className="form-check-label">CTQ Operation</label>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={formData.mandatory}
              onChange={(e) =>
                setFormData({ ...formData, mandatory: e.target.checked })
              }
            />
            <label className="form-check-label">Mandatory Operation</label>
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
          <h5 className="mb-3">Process Details</h5>

          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Operation Code</strong>
              <span>{viewData.operation_code}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Operation Name</strong>
              <span>{viewData.operation_name}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Operation Type</strong>
              <span>{viewData.operation_type}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">CTQ</strong>
              <span>{viewData.ctq_flag ? "Yes" : "No"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Mandatory</strong>
              <span>{viewData.mandatory ? "Yes" : "No"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong className="text-muted">Cycle Time</strong>
              <span>{viewData.standard_cycle_time} sec</span>
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

export default ProcessMaster;
