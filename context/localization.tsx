import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useState,
} from 'react';
import { I18nManager } from 'react-native';

export type Language = 'en' | 'he';

interface LocalizationContextType {
   language: Language;
   setLanguage: (lang: Language) => Promise<void>;
   t: (key: string) => string;
   isRTL: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
   undefined
);

// Translation keys interface for type safety
export interface Translations {
   // Navigation
   myLeagues: string;
   account: string;

   // League Screen
   createLeague: string;
   joinLeague: string;
   noLeaguesYet: string;
   createFirstLeague: string;
   members: string;

   // League Names (these would be dynamic in real app)
   fridayNightPoker: string;
   weekendWarriors: string;
   royalFlushClub: string;
   highStakesHeroes: string;

   // Auth
   signInWithGoogle: string;
   continueAsGuest: string;
   signOut: string;

   // Account
   accountActions: string;
   userDetails: string;
   userId: string;
   firstName: string;
   lastName: string;
   provider: string;
   verified: string;

   // Common
   language: string;
   english: string;
   hebrew: string;
   success: string;
   ok: string;
   currency: string;

   // League Creation
   createLeaguePrompt: string;
   joinLeaguePrompt: string;
   enterLeagueCode: string;
   cancel: string;
   join: string;
   create: string;
   joinedLeagueSuccess: string;

   // Create League Screen
   leagueName: string;
   leagueDescription: string;
   maxMembers: string;
   privateLeague: string;
   createLeagueButton: string;
   backToLeagues: string;
   leagueImage: string;
   selectImage: string;
   uploadingImage: string;
   leagueCreatedSuccess: string;
   loginRequiredToCreateLeague: string;
   fixFormErrors: string;
   pleaseWait: string;
   dataDeletedSuccess: string;
   dataDeletionFailed: string;

   // New Screens
   games: string;
   stats: string;
   personalStats: string;

   // Share
   joinMyLeague: string;
   leagueCode: string;
   joinHere: string;
   shareLeague: string;
   error: string;
   failedToShare: string;

   // Error Boundary
   errorOccurred: string;
   errorMessage: string;
   tryAgain: string;

   // League Stats Screen
   loadingLeagueStats: string;
   leagueStats: string;
   loadingLeagueDetails: string;
   leagueNotFound: string;
   statistics: string;
   statsComingSoon: string;
   retry: string;
   quickStats: string;
   totalGames: string;
   activePlayersLabel: string;
   totalPot: string;
   lastGame: string;
   viewDetailedStats: string;
   viewStatsDescription: string;
   startNewGame: string;
   startGameDescription: string;
   checkingGames: string;
   checkingGamesDescription: string;
   continueGame: string;
   continueGameDescription: string;
   playerStats: string;
   leagueOverview: string;
   recentGameResults: string;
   gameManager: string;
   gameDate: string;
   startTime: string;
   endTime: string;
   noGamesYet: string;
   ongoing: string;
   swipeForMore: string;
   switchingData: string;
   gameXofY: string;

   // Select Players Screen
   selectPlayers: string;
   selectPlayersToStartGame: string;
   loadingPlayers: string;
   selectPlayersInstruction: string;
   playersSelected: string;
   playerSelected: string;
   noPlayersFound: string;
   noPlayersMessage: string;
   startGame: string;
   minimumPlayersRequired: string;
   admin: string;
   member: string;

   // Game Setup Modal
   gameSetup: string;
   league: string;
   buyInPerPlayer: string;
   selectedPlayers: string;
   gameName: string;
   optional: string;
   gameNamePlaceholder: string;
   buyInAmount: string;
   buyInHint: string;
   createGame: string;
   creatingGame: string;
   gameCreatedSuccess: string;
   validBuyInRequired: string;
   gameSummary: string;
   totalPlayers: string;

   // Game Screen
   gameDetails: string;
   gameInProgress: string;
   totalBuyIns: string;
   totalBuyOuts: string;
   inBank: string;
   currentProfit: string;
   playerName: string;
   initialBuyIn: string;
   buyIn: string;
   cancelBuyIn: string;
   buyOut: string;
   profit: string;
   cashOut: string;
   addPlayer: string;
   removePlayer: string;
   confirmCashOut: string;
   enterCashOutAmount: string;
   cashOutAmount: string;
   invalidAmount: string;
   playerCashedOut: string;
   buyInSuccessful: string;
   buyInUndone: string;
   selectPlayerToAdd: string;
   playerAdded: string;
   confirmRemovePlayer: string;
   removePlayerMessage: string;
   playerRemoved: string;
   endGame: string;
   cannotEndGame: string;
   playersStillActive: string;
   confirmEndGame: string;
   endGameMessage: string;
   endGameConfirmationTitle: string;
   endGameConfirmationMessage: string;
   gameEnded: string;
   loadingGame: string;
   gameNotFound: string;
   gameEndedSuccessfully: string;

