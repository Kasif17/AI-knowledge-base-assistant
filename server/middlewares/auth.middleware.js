import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // adjust path to match your project
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * verifyJWT
 *
 * Reads the access token from the accessToken cookie, or falls back to
 * an `Authorization: Bearer <token>` header for non-browser clients
 * (Postman, mobile apps, server-to-server calls).
 *
 * On success, attaches the full user document (minus password) to req.user.
 * On failure, throws a 401 — the global error handler turns this into
 * a standardized JSON response.
 */
const verifyJWT = asyncHandler(async (req, res, next) => {
    const tokenFromCookie = req.cookies?.accessToken;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
        throw new ApiError(401, "Access token is missing. Please log in.");
    }

    // --- Verify the token ---
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token has expired");
        }
        // Covers malformed tokens, bad signature (tampering), etc.
        throw new ApiError(401, "Invalid access token");
    }

    // --- Load the user from MongoDB ---
    // Re-fetching (rather than trusting the token payload) means role/active
    // status changes take effect immediately instead of waiting for the
    // token to expire.
    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(401, "User for this token no longer exists");
    }

    if (!user.isActive) {
        throw new ApiError(403, "This account has been deactivated");
    }

    // --- Attach the authenticated user to the request ---
    req.user = user;
    next();
});

export default verifyJWT;