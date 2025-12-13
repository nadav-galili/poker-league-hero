import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { leagueMembers, leagues, users } from './schema';

let dbInstance: any = null;

export function getDb() {
   if (dbInstance) {
      return dbInstance;
   }

   const connectionString = process.env.DATABASE_URL;
   if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
   }

   // Use Neon's HTTP client - works in Expo Server (neon-serverless has compatibility issues)
   const sql = neon(connectionString);

   dbInstance = drizzle(sql, {
      schema: { users, leagues, leagueMembers },
   });
   return dbInstance;
}

// Function to reset database instance (HTTP client doesn't need closing)
export function closeDb() {
   dbInstance = null;
}
