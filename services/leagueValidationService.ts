/**
 * League validation service
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Simple client-side validation for league invite codes
 */
export function validateInviteCode(inviteCode: string): ValidationResult {
  if (!inviteCode || typeof inviteCode !== "string") {
    return { isValid: false, error: "Invite code is required" };
  }

  const trimmedCode = inviteCode.trim();

  if (trimmedCode.length !== 5) {
    return {
      isValid: false,
      error: "Invite code must be exactly 5 characters",
    };
  }

  const validChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codeUpper = trimmedCode.toUpperCase();

  for (let i = 0; i < codeUpper.length; i++) {
    if (!validChars.includes(codeUpper[i])) {
      return {
        isValid: false,
        error: "Invite code contains invalid characters",
      };
    }
  }

  return { isValid: true };
}
