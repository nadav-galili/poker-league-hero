import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";

export type Language = "en" | "he";

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

  // League Creation
  createLeaguePrompt: string;
  joinLeaguePrompt: string;
  enterLeagueCode: string;
  cancel: string;
  join: string;
  create: string;

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
}

// English translations
const enTranslations: Translations = {
  // Navigation
  myLeagues: "MY LEAGUES",
  account: "ACCOUNT",

  // League Screen
  createLeague: "Create League",
  joinLeague: "Join League",
  noLeaguesYet: "NO LEAGUES YET",
  createFirstLeague: "Create your first league or join an existing one",
  members: "MEMBERS",

  // League Names
  fridayNightPoker: "FRIDAY NIGHT POKER",
  weekendWarriors: "WEEKEND WARRIORS",
  royalFlushClub: "ROYAL FLUSH CLUB",
  highStakesHeroes: "HIGH STAKES HEROES",

  // Auth
  signInWithGoogle: "SIGN IN WITH GOOGLE",
  continueAsGuest: "CONTINUE AS GUEST",
  signOut: "SIGN OUT",

  // Account
  accountActions: "ACCOUNT ACTIONS",
  userDetails: "USER DETAILS",
  userId: "USER ID",
  firstName: "FIRST NAME",
  lastName: "LAST NAME",
  provider: "PROVIDER",
  verified: "VERIFIED",

  // Common
  language: "LANGUAGE",
  english: "English",
  hebrew: "עברית",

  // League Creation
  createLeaguePrompt: "Navigation to create league form coming soon!",
  joinLeaguePrompt: "Enter league code:",
  enterLeagueCode: "Enter league code:",
  cancel: "Cancel",
  join: "Join",
  create: "Create",

  // Share
  joinMyLeague: "🎮 Join my poker league:",
  leagueCode: "League Code:",
  joinHere: "Join here:",
  shareLeague: "Share League",
  error: "Error",
  failedToShare: "Failed to share league code",

  // Error Boundary
  errorOccurred: "Oops! Something went wrong",
  errorMessage: "An unexpected error occurred. Our team has been notified.",
  tryAgain: "Try Again",
};

// Hebrew translations
const heTranslations: Translations = {
  // Navigation
  myLeagues: "הליגות שלי",
  account: "חשבון",

  // League Screen
  createLeague: "צור ליגה",
  joinLeague: "הצטרף לליגה",
  noLeaguesYet: "עדיין אין ליגות",
  createFirstLeague: "צור את הליגה הראשונה שלך או הצטרף לליגה קיימת",
  members: "חברים",

  // League Names
  fridayNightPoker: "פוקר יום שישי בערב",
  weekendWarriors: "לוחמי סוף השבוע",
  royalFlushClub: "מועדון הרויאל פלאש",
  highStakesHeroes: "גיבורי ההימורים הגבוהים",

  // Auth
  signInWithGoogle: "התחבר עם גוגל",
  continueAsGuest: "המשך כאורח",
  signOut: "התנתק",

  // Account
  accountActions: "פעולות חשבון",
  userDetails: "פרטי משתמש",
  userId: "מזהה משתמש",
  firstName: "שם פרטי",
  lastName: "שם משפחה",
  provider: "ספק",
  verified: "מאומת",

  // Common
  language: "שפה",
  english: "English",
  hebrew: "עברית",

  // League Creation
  createLeaguePrompt: "ניווט לטופס יצירת ליגה יגיע בקרוב!",
  joinLeaguePrompt: "הזן קוד ליגה:",
  enterLeagueCode: "הזן קוד ליגה:",
  cancel: "ביטול",
  join: "הצטרף",
  create: "צור",

  // Share
  joinMyLeague: "🎮 הצטרף לליגת הפוקר שלי:",
  leagueCode: "קוד ליגה:",
  joinHere: "הצטרף כאן:",
  shareLeague: "שתף ליגה",
  error: "שגיאה",
  failedToShare: "נכשל בשיתוף קוד הליגה",

  // Error Boundary
  errorOccurred: "אופס! משהו השתבש",
  errorMessage: "אירעה שגיאה בלתי צפויה. הצוות שלנו קיבל דיווח על הבעיה.",
  tryAgain: "נסה שוב",
};

const translations = {
  en: enTranslations,
  he: heTranslations,
};

const LANGUAGE_STORAGE_KEY = "@poker_league_language";

export function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "he")) {
        setLanguageState(savedLanguage);
        await updateRTLMode(savedLanguage);
      }
    } catch (error) {
      console.error("Failed to load saved language:", error);
    } finally {
      setIsInitialized(true);
    }
  };

  const updateRTLMode = async (lang: Language) => {
    const isRTL = lang === "he";
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
      console.error("Failed to save language:", error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[language];
    const value = (translation as any)[key];
    return value || key; // Fallback to key if translation not found
  };

  const isRTL = language === "he";

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
      "useLocalization must be used within a LocalizationProvider"
    );
  }
  return context;
}

export default LocalizationProvider;
