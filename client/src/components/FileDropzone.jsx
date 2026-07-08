import { useRef, useState } from "react";
import { FiUploadCloud, FiFile, FiX } from "react-icons/fi";
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from "../types";
import { formatBytes } from "../utils/formatBytes";
import { cn } from "../utils/cn";

const ALLOWED_EXT = [".pdf", ".txt", ".md"];

const FileDropzone = ({ onFileSelected, disabled }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const validateAndSet = (file) => {
    setError("");
    if (!file) return;

    const ext = `.${file.name.split(".").pop().toLowerCase()}`;
    if (!ALLOWED_EXT.includes(ext)) {
      setError("Unsupported file type. Please upload a PDF, TXT, or Markdown file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (selectedFile) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <FiFile size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{selectedFile.name}</p>
          <p className="text-xs text-ink/45">{formatBytes(selectedFile.size)}</p>
        </div>
        {!disabled && (
          <button
            onClick={clearFile}
            className="p-1.5 rounded-md hover:bg-ink/5 text-ink/50"
            aria-label="Remove file"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-md py-10 px-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-accent bg-accent-soft" : "border-ink/20 hover:border-accent/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <FiUploadCloud size={28} className="mx-auto mb-3 text-ink/40" />
        <p className="font-medium text-sm">
          Drag & drop a file, or <span className="text-accent">browse</span>
        </p>
        <p className="text-xs text-ink/45 mt-1">
          PDF, TXT, or Markdown - up to {MAX_FILE_SIZE_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_EXTENSIONS}
          className="hidden"
          disabled={disabled}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-xs text-clay mt-2">{error}</p>}
    </div>
  );
};

export default FileDropzone;
