// Mobile stub for database - prevents server-side imports in mobile builds
export const getDb = () => {
   throw new Error('Database access not available on mobile');
};

// Export empty objects for schema items to satisfy imports
export const users = {};
export const leagues = {};
export const leagueMembers = {};
export const games = {};
export const gameMembers = {};
export const gameStatusEnum = {};
