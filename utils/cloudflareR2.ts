import AWS from "aws-sdk";
import { readFileSync, unlinkSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const s3Client = new AWS.S3({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
});

export async function uploadImageToR2(filePath: string): Promise<string> {
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

    // Clean up local file
    try {
      unlinkSync(cleanPath);
    } catch (e) {
      console.warn("Failed to delete local file:", e);
    }

    // Return public URL
    return `https://${process.env.R2_BUCKET_NAME}.r2.dev/${fileName}`;
  } catch (error) {
    console.error("R2 upload failed:", error);
    throw new Error("Failed to upload image to R2");
  }
}
