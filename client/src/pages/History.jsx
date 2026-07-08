import { useState } from "react";
import { FiClock, FiFileText } from "react-icons/fi";
import { useHistory } from "../hooks/useHistory";
import { useDocuments } from "../hooks/useDocuments";
import { formatDateTime } from "../utils/formatDate";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { cn } from "../utils/cn";

const History = () => {
  const [page, setPage] = useState(1);
  const [documentId, setDocumentId] = useState("");

  const { documents } = useDocuments({ page: 1, limit: 50 });
  const { conversations, pagination, loading, error } = useHistory({
    page,
    limit: 8,
    documentId: documentId || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="label-eyebrow mb-1">Archive</p>
          <h1 className="font-display text-3xl font-semibold">Conversation history</h1>
        </div>

        <select
          className="input-field max-w-xs"
          value={documentId}
          onChange={(e) => {
            setDocumentId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All documents</option>
          {documents.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <Spinner label="Loading history..." />}
      {error && <Alert type="error">{error}</Alert>}

      {!loading && !error && conversations.length === 0 && (
        <EmptyState
          icon={<FiClock />}
          title="No conversations yet"
          description="Questions you ask about your documents will show up here."
        />
      )}

      {!loading && conversations.length > 0 && (
        <>
          <div className="space-y-3">
            {conversations.map((c) => (
              <div key={c._id} className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-accent-dark bg-accent-soft px-2 py-0.5 rounded-full">
                    <FiFileText size={11} />
                    {c.document?.title || "Deleted document"}
                  </span>
                  <span className="text-xs text-ink/40">{formatDateTime(c.createdAt)}</span>
                </div>
                <p className="font-medium text-sm mb-2">{c.question}</p>
                <p
                  className={cn(
                    "text-sm rounded-md p-3",
                    c.status === "failed"
                      ? "bg-clay-soft text-clay"
                      : "bg-paper border border-ink/10 text-ink/75"
                  )}
                >
                  {c.answer}
                </p>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default History;
