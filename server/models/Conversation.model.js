import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true,
        },

        question: {
            type: String,
            required: [true, "Question is required"],
            trim: true,
            maxlength: 2000,
        },

        answer: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["success", "failed"],
            default: "success",
        },
    },
    {
        timestamps: true, 
        versionKey: false,
    }
);

conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ user: 1, document: 1, createdAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;