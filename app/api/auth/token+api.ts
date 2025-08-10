import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_EXPIRY,
} from "@/constants";

import * as jose from "jose";

export async function POST(request: Request) {
  const body = (await request.formData()) as unknown as {
    get(name: string): any;
  };
  const code = body.get("code") as string;
  const platform = (body.get("platform") as string) || "native";
  if (!code) {
    return Response.json({ error: "missing auth code" }, { status: 400 });
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code,
    }),
  });

  const data = await response.json();

  if (!data.id_token) {
    return Response.json({ error: "missing id token" }, { status: 400 });
  }

  //we have id token
  const userInfo = jose.decodeJwt(data.id_token) as object;

  const { exp, ...userInfoWithoutExp } = userInfo as any;
  //use id
  const sub = (userInfo as { sub: string }).sub;
  const issuedAt = Math.floor(Date.now() / 1000);

  ///create access token short lived
  const accessToken = await new jose.SignJWT(userInfoWithoutExp)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(sub)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  // create refresh token (rotated by /api/auth/refresh)
  const refreshToken = await new jose.SignJWT({
    ...userInfoWithoutExp,
    jti: crypto.randomUUID(),
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  if (platform === "web") {
    const response = Response.json({
      success: true,
      issuedAt: issuedAt,
      expiresAt: issuedAt + COOKIE_MAX_AGE,
    });

    ///set the access token in an HTTTP-only cookie
    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${accessToken};Max-Age=${COOKIE_OPTIONS.maxAge};Path=${
        COOKIE_OPTIONS.path
      };${COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""}${
        COOKIE_OPTIONS.secure ? "Secure;" : ""
      } SameSite=${COOKIE_OPTIONS.sameSite};`
    );

    // set refresh token cookie
    response.headers.append(
      "Set-Cookie",
      `${REFRESH_COOKIE_NAME}=${refreshToken};Max-Age=${
        REFRESH_COOKIE_OPTIONS.maxAge
      };Path=${REFRESH_COOKIE_OPTIONS.path};${
        REFRESH_COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""
      }${REFRESH_COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${
        REFRESH_COOKIE_OPTIONS.sameSite
      };`
    );

    return response;
  }

  return Response.json({
    accessToken,
    refreshToken,
  });
}
