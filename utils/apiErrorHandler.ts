import { addBreadcrumb, captureException, captureMessage } from "./sentry";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: any;
}

/**
 * Enhanced API error handler with Sentry integration
 */
export const handleApiError = (
  error: ApiError,
  context?: Record<string, any>
) => {
  // Add breadcrumb for API error
  addBreadcrumb(`API Error: ${error.message}`, "http", {
    status: error.status,
    code: error.code,
    url: context?.url,
    method: context?.method,
  });

  // Capture the error with additional context
  captureException(error, {
    apiError: true,
    status: error.status,
    code: error.code,
    response: error.response,
    ...context,
  });

  // Log user-friendly message based on error type
  if (error.status === 401) {
    captureMessage("User authentication failed", "warning", context);
  } else if (error.status === 403) {
    captureMessage("User access forbidden", "warning", context);
  } else if (error.status === 500) {
    captureMessage("Server error encountered", "error", context);
  } else if (error.status === 404) {
    captureMessage("Resource not found", "info", context);
  }

  return error;
};

/**
 * Wrapper for fetch requests with automatic error handling
 */
export const sentryFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  const startTime = Date.now();

  addBreadcrumb(`API Request: ${options?.method || "GET"} ${url}`, "http", {
    method: options?.method || "GET",
    url,
  });

  try {
    const response = await fetch(url, options);

    const duration = Date.now() - startTime;

    addBreadcrumb(`API Response: ${response.status}`, "http", {
      status: response.status,
      duration,
      url,
      method: options?.method || "GET",
    });

    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      ) as ApiError;
      error.status = response.status;
      error.response = await response
        .text()
        .catch(() => "Unable to read response");

      throw error;
    }

    return response;
  } catch (error) {
    const apiError = error as ApiError;
    handleApiError(apiError, {
      url,
      method: options?.method || "GET",
      duration: Date.now() - startTime,
    });

    throw error;
  }
};

/**
 * Higher-order function to wrap async functions with error handling
 */
export const withApiErrorHandling = <
  T extends (...args: any[]) => Promise<any>
>(
  fn: T,
  functionName: string
): T => {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error as ApiError, {
        function: functionName,
        arguments: args,
      });
      throw error;
    }
  }) as T;
};
