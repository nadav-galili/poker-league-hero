import { createLeague } from '../../../utils/leagueUtils';

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const { name, image, adminUserEmail } = body;

      if (!name || !adminUserEmail) {
         return Response.json(
            { error: 'Missing required fields: name, adminUserEmail' },
            { status: 400 }
         );
      }

      const league = await createLeague({
         name,
         image,
         adminUserEmail,
      });

      return Response.json(
         {
            league,
            message: 'League created successfully',
         },
         { status: 201 }
      );
   } catch (error) {
      console.error('Error creating league:', error);
      return Response.json(
         { error: 'Failed to create league' },
         { status: 500 }
      );
   }
}
