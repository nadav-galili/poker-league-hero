import { withAuth } from '@/utils/middleware';

export const GET = withAuth(async (request: Request) => {
   const authHeader = request.headers.get('Authorization');
   const token = authHeader?.replace('Bearer ', '');

   return Response.json({
      token: token || 'No token found',
      authHeader: authHeader || 'No auth header',
   });
});
