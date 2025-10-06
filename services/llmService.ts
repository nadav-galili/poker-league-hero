import { getDb, summaries } from '@/db';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

export async function storeLeagueStatsSummary(
   leagueId: string,
   summary: string
) {
   const now = new Date();
   const expiresAt = dayjs().add(7, 'day').toDate();

   const data = {
      content: summary,
      expiresAt,
      generatedAt: now,
      leagueId: parseInt(leagueId),
   };
   const db = getDb();
   await db
      .insert(summaries)
      .values(data)
      .onConflictDoUpdate({
         target: [summaries.leagueId],
         set: {
            ...data,
         },
      });
}

export const getLeagueStatsSummary = async (leagueId: number) => {
   const db = getDb();
   const summary = await db
      .select()
      .from(summaries)
      .where(eq(summaries.leagueId, leagueId));
   return summary;
};
