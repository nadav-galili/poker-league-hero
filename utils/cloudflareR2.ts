import { BASE_URL } from '@/constants';

export async function uploadImageToR2(filePath: string): Promise<string> {
   try {
      // Create FormData for the upload
      const formData = new FormData();
      formData.append('file', {
         uri: filePath,
         type: 'image/jpeg',
         name: 'image.jpg',
      } as any);

      // Upload to our API endpoint
      const response = await fetch(`${BASE_URL}/api/upload/image`, {
         method: 'POST',
         body: formData,
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
   } catch (error) {
      console.error('R2 upload failed:', error);
      throw new Error('Failed to upload image to R2');
   }
}
