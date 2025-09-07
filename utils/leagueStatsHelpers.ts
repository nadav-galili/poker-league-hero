import { colors } from "@/colors";
import { LeagueStats } from "@/hooks/useLeagueStats";
import { formatCurrency, formatDuration } from "./leagueStatsFormatters";

export interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle: string;
}

export interface TopPlayer {
  title: string;
  player: {
    name: string;
    profit?: number;
    gamesPlayed?: number;
  };
  icon: string;
  color: string;
}

export const createStatCards = (stats: LeagueStats, t: (key: string) => string): StatCard[] => [
  {
    title: t("totalGames"),
    value: stats.totalGames.toString(),
    icon: "game-controller",
    color: colors.primary,
    subtitle: `${stats.activeGames} ${t("active")}, ${stats.finishedGames} ${t("finished")}`,
  },
  {
    title: t("totalProfit"),
    value: formatCurrency(stats.totalProfit),
    icon: "trending-up",
    color: stats.totalProfit >= 0 ? colors.success : colors.error,
    subtitle: stats.totalProfit >= 0 ? t("positiveProfit") : t("negativeProfit"),
  },
  {
    title: t("totalBuyIns"),
    value: formatCurrency(stats.totalBuyIns),
    icon: "arrow-down-circle",
    color: colors.secondary,
    subtitle: t("totalMoneyIn"),
  },
  {
    title: t("totalBuyOuts"),
    value: formatCurrency(stats.totalBuyOuts),
    icon: "arrow-up-circle",
    color: colors.accent,
    subtitle: t("totalMoneyOut"),
  },
  {
    title: t("totalPlayers"),
    value: stats.totalPlayers.toString(),
    icon: "people",
    color: colors.info,
    subtitle: t("uniquePlayers"),
  },
  {
    title: t("avgGameDuration"),
    value: formatDuration(stats.averageGameDuration),
    icon: "time",
    color: colors.highlight,
    subtitle: t("perGame"),
  },
];

export const createTopPlayers = (stats: LeagueStats, t: (key: string) => string): TopPlayer[] => [
  {
    title: t("mostProfitablePlayer"),
    player: stats.mostProfitablePlayer,
    icon: "trophy",
    color: colors.success,
  },
  {
    title: t("mostActivePlayer"),
    player: stats.mostActivePlayer,
    icon: "star",
    color: colors.primary,
  },
];