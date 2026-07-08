import jwt from "jsonwebtoken";
import User from "../models/User.model.js"; // adjust path to match your project
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

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
