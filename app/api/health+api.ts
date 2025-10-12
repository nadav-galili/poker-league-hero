export const GET = async (request: Request) => {
   return Response.json(
      {
         status: 'ok',
         timestamp: new Date().toISOString(),
         env: {
            hasDatabase: !!process.env.DATABASE_URL,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
            hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            hasOpenAI: !!process.env.OPENAI_API_KEY,
         },
      },
      { status: 200 }
   );
};
