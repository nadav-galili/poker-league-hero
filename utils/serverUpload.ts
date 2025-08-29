import AWS from "aws-sdk";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";

// Configure S3 client for Cloudflare R2
const s3Client = new AWS.S3({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
});

export async function uploadImageToR2Server(filePath: string): Promise<string> {
  try {
    const cleanPath = filePath.replace("file://", "");
    const imageBuffer = readFileSync(cleanPath);

    const fileName = `league-images/${uuidv4()}.jpg`;

    await s3Client
      .upload({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      })
      .promise();

    // Return the actual R2 public URL (using the actual domain with bucket prefix)
    return `https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/poker-league-images/${fileName}`;
  } catch (error) {
    console.error("R2 upload failed:", error);
    throw new Error("Failed to upload image to R2");
  }
}
