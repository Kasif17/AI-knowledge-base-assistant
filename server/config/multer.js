import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

// --- Allowed types ---
const ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/markdown": "md",
    "text/x-markdown": "md",
};
const ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".txt": "txt",
    ".md": "md",
};

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10);
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

// Resolve the file's logical type from its extension. Browsers/OSes are
// inconsistent about the mimetype they send for .md files in particular,
// so extension is the source of truth; mimetype is a secondary sanity check.
const resolveFileType = (originalName) => {
    const ext = path.extname(originalName).toLowerCase();
    return ALLOWED_EXTENSIONS[ext] || null;
};

// Make sure uploads/pdf, uploads/txt, uploads/md all exist before multer
// tries to write into them.
["pdf", "txt", "md"].forEach((type) => {
    const dir = path.join(UPLOAD_ROOT, type);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileType = resolveFileType(file.originalname);
        if (!fileType) {
            // fileFilter runs before this in practice, but guard anyway
            return cb(new ApiError(400, "Unsupported file type"), null);
        }
        cb(null, path.join(UPLOAD_ROOT, fileType));
    },
    filename: (req, file, cb) => {
        // Random filename — never trust/reuse the user-supplied name on disk,
        // both to avoid collisions and to avoid path-traversal/odd-character issues.
        const ext = path.extname(file.originalname).toLowerCase();
        const randomName = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${ext}`;
        cb(null, randomName);
    },
});

const fileFilter = (req, file, cb) => {
    const fileType = resolveFileType(file.originalname);
    const ext = path.extname(file.originalname).toLowerCase();

    if (!fileType) {
        return cb(
            new ApiError(
                400,
                `Unsupported file type "${ext}". Allowed types: PDF, TXT, Markdown (.md)`
            ),
            false
        );
    }

    // .md files get sent with all sorts of mimetypes depending on OS/browser,
    // so only enforce the mimetype check strictly for pdf/txt.
    if (fileType !== "md" && !ALLOWED_MIME_TYPES[file.mimetype]) {
        return cb(
            new ApiError(400, `Unsupported MIME type "${file.mimetype}"`),
            false
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
        files: 1,
    },
});

export default upload;