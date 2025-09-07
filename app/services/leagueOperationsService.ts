/**
 * League operations service
 */

import { BASE_URL } from "@/constants";
import { addBreadcrumb, captureException, captureMessage } from "@/utils/sentry";
import { validateInviteCode } from "./leagueValidationService";

export interface JoinLeagueResult {
  success: boolean;
  league?: {
    id: string;
    name: string;
  };
  error?: string;
}

/**
 * Join a league using an invite code
 */
export async function joinLeagueWithCode(
  code: string,
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>,
  t: (key: string) => string
): Promise<JoinLeagueResult> {
  try {
    if (!code) {
      return { success: false, error: "Please enter a league code" };
    }

    addBreadcrumb("User entered league code", "user_input", {
      screen: "MyLeagues",
      action: "join_league_code_entered",
      codeLength: code.length,
    });

    // Validate invite code format first
    const validation = validateInviteCode(code);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || "Invalid invite code format",
      };
    }

    // Call API to join league
    const response = await fetchWithAuth(`${BASE_URL}/api/leagues/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inviteCode: code.toUpperCase(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to join league");
    }

    captureMessage("User successfully joined league", "info", {
      screen: "MyLeagues",
      leagueId: data.league.id,
      leagueName: data.league.name,
      codeUsed: code,
    });

    return {
      success: true,
      league: {
        id: data.league.id,
        name: data.league.name,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to join league";

    captureException(error as Error, {
      function: "joinLeagueWithCode",
      screen: "MyLeagues",
      code: code || "empty",
      errorMessage,
    });

    return { success: false, error: errorMessage };
  }
}
