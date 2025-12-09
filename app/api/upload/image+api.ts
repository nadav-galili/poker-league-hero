import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
   region: 'auto',
   endpoint: process.env.R2_ENDPOINT,
   credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
   },
   forcePathStyle: true,
});

export async function POST(request: Request) {
   console.log('🔄 R2 Upload API called');

   try {
      // Validate required environment variables
      if (
         !process.env.R2_ENDPOINT ||
         !process.env.R2_ACCESS_KEY_ID ||
         !process.env.R2_SECRET_ACCESS_KEY ||
         !process.env.R2_BUCKET_NAME ||
         !process.env.CLOUDFLARE_R2_PUBLIC_URL
      ) {
         console.error('❌ Missing required R2 environment variables');
         return Response.json(
            { error: 'Server configuration error' },
            { status: 500 }
         );
      }

      // Parse query params to get folder
      const url = new URL(request.url);
      const folder = url.searchParams.get('folder') || 'league-images';
      // Sanitize folder name to prevent directory traversal
      const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '');

      const formData = await request.formData();
      const fileData = (formData as any).get('file') as File | Blob | null;
      if (!fileData) {
         console.error('❌ No file provided in FormData');
         return Response.json({ error: 'No file provided' }, { status: 400 });
      }
      let buffer: Buffer;
      let contentType = 'image/jpeg';

      // Handle Web File objects and React Native blobs
      if (fileData instanceof File) {
         console.log('🌐 Web File detected');
         const arrayBuffer = await fileData.arrayBuffer();
         buffer = Buffer.from(arrayBuffer);
         contentType = fileData.type || 'image/jpeg';

         console.log('✅ File processed:', {
            size: buffer.length,
            type: contentType,
         });
      }
      // Handle Blob objects (React Native sends blobs now)
      else if (fileData instanceof Blob) {
         console.log('📱 Blob detected (React Native)');
         const arrayBuffer = await fileData.arrayBuffer();
         buffer = Buffer.from(arrayBuffer);
         contentType = fileData.type || 'image/jpeg';

         console.log('✅ Blob processed:', {
            size: buffer.length,
            type: contentType,
         });
      }
      // Handle React Native FormData with URI (fallback)
      else if (fileData && typeof fileData === 'object' && 'uri' in fileData) {
         console.error(
            '❌ URI-based uploads not supported in EAS Hosting environment'
         );
         console.log('📱 Received URI object:', {
            uri: (fileData as any).uri,
            type: (fileData as any).type,
            name: (fileData as any).name,
         });
         return Response.json(
            {
               error: 'URI-based uploads not supported',
               details:
                  'Please ensure the app converts files to blobs before uploading',
            },
            { status: 400 }
         );
      } else {
         console.error(
            '❌ Unsupported file data type:',
            typeof fileData,
            fileData
         );
         return Response.json(
            { error: 'Unsupported file format' },
            { status: 400 }
         );
      }

      // Validate file size (max 10MB)
      if (buffer.length === 0) {
         console.error('❌ File is empty');
         return Response.json({ error: 'File is empty' }, { status: 400 });
      }

      if (buffer.length > 10 * 1024 * 1024) {
         console.error('❌ File too large:', buffer.length);
         return Response.json(
            { error: 'File too large (max 10MB)' },
            { status: 400 }
         );
      }

      // Generate unique filename
      const fileExtension = contentType === 'image/png' ? 'png' : 'jpg';
      const fileName = `${sanitizedFolder}/${uuidv4()}.${fileExtension}`;

      console.log(`📁 Uploading ${buffer.length} bytes to: ${fileName}`);

      // Upload to R2 using AWS SDK (as per Cloudflare docs)
      const putObjectCommand = new PutObjectCommand({
         Bucket: process.env.R2_BUCKET_NAME!,
         Key: fileName,
         Body: buffer,
         ContentType: contentType,
      });

      await s3Client.send(putObjectCommand);

      // Generate public URL
      const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;

      console.log('✅ Upload successful, public URL:', publicUrl);

      return Response.json({
         success: true,
         url: publicUrl,
         key: fileName,
         size: buffer.length,
         contentType: contentType,
      });
   } catch (error) {
      console.error('❌ R2 upload failed:', error);

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to upload image to R2';
      let errorDetails =
         error instanceof Error ? error.message : 'Unknown error';
      let statusCode = 500;

      if (error instanceof Error) {
         if (error.message.includes('Failed to fetch file from URI')) {
            errorMessage = 'Failed to read image file';
            errorDetails =
               'Unable to access the selected image. Please try selecting a different image.';
            statusCode = 400;
         } else if (
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')
         ) {
            errorMessage = 'Network error during upload';
            errorDetails =
               'Please check your internet connection and try again.';
            statusCode = 503;
         } else if (
            error.message.includes('AccessDenied') ||
            error.message.includes('credentials')
         ) {
            errorMessage = 'Server configuration error';
            errorDetails =
               'Unable to upload image due to server configuration issue.';
            statusCode = 500;
         }
      }

      return Response.json(
         {
            error: errorMessage,
            details: errorDetails,
            originalError:
               error instanceof Error ? error.message : 'Unknown error',
         },
         { status: statusCode }
      );
   }
}
