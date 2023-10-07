import {Button} from '@/components/ui/button';
import {UserButton} from '@clerk/clerk-react';
import {auth} from '@clerk/nextjs';
import Link from 'next/link';
import {LogIn} from 'lucide-react';
export default async function Home() {
  const {userId} = await auth();
  const isAuth = !!userId;
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-blue-100 to-rose-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex item-center">
            <h1 className="mt-3 text-5xl font-semibold">Chat with any PDF</h1>
            {/* <UserButton afterSignOutUrl="/" /> */}
          </div>
          <div className="flex mt-2">
            {isAuth && <Button>Go to Chats</Button>}
          </div>
          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Join bunch of students, researchers and professionals to better
            understand your pdfs with AI
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <h1>File Upload</h1>
            ) : (
              <Link href={'/sign-in'}>
                <Button>
                  Login to get Started!
                  <LogIn className="w-4 ml-2 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
