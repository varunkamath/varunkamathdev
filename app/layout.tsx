import type { Metadata } from 'next';
import { Instrument_Serif, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'varun kamath',
  description: 'research software engineer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${instrumentSerif.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('theme');var h=new Date().getHours();var m=p||(h>=7&&h<19?'light':'dark');var cl=document.documentElement.classList;cl.remove('dark');cl.add(m);document.documentElement.style.colorScheme=m}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
