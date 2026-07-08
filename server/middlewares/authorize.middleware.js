import ApiError from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            // Defensive check — means this middleware was used without verifyJWT first
            throw new ApiError(401, "Not authenticated");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Requires one of the following roles: ${allowedRoles.join(
                    ", "
                )}`
            );
        }

        next();
    };
};

export default authorizeRoles;