//authentication constants
export const COOKIE_NAME = "auth_token";
export const TOKEN_KEY_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const COOKIE_MAX_AGE = 15 * 60;
export const JWT_EXPIRATION_TIME = "15m";
export const REFRESH_TOKEN_EXPIRY = "30d";
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

//refresh token constants
export const REFRESH_BEFORE_EXPIRY_SEC = 60;

//google auth constants
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/callback`;
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

///env constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const JWT_TOKEN = process.env.JWT_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;

///cookie settings
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None" as const,
  path: "/api/auth/refresh",
  maxAge: REFRESH_TOKEN_MAX_AGE,
};
