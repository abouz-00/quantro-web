"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#6e44ff' }}>
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
