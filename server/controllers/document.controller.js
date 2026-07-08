import path from "path";
import Document from "../models/Document.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { safeUnlink } from "../utils/fileHelpers.js";
import getPagination, { buildPaginationMeta } from "../utils/pagination.js";

import extractFromPdf from "../services/pdf.service.js";
import extractFromTxt from "../services/text.service.js";
import extractFromMarkdown from "../services/markdown.service.js";

// Routes the extraction step to the right service based on fileType.
// This is the one place you'd touch to add a new supported file type.
const extractByType = {
    pdf: extractFromPdf,
    txt: extractFromTxt,
    md: extractFromMarkdown,
};

const PREVIEW_LENGTH = 500;

// Fields returned in list/preview responses — deliberately excludes the
// full textContent so list endpoints stay light.
const LIST_PROJECTION =
    "title originalName fileType fileSize owner metadata status createdAt updatedAt";

/**
 * @route   POST /api/v1/documents/upload
 * @access  Private
 *
 * Flow: JWT (already verified by middleware) -> Multer (already ran, req.file
 * is populated) -> extract text -> save metadata + text in MongoDB -> respond
 */
export const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const { path: absolutePath, filename, originalname, mimetype, size } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const fileType = { ".pdf": "pdf", ".txt": "txt", ".md": "md" }[ext];

    // Path relative to project root — never store the absolute machine path
    const storagePath = path.relative(process.cwd(), absolutePath);

    // --- Extract text using the type-appropriate service ---
    let extracted;
    let status = "processing";
    try {
        extracted = await extractByType[fileType](absolutePath);
        status = extracted.text && extracted.text.length > 0 ? "ready" : "failed";
    } catch (err) {
        // Don't fail the whole request — record the document as "failed" so
        // the user can see it and re-upload, instead of losing the file
        // silently or getting an opaque 500.
        // Still log the real cause: swallowing this completely is exactly
        // what made the original PDFParse bug hard to diagnose.
        console.error("Document text extraction failed:", err);
        status = "failed";
        extracted = { text: "" };
    }

    if (status === "failed") {
        await safeUnlink(absolutePath);
        throw new ApiError(
            422,
            "The file was uploaded but its content could not be read. Make sure it isn't corrupted or empty."
        );
    }

    const wordCount = extracted.text.split(/\s+/).filter(Boolean).length;

    const document = await Document.create({
        title: req.body.title?.trim() || path.parse(originalname).name,
        originalName: originalname,
        fileName: filename,
        fileType,
        fileSize: size,
        storagePath,
        owner: req.user._id,
        textContent: extracted.text,
        metadata: {
            charCount: extracted.text.length,
            wordCount,
            pageCount: extracted.pageCount ?? null,
        },
        status,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                document: {
                    id: document._id,
                    title: document.title,
                    originalName: document.originalName,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    metadata: document.metadata,
                    status: document.status,
                    createdAt: document.createdAt,
                },
            },
            "Document uploaded and processed successfully"
        )
    );
});

/**
 * @route   GET /api/v1/documents
 * @access  Private
 * Query params: page, limit, search, sortBy ("latest" | "oldest" | "title"), fileType
 */
export const listDocuments = asyncHandler(async (req, res) => {
    const { search = "", fileType, sortBy = "latest" } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { owner: req.user._id };

    if (search.trim()) {
        filter.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { originalName: { $regex: search.trim(), $options: "i" } },
        ];
    }

    if (fileType && ["pdf", "txt", "md"].includes(fileType)) {
        filter.fileType = fileType;
    }

    const sortOptions = {
        latest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        title: { title: 1 },
    };
    const sort = sortOptions[sortBy] || sortOptions.latest;

    const [documents, total] = await Promise.all([
        Document.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(limit),
        Document.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                documents,
                pagination: buildPaginationMeta(page, limit, total),
            },
            documents.length ? "Documents fetched successfully" : "No documents found"
        )
    );
});

/**
 * @route   GET /api/v1/documents/:id
 * @access  Private
 * Returns title, metadata, a text preview, owner, and upload date —
 * not the full textContent (keep that for the /ask flow, not this view).
 */
export const previewDocument = asyncHandler(async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        owner: req.user._id,
    }).populate("owner", "firstName lastName email");

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    const preview =
        document.textContent.length > PREVIEW_LENGTH
            ? `${document.textContent.slice(0, PREVIEW_LENGTH)}…`
            : document.textContent;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                id: document._id,
                title: document.title,
                originalName: document.originalName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                metadata: document.metadata,
                status: document.status,
                preview,
                owner: document.owner,
                uploadedAt: document.createdAt,
            },
            "Document preview fetched successfully"
        )
    );
});

