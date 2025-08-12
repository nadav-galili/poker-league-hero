import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { leagueMembers, leagues, users } from "./schema";

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(connectionString, {
    prepare: false,
  });

  dbInstance = drizzle(client, { schema: { users, leagues, leagueMembers } });
  return dbInstance;
}
