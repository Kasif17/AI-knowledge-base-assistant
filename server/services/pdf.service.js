import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

// Cap how much text we keep per document — controls AI token usage and
// stops a single huge PDF from bloating MongoDB documents unboundedly.
const MAX_CHARS = 100000;

/**
 * Extracts plain text (and page count) from a PDF file on disk.
 *
 * pdf-parse v2 switched from a plain function (`pdf(buffer)`) to a class-based
 * API: you construct a PDFParse instance, call .getText()/.getInfo() on it,
 * and must call .destroy() when done to free memory.
 *
 * @param {string} filePath - absolute path to the stored PDF
 * @returns {{ text: string, pageCount: number|null }}
 */
const extractFromPdf = async (filePath) => {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });

    try {
        const [textResult, infoResult] = await Promise.all([
            parser.getText(),
            parser.getInfo().catch(() => null), // page count is a nice-to-have, not worth failing the whole extraction over
        ]);

        const text = (textResult.text || "").trim().slice(0, MAX_CHARS);

        return {
            text,
            pageCount: infoResult?.total ?? null,
        };
    } finally {
        // Always release the parser's resources, success or failure
        await parser.destroy();
    }
};

export default extractFromPdf;