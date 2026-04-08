"use client";

import Link from 'next/link';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface AuthErrorPageProps {
  error: string | null;
}

export default function AuthErrorPage({ error }: AuthErrorPageProps) {
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. Your email may not have beta access, or the sign-in provider blocked the request. Check that your OAuth app is published (not in "Testing" mode) and that your email is on the beta list.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with a different sign-in method. Please sign in with your original method.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-primary">
      <div className="text-center px-6 py-8 max-w-md mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h1 className={`text-2xl font-bold text-gray-800 mb-2 ${poppins.className}`}>
              Authentication Error
            </h1>
            <p className={`text-gray-600 ${poppins.className}`}>
              {getErrorMessage(error)}
            </p>
          </div>

          <Link
            href="/"
            className={`inline-flex items-center justify-center w-full px-6 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors ${poppins.className}`}
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
