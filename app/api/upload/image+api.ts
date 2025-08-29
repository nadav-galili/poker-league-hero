import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Configure S3 client for Cloudflare R2
const s3Client = new AWS.S3({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate unique filename
    const fileName = `league-images/${uuidv4()}.jpg`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    await s3Client
      .upload({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      })
      .promise();

    // Return the actual R2 public URL (using the actual domain with bucket prefix)
    const publicUrl = `https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/poker-league-images/${fileName}`;

    return Response.json({
      success: true,
      url: publicUrl,
      key: fileName,
    });
  } catch (error) {
    console.error("R2 upload failed:", error);
    return Response.json(
      { error: "Failed to upload image to R2" },
      { status: 500 }
    );
  }
}
