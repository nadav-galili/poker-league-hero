import { getDb, summaries } from '@/db';
import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';

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

export const getLeagueStatsSummary = async (
   leagueId: number
): Promise<string | null> => {
   const db = getDb();
   const summary = await db
      .select({ content: summaries.content })
      .from(summaries)
      .where(
         and(
            eq(summaries.leagueId, leagueId),
            gt(summaries.expiresAt, new Date())
         )
      )
      .limit(1);
   return summary[0]?.content || null;
};
