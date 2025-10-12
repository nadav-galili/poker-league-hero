import { getDb, users } from '../../db';

export const GET = async (request: Request) => {
   try {
      console.log('Testing DB connection...');
      const db = getDb();

      console.log('DB instance created, running query...');
      const userCount = await db.select().from(users).limit(1);

      console.log('Query successful:', userCount);

      return Response.json(
         {
            status: 'ok',
            dbConnected: true,
            timestamp: new Date().toISOString(),
            userCount: userCount.length,
         },
         { status: 200 }
      );
   } catch (error: any) {
      console.error('DB test failed:', error);
      return Response.json(
         {
            status: 'error',
            dbConnected: false,
            error: error.message,
            stack: error.stack,
         },
         { status: 500 }
      );
   }
};
