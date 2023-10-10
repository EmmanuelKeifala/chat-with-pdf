import {UTApi} from 'uploadthing/server';
import fs from 'fs';
import axios from 'axios';
import os from 'os';
import path from 'path';

export const utapi = new UTApi();

export async function downloadFromUploadThings(fileKey: string) {
  // const oneUrl: any = await utapi.getFileUrls(fileKey);
  const url: any = `https://utfs.io/f/${fileKey}`;
  const response = await axios.get(url, {responseType: 'stream'});

  const tmpDir = path.join(os.homedir(), 'tmp'); // Use a 'tmp' directory in the user's home directory
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir); // Create the directory if it doesn't exist
  }

  const fileName = path.join(tmpDir, `pdf-${Date.now()}.pdf`);

  const writeStream = fs.createWriteStream(fileName);
  response.data.pipe(writeStream);

  return new Promise<string>((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log('File downloaded successfully:', fileName);
      resolve(fileName);
    });

    writeStream.on('error', error => {
      console.error('Error writing file:', error);
      reject(error);
    });
  });
}
