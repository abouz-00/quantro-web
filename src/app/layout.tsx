import type { Metadata } from "next";
import { GeistSans } from 'geist/font'
import "./globals.css";
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata: Metadata = {
  title: "Quantro",
  description: "Quantro – Track food and fuel your goals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
