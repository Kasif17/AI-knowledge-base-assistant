import Document from "../models/Document.model.js";
import Conversation from "../models/Conversation.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [totalDocuments, totalQuestions, recentUploads, recentChats] =
        await Promise.all([
            Document.countDocuments({ owner: userId }),
            Conversation.countDocuments({ user: userId }),
            Document.find({ owner: userId })
                .select("title originalName fileType status createdAt")
                .sort({ createdAt: -1 })
                .limit(5),
            Conversation.find({ user: userId })
                .populate("document", "title")
                .select("question answer document createdAt")
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                metrics: {
                    totalDocuments,
                    totalQuestions,
                },
                recentUploads,
                recentChats,
            },
            "Dashboard data fetched successfully"
        )
    );
});