import { BASE_URL } from '@/constants';
import { tokenCache } from '@/utils/cache';
import { captureException } from '@/utils/sentry';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
   AuthError,
   AuthRequestConfig,
   DiscoveryDocument,
   exchangeCodeAsync,
   makeRedirectUri,
   useAuthRequest,
} from 'expo-auth-session';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as jose from 'jose';
import * as React from 'react';
import { Platform } from 'react-native';
WebBrowser.maybeCompleteAuthSession();

// 🔧 DEV: Set to true to force onboarding to show during testing
const DEV_FORCE_ONBOARDING = false;
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
   cookieExpiration?: number; // Added for web cookie expiration tracking
   userId?: number; // Database user ID
};

const AuthContext = React.createContext({
   user: null as AuthUser | null,
   signIn: () => {},
   signOut: () => {},
   signInWithApple: () => {},
   signInWithAppleWebBrowser: () => {},
   fetchWithAuth: (url: string, options: RequestInit = {}) =>
      Promise.resolve(new Response()),
   isLoading: false,
   error: null as AuthError | null,
   hasSeenOnboarding: false,
   markOnboardingComplete: async () => {},
   resetOnboarding: async () => {},
   refreshUser: async () => {},
});

const config: AuthRequestConfig = {
   clientId: 'google',
   scopes: ['openid', 'profile', 'email'],
   redirectUri: makeRedirectUri(),
};

