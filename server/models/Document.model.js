import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 200,
        },

        // Name as uploaded by the user (e.g. "Leave Policy 2026.pdf")
        originalName: {
            type: String,
            required: true,
        },

        // Random, collision-safe name the file is actually stored under on disk
        fileName: {
            type: String,
            required: true,
            unique: true,
        },

        fileType: {
            type: String,
            enum: ["pdf", "txt", "md"],
            required: true,
        },

        // Bytes
        fileSize: {
            type: Number,
            required: true,
        },

        // Path relative to the project root, e.g. "uploads/pdf/171203-ab12cd.pdf"
        storagePath: {
            type: String,
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Plain-text content extracted from the file, used for search and
        // as the context fed to the AI when answering questions about this doc.
        textContent: {
            type: String,
            default: "",
        },

        metadata: {
            charCount: { type: Number, default: 0 },
            wordCount: { type: Number, default: 0 },
            // Only populated for PDFs; null for txt/md
            pageCount: { type: Number, default: null },
        },

        status: {
            type: String,
            enum: ["processing", "ready", "failed"],
            default: "processing",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Powers the /search endpoint's text search across these three fields
documentSchema.index({ title: "text", originalName: "text", textContent: "text" });

// Common list-query pattern: "this owner's documents, newest first"
documentSchema.index({ owner: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;