   // Top Profit Player Card
   topProfitPlayer: string;
   loadingTopPlayer: string;
   noTopPlayerData: string;
   noCompletedGames: string;
   gamesPlayed: string;

   // Generic Player Stats
   loadingPlayerStat: string;
   mostActivePlayer: string;
   highestSingleGameProfit: string;
   biggestLoser: string;
   bestWinningStreak: string;
   winningStreak: string;
   totalProfit: string;
   avgProfit: string;

   // League Overview Card Subtitles
   positiveProfit: string;
   negativeProfit: string;
   totalMoneyIn: string;
   totalMoneyOut: string;
   active: string;
   finished: string;
   uniquePlayers: string;
   perGame: string;
   avgGameDuration: string;

   // Onboarding
   onboardingViewAgain: string;
   onboardingWelcomeTitle: string;
   onboardingWelcomeSubtitle: string;
   onboardingLeaguesTitle: string;
   onboardingLeaguesSubtitle: string;
   onboardingStatsTitle: string;
   onboardingStatsSubtitle: string;
   onboardingGamesTitle: string;
   onboardingGamesSubtitle: string;
   onboardingAiTitle: string;
   onboardingAiSubtitle: string;
   onboardingGetStartedTitle: string;
   onboardingGetStartedSubtitle: string;
   onboardingSkip: string;
   onboardingDone: string;
   onboardingNext: string;
   termsOfService: string;
   continueWithGoogle: string;
   // Deep linking / Join League
   joinLeagueRequiresLogin: string;

   // Anonymous Players
   anonymousPlayer: string;
   addAnonymousPlayer: string;
   anonymousPlayerName: string;
   enterPlayerName: string;
   removeAnonymousPlayer: string;
   anonymousPlayersSection: string;
   remove: string;

   // Stats Leaderboard
   champion: string;
   rank: string;
   viewFullLeaderboard: string;
   leaderboard: string;

   // AI Summary
   aiSummary: string;
   financialSnapshot: string;
   lastGameHighlights: string;
   outlook: string;
   generatingAnalysis: string;
   noSummaryYet: string;
   playGameToGetAiSummary: string;

   // Game Events
   gameHistory: string;
   showHistory: string;
   hideHistory: string;
   buyInCancelled: string;
   noEventsYet: string;

   // Profile Edit
   editProfile: string;
   updateProfile: string;
   profileImage: string;
   fullName: string;
   changeImage: string;
   profileUpdated: string;
   profileUpdateFailed: string;

   // Edit League
   editLeague: string;
   updateLeague: string;
   changeLeagueImage: string;
   leagueUpdatedSuccess: string;
   failedToUpdateLeague: string;
   failedToUploadImage: string;

   // Edit Player
   edit: string;
   editPlayerAmounts: string;
   editPlayerAmountsDescription: string;
   updatePlayerAmounts: string;
   currentAmount: string;
   playerAmountsUpdated: string;
   failedToUpdatePlayerAmounts: string;
   buyout: string;
   buyoutDescription: string;
}

