import {Pinecone} from '@pinecone-database/pinecone';
import {downloadFromUploadThings} from './db/upload-server';
import {PDFLoader} from 'langchain/document_loaders/fs/pdf';
export const getPineCone = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENV!,
  });
  return pinecone;
};

// await pinecone.listIndexes();

export async function loadUploadThingsToPinecoe(fileKey: string) {
  // 1. Obtain the pdf from upload things and read it
  console.log('downloading file ');
  const file_name = await downloadFromUploadThings(fileKey);
  console.log(file_name);
  if (!file_name) {
    throw new Error('File not found');
  }
  const loader = new PDFLoader(file_name);
  const pages = await loader.load();
  return pages;
}
