import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config"; // adjust path if needed

const StageGuard = ({ allowedTypes, children }) => {
  const { stageNo } = useParams();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const validateStage = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/stages`);

        const stages = res.data;

        const stage = stages.find(
          (s) => s.stage_no === Number(stageNo)
        );

        if (
          stage &&
          stage.is_active &&
          allowedTypes.includes(stage.stage_type)
        ) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (err) {
        console.error("Stage validation error:", err);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    validateStage();
  }, [stageNo, allowedTypes]);

  if (loading) return <div>Validating Stage...</div>;

  if (!isAllowed) return <Navigate to="/" replace />;

  return children;
};

export default StageGuard;