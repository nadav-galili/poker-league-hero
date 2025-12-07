import { z } from 'zod';

export const aiSummarySchema = z.object({
   financialSnapshot: z.string(),
   lastGameHighlights: z.string(),
   stats: z.object({
      totalProfit: z.number(),
      totalBuyIns: z.number(),
      totalGames: z.number(),
      highestSingleGameProfit: z.number(),
      highestSingleGamePlayer: z.string(),
   }),
});

export type AISummary = z.infer<typeof aiSummarySchema>;
