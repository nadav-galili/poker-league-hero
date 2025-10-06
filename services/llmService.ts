import { getDb, summaries } from '@/db';
import dayjs from 'dayjs';

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
