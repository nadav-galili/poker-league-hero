//authentication constants
export const COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const COOKIE_MAX_AGE = 20;
export const JWT_EXPIRATION_TIME = "20s";
export const REFRESH_TOKEN_EXPIRY = "30d";
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

//refresh token constants
export const REFRESH_BEFORE_EXPIRY_SEC = 60;

//google auth constants
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET;

export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI}/api/auth/callback`;
export const GOOGLE_AUTH_URL = "https://accounts.coogle.com/0/oauth2/v2/auth";
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const JWT_TOKEN = process.env.JWT_SECRET;

///cookie settings
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  patth: "/",
  maxAge: COOKIE_MAX_AGE,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  path: "/api/auth/refresh",
  maxAge: REFRESH_TOKEN_MAX_AGE,
};
