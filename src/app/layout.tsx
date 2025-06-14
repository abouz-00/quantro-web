import type { Metadata } from "next";
import { Montserrat } from 'next/font/google'
import "./globals.css";
import ErrorBoundary from '../components/ErrorBoundary';

const montserrat = Montserrat({ subsets: ['latin'] });

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
    <html lang="en" className={montserrat.className}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Quantro" />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
