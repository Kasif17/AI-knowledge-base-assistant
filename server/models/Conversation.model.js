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

        // Tracks whether Gemini actually answered or the call failed and we
        // stored a fallback message — lets the history/dashboard distinguish
        // "AI said X" from "AI was unreachable" without guessing from the text.
        status: {
            type: String,
            enum: ["success", "failed"],
            default: "success",
        },
    },
    {
        timestamps: true, // createdAt doubles as the exchange's timestamp
        versionKey: false,
    }
);

// Powers "history for this user, newest first" and "history for this
// user filtered to one document" — the two ways /history gets queried.
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ user: 1, document: 1, createdAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;