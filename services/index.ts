/**
 * Services barrel export
 */

export { GameService, createGameService } from './gameService';
export {
   joinLeagueWithCode,
   type JoinLeagueResult,
} from './leagueOperationsService';
export { LeagueService, createLeagueService } from './leagueService';
export {
   shareLeague,
   type ShareResult,
   type ShareableLeague,
} from './leagueSharingService';
export {
   LeagueStatsService,
   createLeagueStatsService,
   type PlayerStat,
   type StatResponse,
   type StatType,
   type TopProfitPlayer,
   type TopProfitPlayerResponse,
} from './leagueStatsService';
export {
   validateInviteCode,
   type ValidationResult,
} from './leagueValidationService';
