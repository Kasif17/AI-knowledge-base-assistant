import { useCallback, useEffect, useState } from "react";
import { listDocumentsRequest, searchDocumentsRequest } from "../services/documentService";
import { getErrorMessage } from "../api/axiosClient";

/**
 * Fetches the current user's documents, refetching whenever the params
 * (page, search, fileType, sortBy) change. Routes to the dedicated
 * /documents/search endpoint when a search term is present.
 */
export const useDocuments = (params) => {
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const request = params.search?.trim()
      ? searchDocumentsRequest({
          q: params.search.trim(),
          page: params.page,
          limit: params.limit,
        })
      : listDocumentsRequest(params);

    request
      .then((res) => {
        if (cancelled) return;
        setDocuments(res.data.documents);
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
  }, [params.page, params.limit, params.search, params.fileType, params.sortBy, refreshIndex]);

  return { documents, pagination, loading, error, refetch };
};
