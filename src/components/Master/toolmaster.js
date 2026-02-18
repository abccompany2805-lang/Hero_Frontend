  import { useState, useMemo } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
  import axios from "axios";
  import API_BASE_URL from "../../config";

  const emptyForm = {
    tool_code: "",
    tool_type: "",
    make: "",
    model: "",
    protocol: "",
    ip_address: "",
    is_active: true,
  };

  const fetchTools = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/tools`);
    return data;
  };

  const ToolMaster = () => {
    const queryClient = useQueryClient();

    const [filters, setFilters] = useState({
      tool_code: "",
      tool_type: "",
    });

    const [formData, setFormData] = useState(emptyForm);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(false);
    const [viewData, setViewData] = useState(null);

    /* ================= FETCH ================= */
    const { data = [], isLoading, isError } = useQuery({
      queryKey: ["tools"],
      queryFn: fetchTools,
    });

    /* ================= MUTATIONS ================= */
    const createMutation = useMutation({
      mutationFn: (newData) =>
        axios.post(`${API_BASE_URL}/api/tools`, newData),
      onSuccess: () => {
        queryClient.invalidateQueries(["tools"]);
        setShowModal(false);
      },
    });

    const updateMutation = useMutation({
      mutationFn: (updatedData) =>
        axios.put(
          `${API_BASE_URL}/api/tools/${updatedData.tool_id}`,
          updatedData
        ),
      onSuccess: () => {
        queryClient.invalidateQueries(["tools"]);
        setShowModal(false);
      },
    });

    const deleteMutation = useMutation({
      mutationFn: (id) =>
        axios.delete(`${API_BASE_URL}/api/tools/${id}`),
      onSuccess: () =>
        queryClient.invalidateQueries(["tools"]),
    });

    /* ================= FILTER ================= */
    const filteredData = useMemo(() => {
      return data.filter((row) =>
        Object.entries(filters).every(([key, val]) =>
          val
            ? String(row[key] || "")
                .toLowerCase()
                .includes(val.toLowerCase())
            : true
        )
      );
    }, [data, filters]);

    /* ================= HANDLERS ================= */
    const handleAdd = () => {
      setFormData(emptyForm);
      setIsEditing(false);
      setShowModal(true);
    };

    const handleEdit = (row) => {
      setFormData(row);
      setIsEditing(true);
      setShowModal(true);
    };

    const handleDelete = (id) => {
      if (!window.confirm("Delete this tool?")) return;
      deleteMutation.mutate(id);
    };

    const handleSave = () => {
      if (isEditing) {
        updateMutation.mutate(formData);
      } else {
        createMutation.mutate(formData);
      }
    };

    /* ================= UI ================= */
    return (
      <div className="container-fluid py-3">
        {/* HEADER */}
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
            <h4 className="fw-bold mb-1">Tool Master</h4>

            <div className="d-flex gap-2 flex-wrap align-items-center">
              <input
                className="form-control"
                placeholder="Tool Code"
                style={{ width: 160 }}
                value={filters.tool_code}
                onChange={(e) =>
                  setFilters({ ...filters, tool_code: e.target.value })
                }
              />

              <input
                className="form-control"
                placeholder="Tool Type"
                style={{ width: 160 }}
                value={filters.tool_type}
                onChange={(e) =>
                  setFilters({ ...filters, tool_type: e.target.value })
                }
              />

              <button
                className="btn btn-sm"
                style={{ background: "#d3e7f3" }}
                onClick={() =>
                  setFilters({
                    tool_code: "",
                    tool_type: "",
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
                Add Tool
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive card shadow-sm border-0 rounded-4 my-4 mx-2">
          <table className="table table-bordered align-middle mb-0">
            <thead>
              <tr className="text-muted">
                <th>Sr</th>
                <th>Tool Code</th>
                <th>Type</th>
                <th>Make</th>
                <th>Model</th>
                <th>Protocol</th>
                <th>IP</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan="9" className="text-center text-danger">
                    Error loading tools
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredData.map((row, i) => (
                  <tr key={row.tool_id}>
                    <td>{i + 1}</td>
                    <td>{row.tool_code}</td>
                    <td>{row.tool_type}</td>
                    <td>{row.make}</td>
                    <td>{row.model}</td>
                    <td>{row.protocol}</td>
                    <td>{row.ip_address}</td>
                    <td>
                      {row.is_active ? (
                        <span className="badge bg-success">
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-secondary btn-sm me-2"
                        onClick={() => {
                          setViewData(row);
                          setShowView(true);
                        }}
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
                        onClick={() =>
                          handleDelete(row.tool_id)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

              {!isLoading && filteredData.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No tools found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ADD / EDIT MODAL */}
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
                {isEditing ? "Edit Tool" : "Add Tool"}
              </h5>

              {[
                "tool_code",
                "tool_type",
                "make",
                "model",
                "protocol",
                "ip_address",
              ].map((key) => (
                <div className="mb-2" key={key}>
                  <label className="form-label">
                    {key.replace("_", " ")}
                  </label>
                  <input
                    className="form-control"
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked,
                    })
                  }
                />
                <label className="form-check-label">
                  Active
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
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
              <h5 className="mb-3">Tool Details</h5>

              {Object.entries(viewData).map(([k, v]) => (
                <div
                  key={k}
                  className="d-flex justify-content-between"
                >
                  <strong>{k}</strong>
                  <span>{String(v)}</span>
                </div>
              ))}

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

  export default ToolMaster;
