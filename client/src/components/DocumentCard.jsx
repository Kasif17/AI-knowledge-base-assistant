import { FiFileText, FiFile, FiTrash2, FiEye, FiMessageSquare } from "react-icons/fi";
import { formatBytes } from "../utils/formatBytes";
import { formatDate } from "../utils/formatDate";
import { FILE_TYPE_LABELS } from "../types";
import { cn } from "../utils/cn";

const FILE_ICONS = {
  pdf: FiFile,
  txt: FiFileText,
  md: FiFileText,
};

const STATUS_STYLES = {
  ready: "bg-accent-soft text-accent-dark",
  processing: "bg-ink/10 text-ink/60",
  failed: "bg-clay-soft text-clay",
};

const DocumentCard = ({ document, onPreview, onAsk, onDelete }) => {
  const Icon = FILE_ICONS[document.fileType] || FiFile;

  return (
    <div className="card p-4 flex flex-col gap-3 hover:border-accent/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold truncate" title={document.title}>
            {document.title}
          </p>
          <p className="text-xs text-ink/45 truncate">{document.originalName}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-ink/5 text-ink/60 font-medium">
          {FILE_TYPE_LABELS[document.fileType] || document.fileType}
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full font-medium capitalize",
            STATUS_STYLES[document.status]
          )}
        >
          {document.status}
        </span>
        <span className="text-ink/40">{formatBytes(document.fileSize)}</span>
        <span className="text-ink/40">{formatDate(document.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-ink/10 mt-1">
        <button
          onClick={() => onPreview(document)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-ink/70 hover:text-accent py-1.5 rounded-md hover:bg-accent-soft transition-colors"
        >
          <FiEye size={14} /> Preview
        </button>
        <button
          onClick={() => onAsk(document)}
          disabled={document.status !== "ready"}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-ink/70 hover:text-accent py-1.5 rounded-md hover:bg-accent-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <FiMessageSquare size={14} /> Ask
        </button>
        <button
          onClick={() => onDelete(document)}
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-clay hover:bg-clay-soft py-1.5 px-2.5 rounded-md transition-colors"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