// English translations
const enTranslations: Translations = {
   // Navigation
   myLeagues: 'MY LEAGUES',
   account: 'ACCOUNT',

   // League Screen
   createLeague: 'Create League',
   joinLeague: 'Join League',
   noLeaguesYet: 'NO LEAGUES YET',
   createFirstLeague: 'Create your first league or join an existing one',
   members: 'MEMBERS',

   // League Names
   fridayNightPoker: 'FRIDAY NIGHT POKER',
   weekendWarriors: 'WEEKEND WARRIORS',
   royalFlushClub: 'ROYAL FLUSH CLUB',
   highStakesHeroes: 'HIGH STAKES HEROES',

   // Auth
   signInWithGoogle: 'SIGN IN WITH GOOGLE',
   continueAsGuest: 'CONTINUE AS GUEST',
   signOut: 'SIGN OUT',

   // Account
   accountActions: 'ACCOUNT ACTIONS',
   userDetails: 'USER DETAILS',
   userId: 'USER ID',
   firstName: 'FIRST NAME',
   lastName: 'LAST NAME',
   provider: 'PROVIDER',
   verified: 'VERIFIED',

   // Common
   language: 'LANGUAGE',
   english: 'En',
   hebrew: 'He',
   success: 'Success',
   ok: 'OK',
   currency: '$',

   // League Creation
   createLeaguePrompt: 'Navigation to create league form coming soon!',
   joinLeaguePrompt: 'Enter league code:',
   enterLeagueCode: 'Enter league code:',
   cancel: 'Cancel',
   join: 'Join',
   create: 'Create',
   joinedLeagueSuccess: 'Successfully joined league',

   // Create League Screen
   leagueName: 'League Name',
   leagueDescription: 'Description',
   maxMembers: 'Max Members',
   privateLeague: 'Private League',
   createLeagueButton: 'Create League',
   backToLeagues: 'Back to Leagues',
   leagueImage: 'League Image',
   selectImage: 'Select Image',
   uploadingImage: 'Uploading Image',
   leagueCreatedSuccess: 'League created successfully',
   loginRequiredToCreateLeague: 'Please login to create a league',
   fixFormErrors: 'Please fix the form errors',
   pleaseWait: 'Please wait...',
   dataDeletedSuccess: 'Your personal data has been successfully deleted.',
   dataDeletionFailed: 'Failed to delete your data. Please try again later.',

   // New Screens
   games: 'GAMES',
   stats: 'STATS',
   personalStats: 'PERSONAL STATS',

   // Share
   joinMyLeague: '🎮 Join my poker league:',
   leagueCode: 'League Code:',
   joinHere: 'Join here:',
   shareLeague: 'Share League',
   error: 'Error',
   failedToShare: 'Failed to share league code',

   // Error Boundary
   errorOccurred: 'Oops! Something went wrong',
   errorMessage: 'An unexpected error occurred. Our team has been notified.',
   tryAgain: 'Try Again',

   // League Stats Screen
   loadingLeagueStats: 'Loading league stats...',
   leagueOverview: 'LEAGUE OVERVIEW',
   playerStats: 'PLAYER STATS',
   leagueStats: 'LEAGUE STATS',
   loadingLeagueDetails: 'Loading league details...',
   leagueNotFound: 'League not found',
   statistics: 'STATISTICS',
   statsComingSoon: 'Statistics coming soon!',
   retry: 'Retry',
   quickStats: 'QUICK STATS',
   totalGames: 'TOTAL GAMES',
   activePlayersLabel: 'ACTIVE PLAYERS',
   totalPot: 'TOTAL POT',
   lastGame: 'LAST GAME',
   viewDetailedStats: 'VIEW DETAILED STATS',
   viewStatsDescription:
      'See player rankings, game history, and performance analytics',
   startNewGame: 'START NEW GAME',
   startGameDescription: 'Create a new poker game for this league',
   checkingGames: 'CHECKING GAMES',
   checkingGamesDescription: 'Looking for active games in this league',
   continueGame: 'CONTINUE GAME',
   continueGameDescription: 'Resume the currently active game',
   recentGameResults: 'RECENT GAMES',
   gameManager: 'Manager',
   gameDate: 'Date',
   startTime: 'Start',
   endTime: 'End',
   noGamesYet: 'No completed games yet',
   ongoing: 'Ongoing',
   swipeForMore: 'Swipe for more',
   switchingData: 'SWITCHING DATA...',
   gameXofY: 'GAME {current} OF {total}',

   // Select Players Screen
   selectPlayersToStartGame: 'Select players to start a new game',
   selectPlayers: 'SELECT PLAYERS',
   loadingPlayers: 'Loading players...',
   selectPlayersInstruction: 'Choose players for the new game',
   playersSelected: 'PLAYERS SELECTED',
   playerSelected: 'PLAYER SELECTED',
   noPlayersFound: 'NO PLAYERS FOUND',
   noPlayersMessage: 'This league has no members yet',
   startGame: 'START GAME',
   minimumPlayersRequired: 'Please select at least 2 players to start a game',
   admin: 'ADMIN',
   member: 'MEMBER',

   // Game Setup Modal
   gameSummary: 'GAME SUMMARY',
   league: 'LEAGUE',
   buyInPerPlayer: 'BUY-IN PER PLAYER',
   totalPlayers: 'TOTAL PLAYERS',
   gameSetup: 'GAME SETUP',
   selectedPlayers: 'SELECTED PLAYERS',
   gameName: 'GAME NAME',
   optional: 'OPTIONAL',
   gameNamePlaceholder: 'Enter game name...',
   buyInAmount: 'BUY-IN AMOUNT',
   buyInHint: 'Amount each player will pay to join the game',
   createGame: 'CREATE GAME',
   creatingGame: 'CREATING GAME...',
   gameCreatedSuccess: 'Game created successfully! Players can now join.',
   validBuyInRequired: 'Please enter a valid buy-in amount',

   // Game Screen
   gameDetails: 'GAME DETAILS',
   gameInProgress: 'GAME IN PROGRESS',
   totalBuyIns: 'TOTAL BUY-INS',
   totalBuyOuts: 'TOTAL BUY-OUTS',
   inBank: 'IN BANK',
   currentProfit: 'CURRENT PROFIT',
   playerName: 'PLAYER NAME',
   initialBuyIn: 'INITIAL BUY-IN',
   buyIn: 'BUY IN',
   cancelBuyIn: 'CANCEL BUY IN',
   buyOut: 'BUY OUT',
   profit: 'PROFIT',
   cashOut: 'CASH OUT',
   addPlayer: 'ADD PLAYER',
   removePlayer: 'REMOVE PLAYER',
   confirmCashOut: 'Confirm Cash Out',
   enterCashOutAmount: 'Enter the amount this player is cashing out with:',
   cashOutAmount: 'Cash Out Amount',
   invalidAmount: 'Please enter a valid amount',
   playerCashedOut: 'cashed out',
   buyInSuccessful: 'Buy-in for',
   buyInUndone: 'Buy-in undone',
   selectPlayerToAdd: 'Select a player to add to the game',
   playerAdded: 'Player added to the game',
   confirmRemovePlayer: 'Remove Player',
   removePlayerMessage:
      'Are you sure you want to remove this player from the game?',
   playerRemoved: 'Player removed from the game',
   endGame: 'END GAME',
   cannotEndGame: 'Cannot end game with active players',
   playersStillActive: 'Players still active',
   confirmEndGame: 'End Game',
   endGameMessage:
      'Are you sure you want to end this game? This action cannot be undone.',
   endGameConfirmationTitle: 'End Game',
   endGameConfirmationMessage:
      'Are you sure you want to end this game? All players have cashed out.',
   gameEnded: 'Game ended successfully',
   loadingGame: 'Loading game details...',
   gameNotFound: 'Game not found',
   gameEndedSuccessfully: 'Game ended successfully',

   // Top Profit Player Card
   topProfitPlayer: 'TOP PROFIT PLAYER',
   loadingTopPlayer: 'Loading top player...',
   noTopPlayerData: 'No profit data available',
   noCompletedGames: 'No completed games yet',
   gamesPlayed: 'games played',

   // Generic Player Stats
   loadingPlayerStat: 'Loading player stat...',
   mostActivePlayer: 'MOST ACTIVE PLAYER',
   highestSingleGameProfit: 'HIGHEST SINGLE GAME',
   biggestLoser: 'BIGGEST LOSER',
   bestWinningStreak: 'BEST WINNING STREAK',
   winningStreak: 'games in a row',
   totalProfit: 'Total Profit',
   avgProfit: 'Avg Profit',

   // League Overview Card Subtitles
   positiveProfit: 'Positive Return',
   negativeProfit: 'Negative Return',
   totalMoneyIn: 'Money In',
   totalMoneyOut: 'Money Out',
   active: 'active',
   finished: 'finished',
   uniquePlayers: 'Unique Players',
   perGame: 'Per Game',
   avgGameDuration: 'AVG GAME DURATION',

   // Onboarding
   onboardingViewAgain: 'Re-watch Onboarding',
   onboardingWelcomeTitle: 'Welcome to Poker AI:HomeStack',
   onboardingWelcomeSubtitle:
      'The ultimate tool for managing your home poker games and leagues.',
   onboardingLeaguesTitle: 'Manage Leagues',
   onboardingLeaguesSubtitle:
      'Create private leagues, invite friends, and keep track of who runs the table.',
   onboardingStatsTitle: 'Track Statistics',
   onboardingStatsSubtitle:
      'Detailed player stats, ROI tracking, and performance history over time.',
   onboardingGamesTitle: 'Live Game Tracking',
   onboardingGamesSubtitle:
      'Easy buy-ins, re-buys, and cash-outs. Handle the math while you handle the cards.',
   onboardingAiTitle: 'AI Insights',
   onboardingAiSubtitle:
      "Get smart analysis of your league's performance and game trends.",
   onboardingGetStartedTitle: 'Ready to Shuffle Up?',
   onboardingGetStartedSubtitle:
      'Start your league today and become a Poker League Hero.',
   onboardingSkip: 'Skip',
   onboardingNext: 'Next',
   onboardingDone: 'Get Started',
   continueWithGoogle: 'Continue with Google',
   termsOfService: 'Terms of Service',
   // Deep linking / Join League
   joinLeagueRequiresLogin: 'You need to be signed in to join a league.',

   // Anonymous Players
   anonymousPlayer: 'Anonymous Player',
   addAnonymousPlayer: 'Add Anonymous Player',
   anonymousPlayerName: 'Player Name',
   enterPlayerName: 'Enter player name',
   removeAnonymousPlayer: 'Remove',
   anonymousPlayersSection: 'Anonymous Players',
   remove: 'Remove',

   // Stats Leaderboard
   champion: 'Champion',
   rank: 'Rank',
   viewFullLeaderboard: 'View Full Leaderboard',
   leaderboard: 'Leaderboard',

   // AI Summary
   aiSummary: 'AI Summary',
   financialSnapshot: 'Financial Snapshot',
   lastGameHighlights: 'Last Game Highlights',
   outlook: 'Outlook & Prediction',
   generatingAnalysis: 'Generating Analysis...',
   noSummaryYet: 'No summary available yet',
   playGameToGetAiSummary: 'Play a game to get AI summary',

   // Game Events
   gameHistory: 'GAME HISTORY',
   showHistory: 'Show History',
   hideHistory: 'Hide History',
   buyInCancelled: 'Buy-in cancelled',
   noEventsYet: 'No game events yet',

   // Profile Edit
   editProfile: 'Edit Profile',
   updateProfile: 'Save',
   profileImage: 'Profile Image',
   fullName: 'Name',
   changeImage: 'Change Image',
   profileUpdated: 'Profile updated successfully',
   profileUpdateFailed: 'Failed to update profile',

   // Edit League
   editLeague: 'Edit League',
   updateLeague: 'save',
   changeLeagueImage: 'Change League Image',
   leagueUpdatedSuccess: 'League updated successfully',
   failedToUpdateLeague: 'Failed to update league',
   failedToUploadImage: 'Failed to upload image',

   // Edit Player
   edit: 'Edit',
   editPlayerAmounts: 'Edit Player Amounts',
   editPlayerAmountsDescription:
      'Update the buy-in and buyout amounts for this player',
   updatePlayerAmounts: 'Update Amounts',
   currentAmount: 'Current',
   playerAmountsUpdated: 'Player amounts updated successfully',
   failedToUpdatePlayerAmounts: 'Failed to update player amounts',
   buyout: 'Buyout',
   buyoutDescription: 'Current cash amount the player has left (≥ 0)',
};

