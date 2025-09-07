/**
 * League theme configurations
 */

import { LeagueTheme } from "@/types/league";
import { colors } from "@/colors";

export const leagueThemes: LeagueTheme[] = [
  {
    themeColor: colors.primary,
    accentColor: colors.primaryTint,
    variant: "primary" as const,
  },
  {
    themeColor: colors.secondary,
    accentColor: colors.secondaryTint,
    variant: "secondary" as const,
  },
  {
    themeColor: colors.highlight,
    accentColor: colors.highlightTint,
    variant: "highlight" as const,
  },
  {
    themeColor: colors.accent,
    accentColor: colors.accentTint,
    variant: "accent" as const,
  },
];

/**
 * Assign theme colors to leagues based on their index
 */
export function addThemeToLeagues<T extends { id: string }>(
  leagues: T[]
): (T & LeagueTheme)[] {
  return leagues.map((league, index) => {
    const theme = leagueThemes[index % leagueThemes.length];
    return {
      ...league,
      ...theme,
    };
  });
}
