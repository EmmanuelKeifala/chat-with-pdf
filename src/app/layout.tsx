import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {ClerkProvider} from '@clerk/nextjs';
import {Toaster} from '@/components/ui/toaster';
const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: 'Chat with PDF',
  description:
    'This app will allow users to upload and ask question from a pdf',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <ClerkProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
          <Toaster />
        </html>
      </ClerkProvider>
    </>
  );
}
