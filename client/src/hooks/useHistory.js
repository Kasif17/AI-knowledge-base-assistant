import { useCallback, useEffect, useState } from "react";
import { getHistoryRequest } from "../services/conversationService";
import { getErrorMessage } from "../api/axiosClient";

export const useHistory = (params) => {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getHistoryRequest(params)
      .then((res) => {
        if (cancelled) return;
        setConversations(res.data.conversations);
        setPagination(res.data.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.documentId, refreshIndex]);

  return { conversations, pagination, loading, error, refetch };
};
