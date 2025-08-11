import * as Sentry from "@sentry/react-native";

/**
 * Utility functions for Sentry error tracking
 */

/**
 * Capture an exception with additional context
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>
) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Capture a message with level and additional context
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
};

/**
 * Set user context for error tracking
 */
export const setUser = (user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}) => {
  Sentry.setUser(user);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category: category || "custom",
    level: "info",
    data,
  });
};

/**
 * Set tags for filtering in Sentry dashboard
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Set multiple tags at once
 */
export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

/**
 * Profile a function execution with error tracking
 */
export const profileFunction = <T extends (...args: any[]) => any>(
  fn: T,
  functionName: string
): T => {
  return ((...args: any[]) => {
    addBreadcrumb(`Function called: ${functionName}`, "function", { args });

    try {
      const result = fn(...args);

      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, { function: functionName, args });
          throw error;
        });
      } else {
        return result;
      }
    } catch (error) {
      captureException(error as Error, { function: functionName, args });
      throw error;
    }
  }) as T;
};

/**
 * Create a higher-order component that catches errors
 */
export const withSentryProfiling = <T extends (...args: any[]) => any>(
  Component: T,
  componentName: string
): T => {
  return profileFunction(Component, `component.${componentName}`);
};
