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
   activePlayers: string;
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

   // Select Players Screen
   selectPlayers: string;
   selectPlayersToStartGame: string;
   loadingPlayers: string;
   selectPlayersInstruction: string;
   playersSelected: string;
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
   currentProfit: string;
   playerName: string;
   initialBuyIn: string;
   buyIn: string;
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
   selectPlayerToAdd: string;
   playerAdded: string;
   confirmRemovePlayer: string;
   removePlayerMessage: string;
   playerRemoved: string;
   endGame: string;
   cannotEndGame: string;
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
   mostConsistentPlayer: string;
   biggestLoser: string;
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
   onboardingSlide1Title: string;
   onboardingSlide1Description: string;
   onboardingSlide2Title: string;
   onboardingSlide2Description: string;
   onboardingSlide3Title: string;
   onboardingSlide3Description: string;
   onboardingSlide4Title: string;
   onboardingSlide4Description: string;
   onboardingSlide5Title: string;
   onboardingSlide5Description: string;
   onboardingSkipButton: string;
   onboardingNextButton: string;
   onboardingCompleteButton: string;
   onboardingViewAgain: string;
   termsOfService: string;
   continueWithGoogle: string;
   // Deep linking / Join League
   joinLeagueRequiresLogin: string;
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
   english: 'English',
   hebrew: 'עברית',
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
   activePlayers: 'ACTIVE PLAYERS',
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

   // Select Players Screen
   selectPlayersToStartGame: 'Select players to start a new game',
   selectPlayers: 'SELECT PLAYERS',
   loadingPlayers: 'Loading players...',
   selectPlayersInstruction: 'Choose players for the new game',
   playersSelected: 'PLAYERS SELECTED',
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
   currentProfit: 'CURRENT PROFIT',
   playerName: 'PLAYER NAME',
   initialBuyIn: 'INITIAL BUY-IN',
   buyIn: 'BUY IN',
   buyOut: 'BUY OUT',
   profit: 'PROFIT',
   cashOut: 'CASH OUT',
   addPlayer: 'ADD PLAYER',
   removePlayer: 'REMOVE PLAYER',
   confirmCashOut: 'Confirm Cash Out',
   enterCashOutAmount: 'Enter the amount this player is cashing out with:',
   cashOutAmount: 'Cash Out Amount',
   invalidAmount: 'Please enter a valid amount',
   playerCashedOut: 'Player cashed out',
   buyInSuccessful: 'Buy-in successful',
   selectPlayerToAdd: 'Select a player to add to the game',
   playerAdded: 'Player added to the game',
   confirmRemovePlayer: 'Remove Player',
   removePlayerMessage:
      'Are you sure you want to remove this player from the game?',
   playerRemoved: 'Player removed from the game',
   endGame: 'END GAME',
   cannotEndGame: 'Cannot end game with active players',
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
   mostConsistentPlayer: 'MOST CONSISTENT PLAYER',
   biggestLoser: 'BIGGEST LOSER',
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
   onboardingSlide1Title: 'Welcome to Poker AI HomeStack!',
   onboardingSlide1Description:
      'Create and manage your poker leagues with ease.',
   onboardingSlide2Title: 'Join Existing Leagues',
   onboardingSlide2Description:
      'Connect with friends and compete in existing leagues.',
   onboardingSlide3Title: 'Track Your Performance',
   onboardingSlide3Description:
      'Monitor your wins, losses, and overall performance.',
   onboardingSlide4Title: 'Get AI Analysis for your games',
   onboardingSlide4Description:
      'Get AI analysis for your games to improve your skills.',
   onboardingSlide5Title: 'Get Started',
   onboardingSlide5Description: 'Start creating your first poker league today!',
   onboardingSkipButton: 'Skip',
   onboardingNextButton: 'Next',
   onboardingCompleteButton: 'Complete',
   onboardingViewAgain: ' View Onboarding Again',
   continueWithGoogle: 'Continue with Google',
   termsOfService: 'Terms of Service',
   // Deep linking / Join League
   joinLeagueRequiresLogin: 'You need to be signed in to join a league.',
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
   english: 'English',
   hebrew: 'עברית',
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
   activePlayers: 'שחקנים פעילים',
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

   // Select Players Screen
   selectPlayersToStartGame: 'בחר שחקנים להתחיל משחק חדש',
   selectPlayers: 'בחר שחקנים',
   loadingPlayers: 'טוען שחקנים...',
   selectPlayersInstruction: 'בחר שחקנים למשחק החדש',
   playersSelected: 'שחקנים נבחרו',
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
   currentProfit: 'רווח נוכחי',
   playerName: 'שם השחקן',
   initialBuyIn: 'כניסה ראשונית',
   buyIn: 'כניסה',
   buyOut: 'יציאה',
   profit: 'רווח',
   cashOut: 'משיכת כסף',
   addPlayer: 'הוסף שחקן',
   removePlayer: 'הסר שחקן',
   confirmCashOut: 'אשר משיכת כסף',
   enterCashOutAmount: 'הכנס את הסכום שהשחקן מושך:',
   cashOutAmount: 'סכום משיכה',
   invalidAmount: 'אנא הכנס סכום תקף',
   playerCashedOut: 'השחקן משך כסף',
   buyInSuccessful: 'כניסה בוצעה בהצלחה',
   selectPlayerToAdd: 'בחר שחקן להוסיף למשחק',
   playerAdded: 'השחקן נוסף למשחק',
   confirmRemovePlayer: 'הסר שחקן',
   removePlayerMessage: 'האם אתה בטוח שברצונך להסיר את השחקן מהמשחק?',
   playerRemoved: 'השחקן הוסר מהמשחק',
   endGame: 'סיים משחק',
   cannotEndGame: 'יש עדיין שחקנים פעילים',
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
   topProfitPlayer: 'שחקן עם הרווח הגבוה ביותר',
   loadingTopPlayer: 'טוען שחקן מוביל...',
   noTopPlayerData: 'אין נתוני רווח זמינים',
   noCompletedGames: 'עדיין אין משחקים שהסתיימו',
   gamesPlayed: 'משחקים ששיחק',

   // Generic Player Stats
   loadingPlayerStat: 'טוען סטטיסטיקת שחקן...',
   mostActivePlayer: 'השחקן הכי פעיל',
   highestSingleGameProfit: 'הרווח הגבוה במשחק בודד',
   mostConsistentPlayer: 'השחקן הכי עקבי',
   biggestLoser: 'המפסיד הכי גדול',
   totalProfit: 'סך הרווח',
   avgProfit: 'ממוצע רווח',

   // League Overview Card Subtitles
   positiveProfit: 'תשואה חיובית',
   negativeProfit: 'תשואה שלילית',
   totalMoneyIn: 'כסף נכנס',
   totalMoneyOut: 'כסף יוצא',
   active: 'פעילים',
   finished: 'הסתיימו',
   uniquePlayers: 'שחקנים ייחודיים',
   perGame: 'למשחק',
   avgGameDuration: 'משך משחק ממוצע',

   // Onboarding
   onboardingSlide1Title: 'ברוכים הבאים לHOMESTACK!',
   onboardingSlide1Description:
      'אפליקציית ניהול משחקי הפוקר הביתיים שלך בקלות וביעילות.',
   onboardingSlide2Title: 'הצטרף לליגות קיימות',
   onboardingSlide2Description: 'התחבר עם חברים והתחרו בליגות קיימות.',
   onboardingSlide3Title: 'עקוב אחר הביצועים שלך',
   onboardingSlide3Description: 'צפה בניצחונות, הפסדים והביצועים הכוללים שלך.',
   onboardingSlide4Title: 'קבל ניתוח AI למשחקים',
   onboardingSlide4Description:
      'קבל ניתוח AI למשחקים שלך כדי לשפר את הביצועים שלך.',
   onboardingSlide5Title: 'התחל עכשיו',
   onboardingSlide5Description: 'התחל ביצירת הליגה הראשונה שלך היום!',
   onboardingSkipButton: 'דלג',
   onboardingNextButton: 'הבא',
   onboardingCompleteButton: 'סיים',
   onboardingViewAgain: ' צפה שוב בהדרכה',
   continueWithGoogle: 'המשך עם גוגל',
   termsOfService: 'תנאי שירות',

   // Deep linking / Join League
   joinLeagueRequiresLogin: 'עליך להירשם כדי להצטרף לליגה.',
};

const translations = {
   en: enTranslations,
   he: heTranslations,
};

const LANGUAGE_STORAGE_KEY = '@poker_league_language';

export function LocalizationProvider({
   children,
}: {
   children: React.ReactNode;
}) {
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
}

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
