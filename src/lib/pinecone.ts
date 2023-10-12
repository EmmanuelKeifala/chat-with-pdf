import {
  Pinecone,
  PineconeRecord,
  utils as PineconeUtils,
} from '@pinecone-database/pinecone';
import {downloadFromUploadThings} from './db/upload-server';
import {PDFLoader} from 'langchain/document_loaders/fs/pdf';
import md5 from 'md5';
import {
  Document,
  RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter';
import {getEmbeddings} from './embeddings';
import {convertToAscii} from './utils';

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENV!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_INTERVAL_MS = 20000; // 20 seconds

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: {pageNumber: number};
  };
};

export async function loadUploadThingsToPinecone(fileKey: string) {
  // 1. Obtain the PDF from upload things and read it
  console.log('downloading file');
  const file_name = await downloadFromUploadThings(fileKey);
  if (!file_name) {
    throw new Error('could not download from s3');
  }
  console.log('loading pdf into memory: ' + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the PDF
  const documents = await prepareDocuments(pages);
  console.log('DOCUMENTS', documents);

  // 3. vectorize and embed individual documents and upload to Pinecone
  const client = getPineconeClient();
  const pineconeIndex = client.index('chatpdf');
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  for (const doc of documents.flat()) {
    // Vectorize and embed the document
    const vector = await embedDocuments(doc);

    // Add a 20-second delay
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Upload the vector to Pinecone
    console.log('Inserting vector into Pinecone');
    await namespace.upsert([vector]);
  }

  return documents[0];
}

// Truncate strings
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

// Prepare the document for vectorization
async function prepareDocument(page: PDFPage) {
  let {pageContent, metadata} = page;
  pageContent = pageContent.replace(/\n/g, '');
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

async function prepareDocuments(pages: PDFPage[]) {
  const documents = await Promise.all(
    pages.map(async (page, index) => {
      let {pageContent, metadata} = page;
      pageContent = pageContent.replace(/\n/g, '');
      const splitter = new RecursiveCharacterTextSplitter();
      const doc = new Document({
        pageContent,
        metadata: {
          pageNumber: metadata.loc.pageNumber,
          text: truncateStringByBytes(pageContent, 36000),
        },
      });

      // Check if there is a next page for the current document
      const nextPage = index + 1 < pages.length ? pages[index + 1] : null;

      if (nextPage) {
        const {pageContent: nextPageContent, metadata: nextMetadata} = nextPage;
        const nextDoc = new Document({
          pageContent: nextPageContent,
          metadata: {
            pageNumber: nextMetadata.loc.pageNumber,
            text: truncateStringByBytes(nextPageContent, 36000),
          },
        });
        return [doc, nextDoc];
      } else {
        return [doc];
      }
    }),
  );

  return documents;
}

export async function embedDocuments(documents: Document) {
  const text = documents.pageContent;
  const embeddings = await getEmbeddings(text);
  console.log(embeddings);
  const hash = md5(text);

  return {
    id: hash,
    values: embeddings,
    metadata: {
      text: documents.metadata.text,
      pageNumber: documents.metadata.pageNumber,
    },
  } as PineconeRecord;
}
