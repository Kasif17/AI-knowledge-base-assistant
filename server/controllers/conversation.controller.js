import Document from "../models/Document.model.js";
import Conversation from "../models/Conversation.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import getPagination, { buildPaginationMeta } from "../utils/pagination.js";
import { buildPrompt } from "../services/prompt.service.js";
import { askGemini } from "../services/gemini.service.js";

/**
 * @route   POST /api/v1/ask
 * @access  Private
 *
 * Flow: verifyJWT (already ran) -> find document -> read textContent ->
 * build prompt -> Gemini -> save conversation -> respond
 */
export const askQuestion = asyncHandler(async (req, res) => {
    const { documentId, question } = req.body;

    if (!documentId || !question?.trim()) {
        throw new ApiError(400, "documentId and question are required");
    }

    // --- Find the document (scoped to the logged-in user) ---
    const document = await Document.findOne({
        _id: documentId,
        owner: req.user._id,
    });

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    if (document.status !== "ready" || !document.textContent) {
        throw new ApiError(
            422,
            "This document has no readable content to answer questions from"
        );
    }

    // --- Build the prompt and call Gemini ---
    const prompt = buildPrompt(document.textContent, question.trim());

    let answer;
    let status = "success";

    try {
        answer = await askGemini(prompt);
    } catch (err) {
        // Persist the failed attempt too, so it shows up in history instead
        // of silently vanishing, then re-throw so the request itself still
        // reports the failure to the client.
        status = "failed";
        answer =
            "Sorry, the AI service could not answer this question right now. Please try again later.";

        await Conversation.create({
            user: req.user._id,
            document: document._id,
            question: question.trim(),
            answer,
            status,
        });

        throw err;
    }

    const conversation = await Conversation.create({
        user: req.user._id,
        document: document._id,
        question: question.trim(),
        answer,
        status,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                conversation: {
                    id: conversation._id,
                    document: {
                        id: document._id,
                        title: document.title,
                    },
                    question: conversation.question,
                    answer: conversation.answer,
                    createdAt: conversation.createdAt,
                },
            },
            "Question answered successfully"
        )
    );
});

/**
 * @route   GET /api/v1/history
 * @access  Private
 * Query params: documentId (optional filter), page, limit
 */
export const getHistory = asyncHandler(async (req, res) => {
    const { documentId } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { user: req.user._id };
    if (documentId) filter.document = documentId;

    const [conversations, total] = await Promise.all([
        Conversation.find(filter)
            .populate("document", "title originalName fileType")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Conversation.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                conversations,
                pagination: buildPaginationMeta(page, limit, total),
            },
            conversations.length ? "History fetched successfully" : "No conversations found"
        )
    );
});