// Hebrew translations
const heTranslations: Translations = {
   // Navigation
   myLeagues: 'הליגות שלי',
   account: 'חשבון',

   // League Screen
   createLeague: 'צור ליגה',
   joinLeague: 'הצטרף לליגה',
   noLeaguesYet: 'עדיין אין ליגות',
   createFirstLeague: 'צור את הליגה הראשונה שלך או הצטרף לליגה קיימת',
   members: 'חברים',

   // League Names
   fridayNightPoker: 'פוקר יום שישי בערב',
   weekendWarriors: 'לוחמי סוף השבוע',
   royalFlushClub: 'מועדון הרויאל פלאש',
   highStakesHeroes: 'גיבורי ההימורים הגבוהים',

   // Auth
   signInWithGoogle: 'התחבר עם גוגל',
   continueAsGuest: 'המשך כאורח',
   signOut: 'התנתק',

   // Account
   accountActions: 'פעולות חשבון',
   userDetails: 'פרטי משתמש',
   userId: 'מזהה משתמש',
   firstName: 'שם פרטי',
   lastName: 'שם משפחה',
   provider: 'ספק',
   verified: 'מאומת',

   // Common
   language: 'שפה',
   english: 'En',
   hebrew: 'He',
   success: 'הצלחה',
   ok: 'אישור',
   currency: '₪',

   // League Creation
   createLeaguePrompt: 'ניווט לטופס יצירת ליגה יגיע בקרוב!',
   joinLeaguePrompt: 'הזן קוד ליגה:',
   enterLeagueCode: 'הזן קוד ליגה:',
   cancel: 'ביטול',
   join: 'הצטרף',
   create: 'ליגה חדשה',
   joinedLeagueSuccess: 'הצטרפת בהצלחה לליגה',

   // Create League Screen
   leagueName: 'שם הליגה',
   leagueDescription: 'תיאור',
   maxMembers: 'מספר חברים מקסימלי',
   privateLeague: 'ליגה פרטית',
   createLeagueButton: 'צור ליגה',
   backToLeagues: 'חזור לליגות',
   leagueImage: 'תמונת הליגה',
   selectImage: 'בחר תמונה',
   uploadingImage: 'מעלה תמונה',
   leagueCreatedSuccess: 'הליגה נוצרה בהצלחה',
   loginRequiredToCreateLeague: 'עליך להתחבר כדי ליצור ליגה',
   fixFormErrors: 'אנא תקן את השגיאות בטופס',
   pleaseWait: 'אנא המתן...',
   dataDeletedSuccess: 'המידע האישי שלך נמחק בהצלחה.',
   dataDeletionFailed: 'נכשל במחיקת המידע שלך. אנא נסה שוב מאוחר יותר.',

   // New Screens
   games: 'משחקים',
   stats: 'סטטיסטיקות',
   personalStats: 'סטטיסטיקות אישיות',

   // Share
   joinMyLeague: '🎮 הצטרף לליגת הפוקר שלי:',
   leagueCode: 'קוד ליגה:',
   joinHere: 'הצטרף כאן:',
   shareLeague: 'שתף ליגה',
   error: 'שגיאה',
   failedToShare: 'נכשל בשיתוף קוד הליגה',

   // Error Boundary
   errorOccurred: 'אופס! משהו השתבש',
   errorMessage: 'אירעה שגיאה בלתי צפויה. הצוות שלנו קיבל דיווח על הבעיה.',
   tryAgain: 'נסה שוב',

   // League Stats Screen
   loadingLeagueStats: 'טוען סטטיסטיקות ליגה...',
   leagueOverview: 'סטטיסטיקות ליגה',
   playerStats: 'סטטיסטיקות שחקנים',
   leagueStats: 'סטטיסטיקות ליגה',
   loadingLeagueDetails: 'טוען פרטי ליגה...',
   leagueNotFound: 'הליגה לא נמצאה',
   statistics: 'סטטיסטיקות',
   statsComingSoon: 'סטטיסטיקות בקרוב!',
   retry: 'נסה שוב',
   quickStats: 'סטטיסטיקות מהירות',
   totalGames: 'סה״כ משחקים',
   activePlayersLabel: 'שחקנים פעילים',
   totalPot: 'סה״כ קופה',
   lastGame: 'משחק אחרון',
   viewDetailedStats: 'צפה בסטטיסטיקות מפורטות',
   viewStatsDescription: 'ראה דירוגי שחקנים, היסטוריית משחקים וניתוח ביצועים',
   startNewGame: 'התחל משחק חדש',
   startGameDescription: 'צור משחק פוקר חדש עבור הליגה הזו',
   checkingGames: 'בודק משחקים',
   checkingGamesDescription: 'מחפש משחקים פעילים בליגה הזו',
   continueGame: 'המשך משחק',
   continueGameDescription: 'חזור למשחק הפעיל הנוכחי',
   recentGameResults: 'משחקים אחרונים',
   gameManager: 'מנהל',
   gameDate: 'תאריך',
   startTime: 'התחלה',
   endTime: 'סיום',
   noGamesYet: 'אין משחקים שהושלמו עדיין',
   ongoing: 'בתהליך',
   swipeForMore: 'החלק לעוד',
   switchingData: 'מחליף נתונים...',
   gameXofY: 'משחק {current} מתוך {total}',

   // Select Players Screen
   selectPlayersToStartGame: 'בחר שחקנים להתחיל משחק חדש',
   selectPlayers: 'בחר שחקנים',
   loadingPlayers: 'טוען שחקנים...',
   selectPlayersInstruction: 'בחר שחקנים למשחק החדש',
   playersSelected: 'שחקנים נבחרו',
   playerSelected: 'שחקן נבחר',
   noPlayersFound: 'לא נמצאו שחקנים',
   noPlayersMessage: 'בליגה הזו אין עדיין חברים',
   startGame: 'התחל משחק',
   minimumPlayersRequired: 'בחר לפחות 2 שחקנים כדי להתחיל משחק',
   admin: 'מנהל',
   member: 'חבר',

   // Game Setup Modal
   gameSetup: 'הגדרת משחק',
   gameSummary: 'סיכום המשחק',
   league: 'ליגה',
   buyInPerPlayer: 'סכום כניסה לשחקן',
   totalPlayers: 'סה״כ שחקנים',
   selectedPlayers: 'שחקנים נבחרים',
   gameName: 'שם המשחק',
   optional: 'אופציונלי',
   gameNamePlaceholder: 'הכנס שם משחק...',
   buyInAmount: 'סכום כניסה',
   buyInHint: 'הסכום שכל שחקן ישלם כדי להצטרף למשחק',
   createGame: 'צור משחק',
   creatingGame: 'יוצר משחק...',
   gameCreatedSuccess: 'המשחק נוצר בהצלחה! השחקנים יכולים להצטרף כעת.',
   validBuyInRequired: 'אנא הכנס סכום כניסה תקין',

   // Game Screen
   gameDetails: 'פרטי המשחק',
   gameInProgress: 'משחק פעיל',
   totalBuyIns: 'סך כל הכניסות',
   totalBuyOuts: 'סך כל היציאות',
   inBank: 'בבנק',
   currentProfit: 'רווח נוכחי',
   playerName: 'שם השחקן',
   initialBuyIn: 'כניסה ראשונית',
   buyIn: 'כניסה',
   cancelBuyIn: 'בטל כניסה',
   buyOut: 'יציאה',
   profit: 'רווח',
   cashOut: 'יציאה',
   addPlayer: 'הוסף שחקן',
   removePlayer: 'הסר שחקן',
   confirmCashOut: 'אשר משיכת כסף',
   enterCashOutAmount: 'הכנס את הסכום שהשחקן מושך:',
   cashOutAmount: 'סכום משיכה',
   invalidAmount: 'אנא הכנס סכום תקף',
   playerCashedOut: 'משך כסף',
   buyInSuccessful: 'כניסה בוצעה  עבור',
   buyInUndone: 'ביטול כניסה בוצע בהצלחה',
   selectPlayerToAdd: 'בחר שחקן להוסיף למשחק',
   playerAdded: 'השחקן נוסף למשחק',
   confirmRemovePlayer: 'הסר שחקן',
   removePlayerMessage: 'האם אתה בטוח שברצונך להסיר את השחקן מהמשחק?',
   playerRemoved: 'השחקן הוסר מהמשחק',
   endGame: 'סיים משחק',
   cannotEndGame: 'יש עדיין שחקנים פעילים',
   playersStillActive: 'עדיין יש שחקנים פעילים',
   confirmEndGame: 'סיים משחק',
   endGameMessage:
      'האם אתה בטוח שברצונך לסיים את המשחק? פעולה זו לא ניתנת לביטול.',
   endGameConfirmationTitle: 'סיים משחק',
   endGameConfirmationMessage:
      'האם אתה בטוח שברצונך לסיים את המשחק? כל השחקנים כבר משכו כסף.',
   gameEnded: 'המשחק הסתיים בהצלחה',
   loadingGame: 'טוען פרטי משחק...',
   gameNotFound: 'המשחק לא נמצא',
   gameEndedSuccessfully: 'המשחק הסתיים בהצלחה',

   // Top Profit Player Card
   topProfitPlayer: 'טבלת ליגה',
   loadingTopPlayer: 'טוען שחקן מוביל...',
   noTopPlayerData: 'אין נתוני רווח זמינים',
   noCompletedGames: 'עדיין אין משחקים שהסתיימו',
   gamesPlayed: 'משחקים ששיחק',

   // Generic Player Stats
   loadingPlayerStat: 'טוען סטטיסטיקת שחקן...',
   mostActivePlayer: 'כמות משחקים',
   highestSingleGameProfit: 'הרווח הגבוה במשחק בודד',
   biggestLoser: 'המפסיד הכי גדול',
   bestWinningStreak: 'רצף הניצחונות',
   winningStreak: 'משחקים ברצף',
   totalProfit: 'סה״כ רווח',
   avgProfit: 'ממוצע רווח',

   // League Overview Card Subtitles
   positiveProfit: 'תשואה חיובית',
   negativeProfit: 'תשואה שלילית',
   totalMoneyIn: 'כסף נכנס',
   totalMoneyOut: 'כסף יוצא',
   active: 'פעיל',
   finished: 'הסתיימו',
   uniquePlayers: 'שחקנים ייחודיים',
   perGame: 'למשחק',
   avgGameDuration: 'משך משחק ממוצע',

   // Onboarding
   onboardingViewAgain: 'הצג מחדש את ההדרכה',
   onboardingWelcomeTitle: 'ברוכים הבאים ל-Poker AI:HomeStack',
   onboardingWelcomeSubtitle:
      'הכלי האולטימטיבי לניהול משחקי הפוקר והליגות הביתיות שלך.',
   onboardingLeaguesTitle: 'ניהול ליגות',
   onboardingLeaguesSubtitle:
      'צור ליגות פרטיות, הזמן חברים ועקוב אחר מי ששולט בשולחן.',
   onboardingStatsTitle: 'מעקב סטטיסטיקות',
   onboardingStatsSubtitle:
      'סטטיסטיקות שחקן מפורטות, מעקב ROI והיסטוריית ביצועים לאורך זמן.',
   onboardingGamesTitle: 'מעקב משחק חי',
   onboardingGamesSubtitle:
      'כניסות קלות, כניסות חוזרות ומשיכות. תן לנו לטפל בחישובים בזמן שאתה משחק.',
   onboardingAiTitle: 'תובנות AI',
   onboardingAiSubtitle: 'קבל ניתוח חכם של ביצועי הליגה ומגמות המשחק שלך.',
   onboardingGetStartedTitle: 'מוכנים להתחיל?',
   onboardingGetStartedSubtitle:
      'התחל את הליגה שלך היום והפוך לגיבור ליגת הפוקר.',
   onboardingSkip: 'דלג',
   onboardingNext: 'הבא',
   onboardingDone: 'התחל',
   continueWithGoogle: 'המשך עם גוגל',
   termsOfService: 'תנאי שירות',

   // Deep linking / Join League
   joinLeagueRequiresLogin: 'עליך להירשם כדי להצטרף לליגה.',

   // Anonymous Players
   anonymousPlayer: 'שחקן אנונימי',
   addAnonymousPlayer: 'הוסף שחקן אנונימי',
   anonymousPlayerName: 'שם השחקן',
   enterPlayerName: 'הזן שם שחקן',
   removeAnonymousPlayer: 'הסר',
   anonymousPlayersSection: 'שחקנים אנונימיים',
   remove: 'הסר',

   // Stats Leaderboard
   champion: 'אלוף',
   rank: 'דירוג',
   viewFullLeaderboard: 'צפה בטבלת המובילים',
   leaderboard: 'טבלת מובילים',

   // AI Summary
   aiSummary: 'סיכום AI',
   financialSnapshot: 'מצב פיננסי',
   lastGameHighlights: 'דגשי המשחק האחרון',
   outlook: 'תחזית והערכה',
   generatingAnalysis: 'מייצר ניתוח...',
   noSummaryYet: 'אין סיכום זמין עדיין',
   playGameToGetAiSummary: 'שחק משחק כדי לקבל סיכום AI',

   // Game Events
   gameHistory: 'היסטוריית משחק',
   showHistory: 'הצג היסטוריה',
   hideHistory: 'הסתר היסטוריה',
   buyInCancelled: 'כניסה בוטלה',
   noEventsYet: 'אין אירועי משחק עדיין',

   // Profile Edit
   editProfile: 'ערוך פרופיל',
   updateProfile: 'עדכן פרופיל',
   profileImage: 'תמונת פרופיל',
   fullName: 'שם מלא',
   changeImage: 'שנה תמונה',
   profileUpdated: 'הפרופיל עודכן בהצלחה',
   profileUpdateFailed: 'נכשל בעדכון הפרופיל',

   // Edit League
   editLeague: 'ערוך ליגה',
   updateLeague: 'עדכן ליגה',
   changeLeagueImage: 'שנה תמונת ליגה',
   leagueUpdatedSuccess: 'הליגה עודכנה בהצלחה',
   failedToUpdateLeague: 'נכשל בעדכון הליגה',
   failedToUploadImage: 'נכשל בהעלאת התמונה',

   // Edit Player
   edit: 'ערוך',
   editPlayerAmounts: 'ערוך סכומי שחקן',
   editPlayerAmountsDescription: 'עדכן את סכומי הכניסה והמשיכה של השחקן הזה',
   updatePlayerAmounts: 'עדכן סכומים',
   currentAmount: 'נוכחי',
   playerAmountsUpdated: 'סכומי השחקן עודכנו בהצלחה',
   failedToUpdatePlayerAmounts: 'נכשל בעדכון סכומי השחקן',
   buyout: 'משיכה',
   buyoutDescription: 'סכום הכסף הנוכחי שנשאר לשחקן (≥ 0)',
};

