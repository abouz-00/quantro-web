import type { Metadata } from "next";
import "./globals.css";
import "../styles/dm-sans.css";
import SessionWrapper from '../components/SessionWrapper';
import ErrorBoundary from '../components/ErrorBoundary';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
          }
        `}} />
      </head>
      <body style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <SessionWrapper>
          <ErrorWrapper>
            {children}
          </ErrorWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}
