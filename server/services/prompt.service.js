
const MAX_CONTEXT_CHARS = 15000;

/**
 * Builds the prompt sent to Gemini for a document Q&A request.
 * Deliberately instructs the model to answer ONLY from the supplied
 * document and to say so explicitly when the answer isn't present —
 * this is what keeps answers grounded instead of the model guessing
 * from general knowledge.
 *
 * @param {string} documentText - extracted text of the document
 * @param {string} question - the user's question
 * @returns {string} the full prompt
 */
export const buildPrompt = (documentText, question) => {
    const context = documentText.slice(0, MAX_CONTEXT_CHARS);

    return `You are an AI assistant that answers questions about a specific document.

Rules:
- Only answer using information found in the document below.
- Do not use outside knowledge, even if you know the answer.
- If the answer isn't present in the document, reply exactly:
  "I couldn't find that information in the document."
- Keep answers concise and directly relevant to the question.

Document:
"""
${context}
"""

Question:
${question}

Answer:`;
};

export default buildPrompt;