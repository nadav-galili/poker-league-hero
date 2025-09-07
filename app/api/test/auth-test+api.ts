export async function GET(request: Request) {
   console.log('🧪 Auth test endpoint hit!');

   return Response.json({
      success: true,
      message: 'Auth test endpoint working',
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
   });
}