/**
 * @route   DELETE /api/v1/documents/:id
 * @access  Private
 * Removes both the MongoDB record and the physical file on disk.
 */
export const deleteDocument = asyncHandler(async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        owner: req.user._id,
    });

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    const absolutePath = path.join(process.cwd(), document.storagePath);

    // Delete the DB record first: if file deletion fails afterward, we don't
    // leave an orphaned Mongo record pointing at a "deleted-but-not-really" file.
    // Either order has a tiny failure window; this order favors not showing
    // the user a document they just asked to delete.
    await Document.deleteOne({ _id: document._id });
    await safeUnlink(absolutePath);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Document deleted successfully"));
});

/**
 * @route   GET /api/v1/documents/search
 * @access  Private
 * Query params: q (search term), page, limit
 * Searches across title, originalName, and textContent using Mongo's text index.
 */
export const searchDocuments = asyncHandler(async (req, res) => {
    const { q = "" } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    if (!q.trim()) {
        throw new ApiError(400, "Search query 'q' is required");
    }

    const filter = {
        owner: req.user._id,
        $text: { $search: q.trim() },
    };

    const [documents, total] = await Promise.all([
        Document.find(filter, { score: { $meta: "textScore" } })
            .select(LIST_PROJECTION)
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limit),
        Document.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                documents,
                pagination: buildPaginationMeta(page, limit, total),
            },
            documents.length ? "Search results fetched" : "No matching documents found"
        )
    );
});

// import path from "path";
// import Document from "../models/Document.model.js";
// import ApiResponse from "../utils/ApiResponse.js";
// import ApiError from "../utils/ApiError.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import { safeUnlink } from "../utils/fileHelpers.js";
// import getPagination, { buildPaginationMeta } from "../utils/pagination.js";

// import extractFromPdf from "../services/pdf.service.js";
// import extractFromTxt from "../services/text.service.js";
// import extractFromMarkdown from "../services/markdown.service.js";

// // Routes the extraction step to the right service based on fileType.
// // This is the one place you'd touch to add a new supported file type.
// const extractByType = {
//     pdf: extractFromPdf,
//     txt: extractFromTxt,
//     md: extractFromMarkdown,
// };

// const PREVIEW_LENGTH = 500;

// // Fields returned in list/preview responses — deliberately excludes the
// // full textContent so list endpoints stay light.
// const LIST_PROJECTION =
//     "title originalName fileType fileSize owner metadata status createdAt updatedAt";

// /**
//  * @route   POST /api/v1/documents/upload
//  * @access  Private
//  *
//  * Flow: JWT (already verified by middleware) -> Multer (already ran, req.file
//  * is populated) -> extract text -> save metadata + text in MongoDB -> respond
//  */
// export const uploadDocument = asyncHandler(async (req, res) => {
//     if (!req.file) {
//         throw new ApiError(400, "No file uploaded");
//     }

//     const { path: absolutePath, filename, originalname, mimetype, size } = req.file;
//     const ext = path.extname(originalname).toLowerCase();
//     const fileType = { ".pdf": "pdf", ".txt": "txt", ".md": "md" }[ext];

//     // Path relative to project root — never store the absolute machine path
//     const storagePath = path.relative(process.cwd(), absolutePath);

//     // --- Extract text using the type-appropriate service ---
//     let extracted;
//     let status = "processing";
//     try {
//         extracted = await extractByType[fileType](absolutePath);
//         status = extracted.text && extracted.text.length > 0 ? "ready" : "failed";
//     } catch (err) {
//         // Don't fail the whole request — record the document as "failed" so
//         // the user can see it and re-upload, instead of losing the file
//         // silently or getting an opaque 500.
//         status = "failed";
//         extracted = { text: "" };
//     }

//     if (status === "failed") {
//         await safeUnlink(absolutePath);
//         throw new ApiError(
//             422,
//             "The file was uploaded but its content could not be read. Make sure it isn't corrupted or empty."
//         );
//     }

//     const wordCount = extracted.text.split(/\s+/).filter(Boolean).length;

//     const document = await Document.create({
//         title: req.body.title?.trim() || path.parse(originalname).name,
//         originalName: originalname,
//         fileName: filename,
//         fileType,
//         fileSize: size,
//         storagePath,
//         owner: req.user._id,
//         textContent: extracted.text,
//         metadata: {
//             charCount: extracted.text.length,
//             wordCount,
//             pageCount: extracted.pageCount ?? null,
//         },
//         status,
//     });

