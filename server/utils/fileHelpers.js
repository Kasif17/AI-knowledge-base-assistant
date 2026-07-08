import fs from "fs/promises";


export const safeUnlink = async (filePath) => {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (err) {
        if (err.code === "ENOENT") return false; // already gone, that's fine
        throw err;
    }
};