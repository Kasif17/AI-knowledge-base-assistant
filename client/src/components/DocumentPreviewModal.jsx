import { useEffect, useState } from "react";
import { FiX, FiMessageSquare } from "react-icons/fi";
import { getDocumentRequest } from "../services/documentService";
import { getErrorMessage } from "../api/axiosClient";
import { formatBytes } from "../utils/formatBytes";
import { formatDateTime } from "../utils/formatDate";
import { FILE_TYPE_LABELS } from "../types";
import Spinner from "./Spinner";
import Alert from "./Alert";

const DocumentPreviewModal = ({ documentId, onClose, onAsk }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    setError("");
    getDocumentRequest(documentId)
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (!documentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative card w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-ink/10">
          <div>
            <p className="label-eyebrow mb-1">Document Preview</p>
            <p className="font-display text-xl font-semibold">
              {data?.title || "Loading..."}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-ink/5 text-ink/50">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {loading && <Spinner label="Fetching document..." />}
          {error && <Alert type="error">{error}</Alert>}

          {data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-ink/45 text-xs mb-0.5">File type</p>
                  <p className="font-medium">{FILE_TYPE_LABELS[data.fileType]}</p>
                </div>
                <div>
                  <p className="text-ink/45 text-xs mb-0.5">Size</p>
                  <p className="font-medium">{formatBytes(data.fileSize)}</p>
                </div>
                <div>
                  <p className="text-ink/45 text-xs mb-0.5">Uploaded</p>
                  <p className="font-medium">{formatDateTime(data.uploadedAt)}</p>
                </div>
                <div>
                  <p className="text-ink/45 text-xs mb-0.5">Owner</p>
                  <p className="font-medium truncate">
                    {data.owner?.firstName} {data.owner?.lastName}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-ink/45 text-xs mb-1.5">Content preview</p>
                <p className="text-sm leading-relaxed bg-paper border border-ink/10 rounded-md p-3 whitespace-pre-wrap">
                  {data.preview || "No preview available."}
                </p>
              </div>
            </div>
          )}
        </div>

        {data && data.status === "ready" && (
          <div className="p-4 border-t border-ink/10">
            <button
              onClick={() => onAsk(data)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <FiMessageSquare size={16} /> Ask a question about this document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
