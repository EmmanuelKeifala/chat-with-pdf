import {db} from '@/lib/db';
import {chats} from '@/lib/db/schema';
import {loadUploadThingsToPinecone} from '@/lib/pinecone';
import {auth} from '@clerk/nextjs';
import {NextResponse} from 'next/server';

export async function POST(req: Request, res: Response) {
  const {userId} = auth();
  if (!userId) {
    return NextResponse.json(
      {error: 'Something went wrong, Not Authorized'},
      {status: 500},
    );
  }

  try {
    const body = await req.json();
    const {fileName, fileKey} = body;
    await loadUploadThingsToPinecone(fileKey);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: fileKey,
        pdfName: fileName,
        pdfUrl: `https://utfs.io/f/${fileKey}`,
        userId: userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json({chat_id: chat_id[0].insertedId}, {status: 200});
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: 'Something went wrong'}, {status: 500});
  }
}