const translations = {
   en: enTranslations,
   he: heTranslations,
   // ... rest of file
};

// ... rest of file
const LANGUAGE_STORAGE_KEY = '@poker_league_language';

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
}) => {
   const [language, setLanguageState] = useState<Language>('en');
   const [isInitialized, setIsInitialized] = useState(false);

   const loadSavedLanguage = useCallback(async () => {
      try {
         const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
         if (
            savedLanguage &&
            (savedLanguage === 'en' || savedLanguage === 'he')
         ) {
            setLanguageState(savedLanguage);
            await updateRTLMode(savedLanguage);
         }
      } catch (error) {
         console.error('Failed to load saved language:', error);
      } finally {
         setIsInitialized(true);
      }
   }, []);

   // Load saved language on app start
   useEffect(() => {
      loadSavedLanguage();
   }, [loadSavedLanguage]);

   const updateRTLMode = async (lang: Language) => {
      const isRTL = lang === 'he';
      if (I18nManager.isRTL !== isRTL) {
         I18nManager.allowRTL(isRTL);
         I18nManager.forceRTL(isRTL);
         // Note: App restart is required for RTL changes to take full effect
      }
   };

   const setLanguage = async (lang: Language) => {
      try {
         await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
         setLanguageState(lang);
         await updateRTLMode(lang);
      } catch (error) {
         console.error('Failed to save language:', error);
      }
   };

   const t = (key: string): string => {
      const translation = translations[language];
      const value = (translation as any)[key];
      return value || key; // Fallback to key if translation not found
   };

   const isRTL = language === 'he';

   // Don't render until language is loaded
   if (!isInitialized) {
      return null;
   }

   const value: LocalizationContextType = {
      language,
      setLanguage,
      t,
      isRTL,
   };

   return (
      <LocalizationContext.Provider value={value}>
         {children}
      </LocalizationContext.Provider>
   );
};

LocalizationProvider.displayName = 'LocalizationProvider';

export function useLocalization() {
   const context = useContext(LocalizationContext);
   if (context === undefined) {
      throw new Error(
         'useLocalization must be used within a LocalizationProvider'
      );
   }
   return context;
}

export default LocalizationProvider;
