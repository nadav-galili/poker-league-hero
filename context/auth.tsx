import { BASE_URL, TOKEN_KEY_NAME } from "@/constants";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { Platform } from "react-native";

import { tokenCache } from "@/utils/cache";
import * as jose from "jose";
WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  provider?: string;
  exp?: number;
  cookieExpiration?: number; ///added for web cookie expiration tracking
};

type AuthContextValue = {
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
  error: AuthError | null;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const isWeb = Platform.OS === "web";
  React.useEffect(() => {
    handleResponse();
  }, [response]);

  const handleResponse = async () => {
    if (response?.type === "success") {
      const { code } = response.params;

      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("code", code);
        if (isWeb) {
          formData.append("platform", "web");
        }
        if (request?.codeVerifier) {
          formData.append("code_verifier", request.codeVerifier);
        } else {
          console.warn("No code verifier found");
        }
        const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
          method: "POST",
          body: formData,
          credentials: isWeb ? "include" : "same-origin",
        });

        console.log("token response", tokenResponse);

        if (isWeb) {
          const userData = await tokenResponse.json();
          if (userData.success) {
            const sessionResponse = await fetch(
              `${BASE_URL}/api/auth/session`,
              { method: "GET", credentials: "include" }
            );
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              setUser(sessionData as AuthUser);
            }
          }
        } else {
          const token = await tokenResponse.json();
          const accessToken = token.accessToken;
          if (!accessToken) {
            console.log("no access token found");
            return;
          }
          setAccessToken(accessToken);
          ///save token to local storage
          tokenCache?.saveToken(TOKEN_KEY_NAME, accessToken);
          console.log(accessToken);
          //get user info
          const decoded = jose.decodeJwt(accessToken);
          setUser(decoded as AuthUser);
          console.log("user", user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }

      console.log("🚀 ~ handleResponse ~ code:", code);
    } else if (response?.type === "error") {
      setError(response.error as AuthError);
    }
  };

  const signIn = async () => {
    try {
      if (!request) {
        console.log("No request");
        return;
      }
      await promptAsync();
    } catch (error) {
      console.log(error);
    }
  };
  const signOut = async () => {};
  const fetchWithAuth = async (url: string, options?: RequestInit) => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        fetchWithAuth,
        isLoading,
        error,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