//     return res.status(201).json(
//         new ApiResponse(
//             201,
//             {
//                 document: {
//                     id: document._id,
//                     title: document.title,
//                     originalName: document.originalName,
//                     fileType: document.fileType,
//                     fileSize: document.fileSize,
//                     metadata: document.metadata,
//                     status: document.status,
//                     createdAt: document.createdAt,
//                 },
//             },
//             "Document uploaded and processed successfully"
//         )
//     );
// });

// /**
//  * @route   GET /api/v1/documents
//  * @access  Private
//  * Query params: page, limit, search, sortBy ("latest" | "oldest" | "title"), fileType
//  */
// export const listDocuments = asyncHandler(async (req, res) => {
//     const { search = "", fileType, sortBy = "latest" } = req.query;
//     const { page, limit, skip } = getPagination(req.query);

//     const filter = { owner: req.user._id };

//     if (search.trim()) {
//         filter.$or = [
//             { title: { $regex: search.trim(), $options: "i" } },
//             { originalName: { $regex: search.trim(), $options: "i" } },
//         ];
//     }

//     if (fileType && ["pdf", "txt", "md"].includes(fileType)) {
//         filter.fileType = fileType;
//     }

//     const sortOptions = {
//         latest: { createdAt: -1 },
//         oldest: { createdAt: 1 },
//         title: { title: 1 },
//     };
//     const sort = sortOptions[sortBy] || sortOptions.latest;

//     const [documents, total] = await Promise.all([
//         Document.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(limit),
//         Document.countDocuments(filter),
//     ]);

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 documents,
//                 pagination: buildPaginationMeta(page, limit, total),
//             },
//             documents.length ? "Documents fetched successfully" : "No documents found"
//         )
//     );
// });

// /**
//  * @route   GET /api/v1/documents/:id
//  * @access  Private
//  * Returns title, metadata, a text preview, owner, and upload date —
//  * not the full textContent (keep that for the /ask flow, not this view).
//  */
// export const previewDocument = asyncHandler(async (req, res) => {
//     const document = await Document.findOne({
//         _id: req.params.id,
//         owner: req.user._id,
//     }).populate("owner", "firstName lastName email");

//     if (!document) {
//         throw new ApiError(404, "Document not found");
//     }

//     const preview =
//         document.textContent.length > PREVIEW_LENGTH
//             ? `${document.textContent.slice(0, PREVIEW_LENGTH)}…`
//             : document.textContent;

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 id: document._id,
//                 title: document.title,
//                 originalName: document.originalName,
//                 fileType: document.fileType,
//                 fileSize: document.fileSize,
//                 metadata: document.metadata,
//                 status: document.status,
//                 preview,
//                 owner: document.owner,
//                 uploadedAt: document.createdAt,
//             },
//             "Document preview fetched successfully"
//         )
//     );
// });

// /**
//  * @route   DELETE /api/v1/documents/:id
//  * @access  Private
//  * Removes both the MongoDB record and the physical file on disk.
//  */
// export const deleteDocument = asyncHandler(async (req, res) => {
//     const document = await Document.findOne({
//         _id: req.params.id,
//         owner: req.user._id,
//     });

//     if (!document) {
//         throw new ApiError(404, "Document not found");
//     }

//     const absolutePath = path.join(process.cwd(), document.storagePath);

//     // Delete the DB record first: if file deletion fails afterward, we don't
//     // leave an orphaned Mongo record pointing at a "deleted-but-not-really" file.
//     // Either order has a tiny failure window; this order favors not showing
//     // the user a document they just asked to delete.
//     await Document.deleteOne({ _id: document._id });
//     await safeUnlink(absolutePath);

//     return res
//         .status(200)
//         .json(new ApiResponse(200, null, "Document deleted successfully"));
// });

// /**
//  * @route   GET /api/v1/documents/search
//  * @access  Private
//  * Query params: q (search term), page, limit
//  * Searches across title, originalName, and textContent using Mongo's text index.
//  */
// export const searchDocuments = asyncHandler(async (req, res) => {
//     const { q = "" } = req.query;
//     const { page, limit, skip } = getPagination(req.query);

//     if (!q.trim()) {
//         throw new ApiError(400, "Search query 'q' is required");
//     }

//     const filter = {
//         owner: req.user._id,
//         $text: { $search: q.trim() },
//     };

//     const [documents, total] = await Promise.all([
//         Document.find(filter, { score: { $meta: "textScore" } })
//             .select(LIST_PROJECTION)
//             .sort({ score: { $meta: "textScore" } })
//             .skip(skip)
//             .limit(limit),
//         Document.countDocuments(filter),
//     ]);

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 documents,
//                 pagination: buildPaginationMeta(page, limit, total),
//             },
//             documents.length ? "Search results fetched" : "No matching documents found"
//         )
//     );
// });