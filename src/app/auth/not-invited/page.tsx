"use client";

import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function NotInvitedPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden fixed inset-0" style={{ backgroundColor: '#6e44ff', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="text-center px-6 py-4 w-full max-w-md mx-auto h-full flex flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image 
            src="/quantro_header.svg" 
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
            Quantro is currently in private beta. To get access, please join our waitlist and we'll send you an invite soon!
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <a
              href="https://forms.gle/your-waitlist-form" // Replace with your actual waitlist form
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full px-6 py-3 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors cursor-pointer text-center ${poppins.className}`}
            >
              Join Waitlist
            </a>
            
            <Link
              href="/"
              className={`block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer text-center ${poppins.className}`}
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
            © 2025 Quantro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
