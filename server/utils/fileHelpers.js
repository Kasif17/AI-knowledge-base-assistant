import fs from "fs/promises";

/**
 * Deletes a file if it exists; never throws if it's already missing.
 * Used both for cleanup-on-failure during upload and for the delete route,
 * so a missing file on disk never blocks the corresponding DB operation.
 */
export const safeUnlink = async (filePath) => {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (err) {
        if (err.code === "ENOENT") return false; // already gone, that's fine
        throw err;
    }
};