import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Eye, RotateCcw } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const emptyForm = {
  logical_name: "",
};

/* ================= API ================= */

const fetchLogicalNames = async () => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/logical-names`
  );
  return data;
};

const LogicalNameMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    logical_name: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);

  /* ================= FETCH ================= */

  const { data: logicalNames = [], isLoading } = useQuery({
    queryKey: ["logicalNames"],
    queryFn: fetchLogicalNames,
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: (newData) =>
      axios.post(
        `${API_BASE_URL}/api/logical-names`,
        newData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["logicalNames"]);
      setShowModal(false);
    },
    onError: (err) =>
      alert(err.response?.data?.message || "Insert failed"),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      axios.put(
        `${API_BASE_URL}/api/logical-names/${updatedData.logical_id}`,
        updatedData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["logicalNames"]);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(
        `${API_BASE_URL}/api/logical-names/${id}`
      ),
    onSuccess: () =>
      queryClient.invalidateQueries(["logicalNames"]),
  });

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    return logicalNames.filter((row) =>
      filters.logical_name
        ? row.logical_name
            ?.toLowerCase()
            .includes(filters.logical_name.toLowerCase())
        : true
    );
  }, [logicalNames, filters]);

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
    if (!window.confirm("Delete this logical name?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.logical_name) {
      alert("Logical Name is required");
      return;
    }

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
          <h4 className="fw-bold mb-1">
            Logical Name Master
          </h4>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Search Logical Name"
              style={{ width: 220 }}
              value={filters.logical_name}
              onChange={(e) =>
                setFilters({
                  logical_name: e.target.value,
                })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({
                  logical_name: "",
                })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={handleAdd}
            >
              <Plus size={14} /> Add Logical Name
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
              <th>Logical Name</th>
              <th>Created At</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredData.map((row, i) => (
                <tr key={row.logical_id}>
                  <td>{i + 1}</td>
                  <td>{row.logical_name}</td>
                  <td>
                    {new Date(row.created_at).toLocaleString()}
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
                        handleDelete(row.logical_id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{ width: 500 }}
          >
            <h5 className="mb-3">
              {isEditing
                ? "Edit Logical Name"
                : "Add Logical Name"}
            </h5>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Logical Name
              </label>
              <input
                className="form-control"
                value={formData.logical_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logical_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
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
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{ width: 400 }}
          >
            <h5 className="mb-3">
              Logical Name Details
            </h5>

            <div className="d-flex justify-content-between">
              <strong>Name</strong>
              <span>{viewData.logical_name}</span>
            </div>

            <div className="d-flex justify-content-between mt-2">
              <strong>Created</strong>
              <span>
                {new Date(
                  viewData.created_at
                ).toLocaleString()}
              </span>
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

export default LogicalNameMaster;