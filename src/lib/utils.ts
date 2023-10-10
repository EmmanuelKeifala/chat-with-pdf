import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import axios from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function reducePdfSize(inputPdfPath: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const file = inputPdfPath[0];
      const reader = new FileReader();

      reader.onload = async () => {
        // Read the PDF file and convert it to Base64
        const base64Data = (reader.result as string)?.split(',')[1];

        // Upload the optimized PDF to CloudConvert for further optimization
        const cloudConvertResponse = await axios.post(
          'https://v2.convertapi.com/convert/pdf/to/compress?Secret=6a76uU472oNkbORe',
          {
            Parameters: [
              {
                Name: 'File',
                FileValue: {
                  Name: file.name,
                  Data: base64Data, // Use the Base64 data
                },
              },
              {
                Name: 'StoreFile',
                Value: true,
              },
              {
                Name: 'Presets',
                Value: 'text',
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        // Save the optimized PDF received from CloudConvert
        const optimizedFile = cloudConvertResponse.data.Files[0];

        console.log('File reduced:', optimizedFile);
        resolve(optimizedFile);
      };

      reader.onerror = error => {
        console.error('Error reading file:', error);
        reject(error);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reducing PDF size:', error);
      reject(error);
    }
  });
}
