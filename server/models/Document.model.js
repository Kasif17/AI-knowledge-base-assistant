import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 200,
        },

        originalName: {
            type: String,
            required: true,
        },

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

        fileSize: {
            type: Number,
            required: true,
        },

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

documentSchema.index({ title: "text", originalName: "text", textContent: "text" });

documentSchema.index({ owner: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;