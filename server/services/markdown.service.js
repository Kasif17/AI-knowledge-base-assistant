import fs from "fs/promises";
import MarkdownIt from "markdown-it";

const MAX_CHARS = 100000;
const md = new MarkdownIt();

const stripHtml = (html) =>
    html
        .replace(/<[^>]*>/g, " ") // drop tags
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

/**
 * Reads a .md file, renders it with markdown-it, then flattens it to
 * plain text for storage/search/AI context.
 * @param {string} filePath - absolute path to the stored .md file
 * @returns {{ text: string }}
 */
const extractFromMarkdown = async (filePath) => {
    const raw = await fs.readFile(filePath, "utf-8");
    const html = md.render(raw);
    const text = stripHtml(html).slice(0, MAX_CHARS);
    return { text };
};

export default extractFromMarkdown;