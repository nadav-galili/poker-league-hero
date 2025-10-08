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
   try {
      const formData = await request.formData();
      const fileData = (formData as any).get('file');
      const file = fileData as File;

      if (!file) {
         return Response.json({ error: 'No file provided' }, { status: 400 });
      }

      // Generate unique filename
      const fileName = `league-images/${uuidv4()}.jpg`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to R2 using AWS SDK
      const command = new PutObjectCommand({
         Bucket: process.env.R2_BUCKET_NAME!,
         Key: fileName,
         Body: buffer,
         ContentType: file.type || 'image/jpeg',
      });

      await s3Client.send(command);

      // Return the actual R2 public URL
      const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/poker-league-images/${fileName}`;

      return Response.json({
         success: true,
         url: publicUrl,
         key: fileName,
      });
   } catch (error) {
      console.error('R2 upload failed:', error);
      return Response.json(
         { error: 'Failed to upload image to R2' },
         { status: 500 }
      );
   }
}
