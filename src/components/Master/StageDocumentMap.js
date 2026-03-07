import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

const DOC_API = `${API_BASE_URL}/api/stage-documents`;
const UPLOAD_API = `${API_BASE_URL}/api/stage-documents/upload`;
const MODEL_API = `${API_BASE_URL}/api/models`;
const STAGE_API = `${API_BASE_URL}/api/stages`;

const emptyForm = {
  model_id: "",
  stage_id: "",
  files: [],
};

const fetchDocuments = async () => {
  const res = await axios.get(DOC_API);
  return res.data.data;   // 👈 THIS IS THE FIX
};

const fetchModels = async () => {
  const res = await axios.get(MODEL_API);
  return res.data;
};

const fetchStages = async () => {
  const res = await axios.get(STAGE_API);
  return res.data;
};

const StageDocumentsMaster = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    model: "",
    stage: "",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);

const { data, isLoading } = useQuery({
  queryKey: ["stage-documents"],
  queryFn: fetchDocuments,
});

const documents = Array.isArray(data) ? data : [];

  const { data: models = [] } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: fetchStages,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => {
      const data = new FormData();
      data.append("model_id", formData.model_id);
      data.append("stage_id", formData.stage_id);

      formData.files.forEach((file) => {
        data.append("documents", file);
      });

      return axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stage-documents"]);
      setShowModal(false);
      setFormData(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${DOC_API}/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries(["stage-documents"]),
  });

  const filteredData = useMemo(() => {
    return documents.filter((row) =>
      Object.entries(filters).every(([key, val]) =>
        val
          ? String(row[key] || "")
              .toLowerCase()
              .includes(val.toLowerCase())
          : true
      )
    );
  }, [documents, filters]);

  const getModelSKU = (id) =>
    models.find((m) => m.model_id === id)?.model_sku || id;

  const getStageNumber = (id) =>
    stages.find((s) => s.stage_id === id)?.stage_no || id;

  return (
    <div className="container-fluid py-3">

      {/* HEADER (MATCHES PART MASTER) */}
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
          <h4 className="fw-bold mb-1">Stage Documents</h4>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              className="form-control"
              placeholder="Model SKU"
              style={{ width: 150 }}
              value={filters.model}
              onChange={(e) =>
                setFilters({ ...filters, model: e.target.value })
              }
            />

            <input
              className="form-control"
              placeholder="Stage No"
              style={{ width: 150 }}
              value={filters.stage}
              onChange={(e) =>
                setFilters({ ...filters, stage: e.target.value })
              }
            />

            <button
              className="btn btn-sm"
              style={{ background: "#d3e7f3" }}
              onClick={() =>
                setFilters({ model: "", stage: "" })
              }
            >
              <RotateCcw size={14} />
            </button>

            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <Plus size={14} />
              Upload
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
              <th>Model SKU</th>
              <th>Stage No</th>
              <th>Total Files</th>
              <th>Created</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredData.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td>{row.model_name}</td>
                  <td>{getStageNumber(row.stage_id)}</td>
                  <td>{row.documents?.length || 0}</td>
                  <td>
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        deleteMutation.mutate(row.id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

            {!isLoading && filteredData.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL (MATCH STYLE) */}
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
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{ width: 450 }}
          >
            <h5 className="mb-3">Upload Stage Documents</h5>

            <div className="mb-2">
              <label className="form-label">Model SKU</label>
              <select
                className="form-control"
                value={formData.model_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    model_id: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
             {models.map((m) => (
  <option key={m.model_id} value={m.model_id}>
    {m.model_code} - {m.model_name}
  </option>
))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Stage No</label>
              <select
                className="form-control"
                value={formData.stage_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stage_id: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                {stages.map((s) => (
                  <option
                    key={s.stage_id}
                    value={s.stage_id}
                  >
                    {s.stage_no}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Upload Files</label>
              <input
                type="file"
                multiple
                className="form-control"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    files: Array.from(e.target.files),
                  })
                }
              />
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
                onClick={() =>
                  uploadMutation.mutate(formData)
                }
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageDocumentsMaster;