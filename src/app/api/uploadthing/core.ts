import {getAuth} from '@clerk/nextjs/server';
import {createUploadthing, type FileRouter} from 'uploadthing/next';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({pdf: {maxFileSize: '16MB'}})
    // Set permissions and file types for this FileRoute
    .middleware(async ({req}) => {
      const {userId} = getAuth(req);
      if (!userId) throw new Error('Not authenticated');

      return {userId};
    })
    .onUploadComplete(async ({metadata, file}) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
