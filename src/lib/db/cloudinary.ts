import axios from 'axios';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({path: '.env'});

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.API_KEY!,
  api_secret: process.env.API_SECRET!,
});

export async function uploadFileToCloudinary(fileUrl: string): Promise<string> {
  try {
    // Download the file from the URL
    const response = await axios.get(fileUrl, {responseType: 'arraybuffer'});

    // Upload the downloaded file to Cloudinary
    const uploadResponse: any = await cloudinary.v2.uploader
      .upload_stream(
        {
          folder: 'chatPDFS',
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading file to Cloudinary:', error);
          } else {
            console.log('File uploaded to Cloudinary:', result?.secure_url);
          }
        },
      )
      .end(Buffer.from(response.data));

    return uploadResponse?.secure_url;
  } catch (error) {
    console.error('Error downloading and uploading file:', error);
    throw error;
  }
}
