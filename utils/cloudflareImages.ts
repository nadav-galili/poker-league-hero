import FormData from "form-data";
import { readFileSync, unlinkSync } from "fs";

export async function uploadImageToCloudflare(
  filePath: string
): Promise<string> {
  const accountId = process.env.ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN; // Updated

  if (!accountId || !apiToken) {
    throw new Error("Missing Cloudflare credentials");
  }

  try {
    const cleanPath = filePath.replace("file://", "");
    const imageBuffer = readFileSync(cleanPath);

    const formData = new FormData();
    formData.append("file", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`, // Use API token
          ...formData.getHeaders(),
        },
        body: formData as unknown as BodyInit,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const imageId = result.result.id;

    try {
      unlinkSync(cleanPath);
    } catch (e) {
      console.warn("Failed to delete local file:", e);
    }

    return `${process.env.IMAGE_DELIVERY_URL}/${imageId}`;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Failed to upload image");
  }
}
