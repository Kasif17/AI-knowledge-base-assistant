import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiSearch, FiX, FiFileText } from "react-icons/fi";
import { useDocuments } from "../hooks/useDocuments";
import { useDebounce } from "../hooks/useDebounce";
import { uploadDocumentRequest, deleteDocumentRequest } from "../services/documentService";
import { getErrorMessage } from "../api/axiosClient";
import FileDropzone from "../components/FileDropzone";
import DocumentCard from "../components/DocumentCard";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

const Documents = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  const { documents, pagination, loading, error, refetch } = useDocuments({
    page,
    limit: 9,
    search,
  });

  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [previewId, setPreviewId] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a file first");
      return;
    }
    setUploading(true);
    try {
      await uploadDocumentRequest(file, title.trim());
      toast.success("Document uploaded and processed");
      setFile(null);
      setTitle("");
      setShowUpload(false);
      setPage(1);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await deleteDocumentRequest(docToDelete._id);
      toast.success("Document deleted");
      setDocToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="label-eyebrow mb-1">Library</p>
          <h1 className="font-display text-3xl font-semibold">Documents</h1>
        </div>
        <button
          onClick={() => setShowUpload((s) => !s)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <FiPlus size={16} /> Upload document
        </button>
      </div>

      {showUpload && (
        <div className="card p-5 space-y-4">
          <FileDropzone onFileSelected={setFile} disabled={uploading} />
          <div>
            <label className="text-sm font-medium block mb-1" htmlFor="doc-title">
              Title <span className="text-ink/40 font-normal">(optional)</span>
            </label>
            <input
              id="doc-title"
              className="input-field"
              placeholder="Defaults to the file name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={() => {
                setShowUpload(false);
                setFile(null);
                setTitle("");
              }}
              disabled={uploading}
            >
              Cancel
            </button>
            <button className="btn-primary text-sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={16} />
        <input
          className="input-field pl-9 pr-9"
          placeholder="Search documents..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
        />
        {searchInput && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink"
            onClick={() => setSearchInput("")}
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {loading && <Spinner label="Loading documents..." />}
      {error && <Alert type="error">{error}</Alert>}

      {!loading && !error && documents.length === 0 && (
        <EmptyState
          icon={<FiFileText />}
          title={search ? "No matching documents" : "No documents yet"}
          description={
            search
              ? "Try a different search term."
              : "Upload a PDF, TXT, or Markdown file to start asking questions about it."
          }
          action={
            !search && (
              <button className="btn-primary text-sm" onClick={() => setShowUpload(true)}>
                Upload a document
              </button>
            )
          }
        />
      )}

      {!loading && documents.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onPreview={(d) => setPreviewId(d._id)}
                onAsk={(d) => navigate("/ask", { state: { documentId: d._id, title: d.title } })}
                onDelete={(d) => setDocToDelete(d)}
              />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <DocumentPreviewModal
        documentId={previewId}
        onClose={() => setPreviewId(null)}
        onAsk={(doc) => {
          setPreviewId(null);
          navigate("/ask", { state: { documentId: doc.id, title: doc.title } });
        }}
      />

      <ConfirmModal
        open={!!docToDelete}
        title="Delete this document?"
        description={`"${docToDelete?.title}" and its conversation history will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  );
};

export default Documents;
