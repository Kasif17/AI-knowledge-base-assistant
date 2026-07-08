import { useEffect, useState, useCallback } from "react";
import { getDashboardRequest } from "../services/dashboardService";
import { getErrorMessage } from "../api/axiosClient";

export const useDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError("");
    getDashboardRequest()
      .then((res) => {
        setMetrics(res.data.metrics);
        setRecentUploads(res.data.recentUploads);
        setRecentChats(res.data.recentChats);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { metrics, recentUploads, recentChats, loading, error, refetch: fetchDashboard };
};
