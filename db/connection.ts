import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { leagueMembers, leagues, users } from './schema';

let dbInstance: any = null;
let clientInstance: any = null;

export function getDb() {
   if (dbInstance) {
      return dbInstance;
   }

   const connectionString = process.env.DATABASE_URL;
   if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
   }

   clientInstance = postgres(connectionString, {
      prepare: false,
      max: 5, // Reduced maximum number of connections in the pool
      idle_timeout: 10, // Close connections after 10 seconds of inactivity
      max_lifetime: 60 * 5, // Close connections after 5 minutes
      connect_timeout: 10, // Connection timeout in seconds
      onnotice: () => {}, // Disable notices
      debug: false, // Disable debug logging
   });

   dbInstance = drizzle(clientInstance, {
      schema: { users, leagues, leagueMembers },
   });
   return dbInstance;
}

// Function to close database connections when needed
export async function closeDb() {
   if (clientInstance) {
      await clientInstance.end();
      clientInstance = null;
      dbInstance = null;
   }
}
