"use client";

import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface NotInvitedPageProps {
  betaCode: string;
  setBetaCode: (code: string) => void;
  isSubmitting: boolean;
  error: string;
  onSubmitCode: (e: React.FormEvent) => void;
}

export default function NotInvitedPage({
  betaCode,
  setBetaCode,
  isSubmitting,
  error,
  onSubmitCode
}: NotInvitedPageProps) {
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden fixed inset-0 bg-primary" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="text-center px-6 py-4 w-full max-w-md mx-auto h-full flex flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/header.svg"
            alt="Quantro Logo"
            className="h-24 w-auto mx-auto"
            width={576}
            height={576}
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.05))'
            }}
          />
        </div>

        {/* Message */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h1 className={`text-2xl font-semibold text-gray-800 mb-4 ${poppins.className}`}>
            Beta Access Required
          </h1>
          <p className={`text-gray-600 mb-6 leading-relaxed ${poppins.className}`}>
            Quantro is currently in private beta. Enter your beta access code below or request access.
          </p>

          {/* Beta Code Form */}
          <form onSubmit={onSubmitCode} className="mb-6">
            <div className="mb-4">
              <label htmlFor="betaCode" className={`block text-sm font-medium text-gray-700 mb-2 text-left ${poppins.className}`}>
                Beta Access Code
              </label>
              <input
                type="text"
                id="betaCode"
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value)}
                placeholder="Enter your beta code"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${poppins.className}`}
                disabled={isSubmitting}
              />
              {error && (
                <p className={`text-red-600 text-sm mt-2 text-left ${poppins.className}`}>
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !betaCode.trim()}
              className={`w-full px-6 py-3 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${poppins.className}`}
            >
              {isSubmitting ? 'Checking...' : 'Access Beta'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 bg-white text-gray-500 ${poppins.className}`}>or</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="mailto:hello@quantro.fit?subject=Beta Access Request"
              className={`block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer text-center ${poppins.className}`}
            >
              Request Beta Access
            </Link>

            <Link
              href="/"
              className={`block w-full px-6 py-3 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer text-center ${poppins.className}`}
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Contact */}
        <p className={`text-white/70 text-sm ${poppins.className}`}>
          Questions? Email us at{' '}
          <a href="mailto:hello@quantro.fit" className="text-white hover:underline">
            hello@quantro.fit
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-white/70 text-sm ${poppins.className}`}>
            © 2025 Quantro LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
