export async function GET(request: Request) {
   try {
      const url = new URL(request.url);
      const testUrl = url.searchParams.get('url');

      if (!testUrl) {
         return Response.json(
            { error: "Please provide a 'url' query parameter" },
            { status: 400 }
         );
      }

      // Test if the URL is accessible
      try {
         const response = await fetch(testUrl, { method: 'HEAD' });

         return Response.json({
            url: testUrl,
            accessible: response.ok,
            status: response.status,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
         });
      } catch (error) {
         return Response.json({
            url: testUrl,
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
      }
   } catch (error) {
      console.error('Error testing image URL:', error);
      return Response.json(
         { error: 'Failed to test image URL' },
         { status: 500 }
      );
   }
}
