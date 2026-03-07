import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../config";

const API_BASE = API_BASE_URL;
const FILE_BASE = API_BASE_URL;

const SOPViewer = () => {
  const { modelId, stageId } = useParams();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, [modelId, stageId]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/stage-documents/by-model-stage/${modelId}/${stageId}`
      );

      const docs = res.data.data.flatMap((item) => item.documents || []);
      setDocuments(docs);

    } catch (error) {
      console.error("Error loading SOP documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildFileUrl = (path) => {
    if (!path) return "";
    const cleaned = path.replace(/\\/g, "/");
    return `${FILE_BASE}/${cleaned}`;
  };

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % documents.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? documents.length - 1 : prev - 1
    );
  };

  if (loading) return <p>Loading SOP...</p>;

  if (documents.length === 0) {
    return (
      <div style={{ color: "#fff", background: "#000", height: "100vh" }}>
        No SOP documents uploaded.
      </div>
    );
  }

  const doc = documents[currentIndex];
  const fileUrl = buildFileUrl(doc.path);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      {/* MEDIA AREA */}
      <div style={{ width: "100%", height: "90%", textAlign: "center" }}>
        {doc.mime_type?.startsWith("image") && (
          <img
            src={fileUrl}
            alt={doc.original_name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        )}

        {doc.mime_type?.startsWith("video") && (
          <video
            controls
            autoPlay
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
          >
            <source src={fileUrl} type={doc.mime_type} />
          </video>
        )}
      </div>

      {/* NAVIGATION */}
      <div
        style={{
          height: "10%",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          color: "#fff"
        }}
      >
        <button onClick={prevMedia}>Previous</button>

        <span>
          {currentIndex + 1} / {documents.length}
        </span>

        <button onClick={nextMedia}>Next</button>
      </div>
    </div>
  );
};

export default SOPViewer;