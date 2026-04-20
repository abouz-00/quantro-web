import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "../styles/dm-sans.css";
import SessionWrapper from '../components/shared/SessionWrapper';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Simple wrapper that only enables ErrorBoundary in production
const ErrorWrapper = ({ children }: { children: React.ReactNode }) => {
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }
  
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export const metadata: Metadata = {
  title: "Quantro",
  description: "Quantro – Track food and fuel your goals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Quantro" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={dmSans.className}>
        <SessionWrapper>
          <ErrorWrapper>
            {children}
          </ErrorWrapper>
        </SessionWrapper>
        <Analytics />
      </body>
    </html>
  );
}
