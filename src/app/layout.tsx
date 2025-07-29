import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import ErrorBoundary from '../components/ErrorBoundary';
import SessionWrapper from '../components/SessionWrapper';



export const metadata: Metadata = {
  title: "Quantro",
  description: "Quantro – Track food and fuel your goals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Quantro" />
      </head>
      <body>
        <SessionWrapper>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </SessionWrapper>
      </body>
    </html>
  );
}
