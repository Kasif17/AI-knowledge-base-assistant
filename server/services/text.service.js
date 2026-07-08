import fs from "fs/promises";

const MAX_CHARS = 100000;

/**
 * Reads a .txt file from disk as plain UTF-8 text.
 * @param {string} filePath - absolute path to the stored .txt file
 * @returns {{ text: string }}
 */
const extractFromTxt = async (filePath) => {
    const raw = await fs.readFile(filePath, "utf-8");
    const text = raw.trim().slice(0, MAX_CHARS);
    return { text };
};

export default extractFromTxt;