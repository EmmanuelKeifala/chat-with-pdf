import {loadUploadThingsToPinecoe} from '@/lib/pinecone';
import {NextResponse} from 'next/server';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const {fileName, fileKey} = body;
    const pages = await loadUploadThingsToPinecoe(fileKey);
    return NextResponse.json({message: 'Success'}, {status: 200});
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: 'Something went wrong'}, {status: 500});
  }
}
