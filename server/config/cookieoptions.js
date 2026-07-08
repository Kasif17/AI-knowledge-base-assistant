
const isProduction = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; 
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

export const accessTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? "None" : "Lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
};

export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
};