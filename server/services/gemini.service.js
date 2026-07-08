import { GoogleGenAI } from "@google/genai";
import ApiError from "../utils/ApiError.js";

let ai = null;
const getClient = () => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new ApiError(
                500,
                "AI service is not configured (missing GEMINI_API_KEY)"
            );
        }
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Sends a fully-built prompt to Gemini and returns the plain-text answer.
 * All Gemini-specific error shapes are normalized into ApiError here, so
 * the controller only ever has to handle one kind of failure.
 *
 * @param {string} prompt - the complete prompt (already includes document + question)
 * @returns {Promise<string>} the model's answer text
 */
export const askGemini = async (prompt) => {
    try {
        const client = getClient();

        const response = await client.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const answer = response?.text?.trim();

        if (!answer) {
            throw new ApiError(502, "AI service returned an empty response");
        }

        return answer;
    } catch (err) {
        if (err instanceof ApiError) throw err;

        const status = err.status || err.response?.status || err.code;

        if (status === 401 || status === 403) {
            throw new ApiError(500, "AI service authentication failed");
        }
        if (status === 429) {
            throw new ApiError(
                429,
                "AI service is rate-limited, please try again shortly"
            );
        }
        if (status === 400) {
            throw new ApiError(400, "AI service rejected the request (invalid input)");
        }

        throw new ApiError(502, "AI service failed to generate an answer");
    }
};

export default askGemini;