const appleConfig: AuthRequestConfig = {
   clientId: 'apple',
   scopes: ['name', 'email'],
   redirectUri: makeRedirectUri(),
};
const discovery: DiscoveryDocument = {
   authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
   tokenEndpoint: `${BASE_URL}/api/auth/token`,
};
const appleDiscovery: DiscoveryDocument = {
   authorizationEndpoint: `${BASE_URL}/api/auth/apple/authorize`,
   tokenEndpoint: `${BASE_URL}/api/auth/apple/token`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = React.useState<AuthUser | null>(null);
   const [accessToken, setAccessToken] = React.useState<string | null>(null);
   const [appleRequest, appleResponse, promptAppleAsync] = useAuthRequest(
      appleConfig,
      appleDiscovery
   );
   const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
   const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState(false);
   const [request, response, promptAsync] = useAuthRequest(config, discovery);

   // Function to completely reset the auth session
   const resetAuthSession = React.useCallback(() => {
      // Force a complete reset by clearing the response
      console.log('🔄 Forcing complete auth session reset...');
      // We'll need to handle this differently
   }, []);

   const [isLoading, setIsLoading] = React.useState(false);
   const [error, setError] = React.useState<AuthError | null>(null);
   const isWeb = Platform.OS === 'web';
   const refreshInProgressRef = React.useRef(false);
   const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
      null
   );

   React.useEffect(() => {
      handleResponse();
   }, [response]);

   React.useEffect(() => {
      handleAppleResponse();
   }, [appleResponse]);

   // Check if user is authenticated
   React.useEffect(() => {
      // clear any existing timer
      if (refreshTimerRef.current) {
         clearTimeout(refreshTimerRef.current);
         refreshTimerRef.current = null;
      }

      if (isWeb && user?.cookieExpiration) {
         const now = Math.floor(Date.now() / 1000);
         const secondsLeft = user.cookieExpiration - now;
         const leadSeconds = 5;
         if (secondsLeft > leadSeconds) {
            refreshTimerRef.current = setTimeout(
               () => {
                  refreshAccessToken();
               },
               (secondsLeft - leadSeconds) * 1000
            );
         }
         return;
      }

      if (!isWeb && accessToken) {
         const decoded = jose.decodeJwt(accessToken) as any;
         const now = Math.floor(Date.now() / 1000);
         const secondsLeft = (decoded?.exp ?? now) - now;
         // Avoid tight loops: only schedule if > 10s remaining; else let API-triggered 401 refresh handle it
         const leadSeconds = 10;
         if (secondsLeft > leadSeconds) {
            refreshTimerRef.current = setTimeout(
               () => {
                  refreshAccessToken();
               },
               (secondsLeft - leadSeconds) * 1000
            );
         }
      }
   }, [isWeb, user?.cookieExpiration, accessToken]);

   React.useEffect(() => {
      const restoreSession = async () => {
         setIsLoading(true);
         try {
            // On web, check if we're on privacy/terms route - skip onboarding for these
            if (isWeb && typeof window !== 'undefined') {
               const currentPath = window.location.pathname;
               if (currentPath === '/privacy' || currentPath === '/terms') {
                  // Automatically mark onboarding as seen for privacy/terms routes (used for store listings)
                  setHasSeenOnboarding(true);
                  return; // Skip the rest of the session restore for these routes
               }
            }

            // Restore onboarding flag first
            let storedOnboarding: string | null = null;
            if (isWeb) {
               // For web: Use localStorage
               if (typeof window !== 'undefined') {
                  storedOnboarding = localStorage.getItem('hasSeenOnboarding');
               }
            } else {
               // For native: Use SecureStore
               storedOnboarding = await SecureStore.getItemAsync('hasSeenOnboarding');
            }
            
            if (storedOnboarding === 'true' && !DEV_FORCE_ONBOARDING) {
               setHasSeenOnboarding(true);
            } else if (DEV_FORCE_ONBOARDING) {
               // Force show onboarding in dev mode
               setHasSeenOnboarding(false);
            }

            if (isWeb) {
               // For web: Check if we have a session cookie by making a request to a session endpoint
               const sessionResponse = await fetch(
                  `${BASE_URL}/api/auth/session`,
                  {
                     method: 'GET',
                     credentials: 'include', // Important: This includes cookies in the request
                  }
               );

               if (sessionResponse.ok) {
                  const userData = await sessionResponse.json();
                  setUser(userData as AuthUser);
               } else {
                  console.log('No active web session found');

                  // Try to refresh the token using the refresh cookie
                  try {
                     await refreshAccessToken();
                  } catch (e) {
                     console.log('Failed to refresh token on startup');
                  }
               }
            } else {
               // For native: Try to use the stored access token first
               const storedAccessToken =
                  await tokenCache?.getToken('accessToken');
               const storedRefreshToken =
                  await tokenCache?.getToken('refreshToken');

               if (storedAccessToken) {
                  try {
                     // Check if the access token is still valid
                     const decoded = jose.decodeJwt(storedAccessToken);
                     const exp = (decoded as any).exp;
                     const now = Math.floor(Date.now() / 1000);

                     if (exp && exp > now) {
                        // Access token is still valid
                        setAccessToken(storedAccessToken);

                        if (storedRefreshToken) {
                           setRefreshToken(storedRefreshToken);
                        }

                        setUser(decoded as AuthUser);
                     } else if (storedRefreshToken) {
                        // Access token expired, but we have a refresh token
                        setRefreshToken(storedRefreshToken);
                        await refreshAccessToken(storedRefreshToken);
                     }
                  } catch (e) {
                     console.error('Error decoding stored token:', e);

                     //add sentry error
                     captureException(e as Error, {
                        function: 'restoreSession',
                        screen: 'Auth',
                        error: e as Error,
                     });

                     // Try to refresh using the refresh token
                     if (storedRefreshToken) {
                        setRefreshToken(storedRefreshToken);
                        await refreshAccessToken(storedRefreshToken);
                     }
                  }
               } else if (storedRefreshToken) {
                  // No access token, but we have a refresh token
                  setRefreshToken(storedRefreshToken);
                  await refreshAccessToken(storedRefreshToken);
               } else {
                  console.log('User is not authenticated');
               }
            }
         } catch (error) {
            console.error('Error restoring session:', error);
         } finally {
            setIsLoading(false);
         }
      };

      restoreSession();
   }, [isWeb]);

   // Function to refresh the access token
   const refreshAccessToken = async (tokenToUse?: string) => {
      // Prevent multiple simultaneous refresh attempts
      if (refreshInProgressRef.current) {
         console.log('Token refresh already in progress, skipping');
         return null;
      }

      refreshInProgressRef.current = true;

      try {
         console.log('Refreshing access token...');

         // Use the provided token or fall back to the state
         const currentRefreshToken = tokenToUse || refreshToken;

         console.log(
            'Current refresh token:',
            currentRefreshToken ? 'exists' : 'missing'
         );

         if (isWeb) {
            // For web: Use JSON for the request
            const refreshResponse = await fetch(
               `${BASE_URL}/api/auth/refresh`,
               {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ platform: 'web' }),
                  credentials: 'include',
               }
            );

            if (!refreshResponse.ok) {
               const errorData = await refreshResponse.json();
               console.error('Token refresh failed:', errorData);

               // If refresh fails due to expired token, sign out
               if (refreshResponse.status === 401) {
                  signOut();
               }
               return null;
            }

            // Fetch the session to get updated user data
            const sessionResponse = await fetch(
               `${BASE_URL}/api/auth/session`,
               {
                  method: 'GET',
                  credentials: 'include',
               }
            );

            if (sessionResponse.ok) {
               const sessionData = await sessionResponse.json();
               setUser(sessionData as AuthUser);
            }

            return null; // Web doesn't use access token directly
         } else {
            // For native: Use the refresh token
            if (!currentRefreshToken) {
               // Fallback: try using current access token via Authorization header
               if (accessToken) {
                  try {
                     const fallbackRes = await fetch(
                        `${BASE_URL}/api/auth/refresh`,
                        {
                           method: 'POST',
                           headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${accessToken}`,
                           },
                           body: JSON.stringify({ platform: 'native' }),
                        }
                     );
                     if (fallbackRes.ok) {
                        const tokens = await fallbackRes.json();
                        const newAccessToken = tokens.accessToken;
                        const newRefreshToken = tokens.refreshToken;
                        if (newAccessToken) {
                           setAccessToken(newAccessToken);
                           await tokenCache?.saveToken(
                              'accessToken',
                              newAccessToken
                           );
                           setUser(jose.decodeJwt(newAccessToken) as AuthUser);
                        }
                        if (newRefreshToken) {
                           setRefreshToken(newRefreshToken);
                           await tokenCache?.saveToken(
                              'refreshToken',
                              newRefreshToken
                           );
                        }
                        return newAccessToken ?? null;
                     }
                  } catch (err) {
                     console.error('Fallback refresh failed:', err);
                  }
               }
               console.error('No refresh token available');
               signOut();
               return null;
            }

            console.log('Using refresh token to get new tokens');
            const refreshResponse = await fetch(
               `${BASE_URL}/api/auth/refresh`,
               {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                     platform: 'native',
                     refreshToken: currentRefreshToken,
                  }),
               }
            );

            if (!refreshResponse.ok) {
               const errorData = await refreshResponse.json();
               console.error('Token refresh failed:', errorData);

               // If refresh fails due to expired token, sign out
               if (refreshResponse.status === 401) {
                  signOut();
               }
               return null;
            }

            // For native: Update both tokens
            const tokens = await refreshResponse.json();
            const newAccessToken = tokens.accessToken;
            const newRefreshToken = tokens.refreshToken;

            console.log(
               'Received new access token:',
               newAccessToken ? 'exists' : 'missing'
            );
            console.log(
               'Received new refresh token:',
               newRefreshToken ? 'exists' : 'missing'
            );

            if (newAccessToken) setAccessToken(newAccessToken);
            if (newRefreshToken) setRefreshToken(newRefreshToken);

            // Save both tokens to cache
            if (newAccessToken)
               await tokenCache?.saveToken('accessToken', newAccessToken);
            if (newRefreshToken)
               await tokenCache?.saveToken('refreshToken', newRefreshToken);

            // Update user data from the new access token
            if (newAccessToken) {
               const decoded = jose.decodeJwt(newAccessToken);
               console.log('Decoded user data:', decoded);
               // Check if we have all required user fields
               const hasRequiredFields =
                  decoded &&
                  (decoded as any).name &&
                  (decoded as any).email &&
                  (decoded as any).picture;

               if (!hasRequiredFields) {
                  console.warn(
                     'Refreshed token is missing some user fields:',
                     decoded
                  );
               }

               setUser(decoded as AuthUser);
            }

            return newAccessToken; // Return the new access token
         }
      } catch (error) {
         console.error('Error refreshing token:', error);
         // If there's an error refreshing, we should sign out
         signOut();
         return null;
      } finally {
         refreshInProgressRef.current = false;
      }
   };
   const handleAppleResponse = async () => {
      if (appleResponse?.type === 'success') {
         try {
            const { code } = appleResponse.params;
            const response = await exchangeCodeAsync(
               {
                  clientId: 'apple',
                  code,
                  redirectUri: makeRedirectUri(),
                  extraParams: {
                     platform: Platform.OS,
                  },
               },
               appleDiscovery
            );
            console.log('response', response);
            if (isWeb) {
               // For web: The server sets the tokens in HTTP-only cookies
               // We just need to get the user data from the response
               const sessionResponse = await fetch(
                  `${BASE_URL}/api/auth/session`,
                  {
                     method: 'GET',
                     credentials: 'include',
                  }
               );

               if (sessionResponse.ok) {
                  const sessionData = await sessionResponse.json();
                  setUser(sessionData as AuthUser);
               }
            } else {
               // For native: The server returns both tokens in the response
               // We need to store these tokens securely and decode the user data
               await handleNativeTokens({
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken!,
               });
            }
         } catch (e) {
            console.log('Error exchanging code:', e);
         }
      } else if (appleResponse?.type === 'cancel') {
         console.log('appleResponse cancelled');
      } else if (appleResponse?.type === 'error') {
         console.log('appleResponse error');
      }
   };

   const handleNativeTokens = async (tokens: {
      accessToken: string;
      refreshToken: string;
   }) => {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
         tokens;

      console.log(
         'Received initial access token:',
         newAccessToken ? 'exists' : 'missing'
      );
      console.log(
         'Received initial refresh token:',
         newRefreshToken ? 'exists' : 'missing'
      );

      // Store tokens in state
      if (newAccessToken) setAccessToken(newAccessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);

      // Save tokens to secure storage for persistence
      if (newAccessToken)
         await tokenCache?.saveToken('accessToken', newAccessToken);
      if (newRefreshToken)
         await tokenCache?.saveToken('refreshToken', newRefreshToken);

      // Decode the JWT access token to get user information
      if (newAccessToken) {
         const decoded = jose.decodeJwt(newAccessToken);
         setUser(decoded as AuthUser);
      }
   };

   async function handleResponse() {
      // This function is called when Google redirects back to our app
      // The response contains the authorization code that we'll exchange for tokens
      if (response?.type === 'success') {
         try {
            setIsLoading(true);
            // Extract the authorization code from the response
            // This code is what we'll exchange for access and refresh tokens
            const { code } = response.params;

            // Create form data to send to our token endpoint
            // We include both the code and platform information
            // The platform info helps our server handle web vs native differently
            const formData = new FormData();
            formData.append('code', code);

            // Add platform information for the backend to handle appropriately
            if (isWeb) {
               formData.append('platform', 'web');
            }

            console.log('request', request);

            // Get the code verifier from the request object
            // This is the same verifier that was used to generate the code challenge
            if (request?.codeVerifier) {
               formData.append('code_verifier', request.codeVerifier);
            } else {
               console.warn('No code verifier found in request object');
            }

            // Send the authorization code to our token endpoint
            // The server will exchange this code with Google for access and refresh tokens
            // For web: credentials are included to handle cookies
            // For native: we'll receive the tokens directly in the response
            const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
               method: 'POST',
               body: formData,
               credentials: isWeb ? 'include' : 'same-origin', // Include cookies for web
            });

            if (isWeb) {
               // For web: The server sets the tokens in HTTP-only cookies
               // We just need to get the user data from the response
               const userData = await tokenResponse.json();
               if (userData.success) {
                  // Fetch the session to get user data
                  // This ensures we have the most up-to-date user information
                  const sessionResponse = await fetch(
                     `${BASE_URL}/api/auth/session`,
                     {
                        method: 'GET',
                        credentials: 'include',
                     }
                  );

                  if (sessionResponse.ok) {
                     const sessionData = await sessionResponse.json();
                     setUser(sessionData as AuthUser);
                  }
               }
            } else {
               // For native: The server returns both tokens in the response
               // We need to store these tokens securely and decode the user data
               const tokens = await tokenResponse.json();
               await handleNativeTokens(tokens);
            }
         } catch (e) {
            console.error('Error handling auth response:', e);
         } finally {
            setIsLoading(false);
         }
      } else if (response?.type === 'cancel') {
         alert('Sign in cancelled');
      } else if (response?.type === 'error') {
         setError(response?.error as AuthError);
      }
   }

   const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
      if (isWeb) {
         // For web: Include credentials to send cookies
         const response = await fetch(url, {
            ...options,
            credentials: 'include',
         });

         // If the response indicates an authentication error, try to refresh the token
         if (response.status === 401) {
            console.log(
               'API request failed with 401, attempting to refresh token'
            );

            // Try to refresh the token
            await refreshAccessToken();

            // If we still have a user after refresh, retry the request
            if (user) {
               return fetch(url, {
                  ...options,
                  credentials: 'include',
               });
            }
         }

         return response;
      } else {
         // For native: Use token in Authorization header
         const response = await fetch(url, {
            ...options,
            headers: {
               ...options.headers,
               Authorization: `Bearer ${accessToken}`,
            },
         });

         // If the response indicates an authentication error, try to refresh the token
         if (response.status === 401) {
            console.log(
               'API request failed with 401, attempting to refresh token'
            );

            // Try to refresh the token and get the new token directly
            const newToken = await refreshAccessToken();

            // If we got a new token, retry the request with it
            if (newToken) {
               return fetch(url, {
                  ...options,
                  headers: {
                     ...options.headers,
                     Authorization: `Bearer ${newToken}`,
                  },
               });
            }
         }

         return response;
      }
   };

   const signIn = async () => {
      try {
         if (!request) {
            return;
         }

         await promptAsync();
      } catch (e) {
         console.error('Error during sign in:', e);
      }
   };

   const signOut = async () => {
      if (isWeb) {
         // For web: Call logout endpoint to clear the cookie
         try {
            await fetch(`${BASE_URL}/api/auth/logout`, {
               method: 'POST',
               credentials: 'include',
            });
         } catch (error) {
            console.error('Error during web logout:', error);
         }
      } else {
         // For native: Clear both tokens from cache
         await tokenCache?.deleteToken('accessToken');
         await tokenCache?.deleteToken('refreshToken');
      }

      // Clear state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);

      // Clear any other potential storage
      try {
         // Clear from SecureStore directly as backup
         if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
         }

         // Clear any other potential storage keys
         const allKeys = [
            'accessToken',
            'refreshToken',
            'auth_token',
            'refresh_token',
            'expo.auth.access_token',
            'expo.auth.refresh_token',
         ];

         for (const key of allKeys) {
            try {
               await SecureStore.deleteItemAsync(key);
            } catch (e) {
               // Ignore errors for non-existent keys
            }
         }
         // Force a complete reset of the auth session
         resetAuthSession();
      } catch (error) {
         console.log('⚠️ Error clearing SecureStore:', error);
      }

      // Redirect to index/login screen
      router.replace('/');
   };

   const markOnboardingComplete = async () => {
      try {
         console.log('Marking onboarding as complete');
         if (isWeb) {
            // For web: Use localStorage
            if (typeof window !== 'undefined') {
               localStorage.setItem('hasSeenOnboarding', 'true');
            }
         } else {
            // For native: Use SecureStore
            await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
         }
         setHasSeenOnboarding(true);
      } catch (error) {
         console.error('Error marking onboarding complete:', error);
         captureException(error as Error, {
            function: 'markOnboardingComplete',
            screen: 'Auth',
            error: error as Error,
         });
      }
   };

   const resetOnboarding = async () => {
      try {
         console.log('Resetting onboarding (dev only)');
         if (isWeb) {
            // For web: Use localStorage
            if (typeof window !== 'undefined') {
               localStorage.removeItem('hasSeenOnboarding');
            }
         } else {
            // For native: Use SecureStore
            await SecureStore.deleteItemAsync('hasSeenOnboarding');
         }
         setHasSeenOnboarding(false);
      } catch (error) {
         console.error('Error resetting onboarding:', error);
      }
   };

   const signInWithAppleWebBrowser = async () => {
      try {
         if (!appleRequest) {
            console.log('No appleRequest');
            return;
         }
         await promptAppleAsync();
      } catch (e) {
         console.log(e);
      }
   };

   const signInWithApple = async () => {
      try {
         const rawNonce = randomUUID();
         const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
               AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
               AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
            nonce: rawNonce,
         });
         console.log('🍎 credential', JSON.stringify(credential, null, 2));

         if (credential.fullName?.givenName && credential.email) {
            // This is the first sign in
            // This is our only chance to get the user's name and email
            // We need to store this info in our database
            // You can handle this on the server side as well, just keep in mind that
            // Apple only provides name and email on the first sign in
            // On subsequent sign ins, these fields will be null
            console.log('🍎 first sign in');
         }

         // Send both the identity token and authorization code to server
         const appleResponse = await fetch(
            `${BASE_URL}/api/auth/apple/apple-native`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  identityToken: credential.identityToken,
                  rawNonce, // Use the rawNonce we generated and passed to Apple

                  // IMPORTANT:
                  // Apple only provides name and email on the first sign in
                  // On subsequent sign ins, these fields will be null
                  // We need to store the user info from the first sign in in our database
                  // And retrieve it on subsequent sign ins using the stable user ID
                  givenName: credential.fullName?.givenName,
                  familyName: credential.fullName?.familyName,
                  email: credential.email,
               }),
            }
         );

         const tokens = await appleResponse.json();
         await handleNativeTokens(tokens);
      } catch (error) {
         console.error('Error during sign in with Apple:', error);
      }
   };

   const refreshUser = async () => {
      try {
         console.log('🔄 Refreshing user data...');
         if (isWeb) {
            const sessionResponse = await fetch(
               `${BASE_URL}/api/auth/session`,
               {
                  method: 'GET',
                  credentials: 'include',
               }
            );

            if (sessionResponse.ok) {
               const sessionData = await sessionResponse.json();
               setUser(sessionData as AuthUser);
            }
         } else {
            // For native: refresh token to get updated user info in new access token
            if (refreshToken) {
               await refreshAccessToken(refreshToken);
            }
         }
      } catch (error) {
         console.error('Error refreshing user data:', error);
      }
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            signIn,
            signOut,
            signInWithAppleWebBrowser,
            signInWithApple,

            isLoading,
            error,
            fetchWithAuth,
            hasSeenOnboarding,
            markOnboardingComplete,
            resetOnboarding,
            refreshUser,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = React.useContext(AuthContext);
   if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
};
