import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { HiMenu } from 'react-icons/hi';

interface HeaderProps {
  isMainMenuOpen: boolean;
  setIsMainMenuOpen: (open: boolean) => void;
  setIsTargetsModalOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMainMenuOpen,
  setIsMainMenuOpen,
  setIsTargetsModalOpen
}) => {
  const router = useRouter();

  return (
    <header 
      className="w-full h-16 flex items-center justify-between px-6 shadow-sm relative transition-all duration-300 rounded-b-3xl" 
      style={{ backgroundColor: '#6e44ff' }}
    >
      <div className="flex items-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-1 rounded-lg transition-all duration-200 cursor-pointer"
          aria-label="Go to Dashboard"
        >
          <img 
            src="/header.svg" 
            alt="Quantro Logo" 
            className="h-8"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.1))',
              maxHeight: '2rem',
              width: 'auto'
            }}
          />
        </button>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
          className="p-2 rounded-lg transition-colors duration-200 relative z-[60] cursor-pointer"
          aria-label={isMainMenuOpen ? "Close main menu" : "Open main menu"}
        >
          <HiMenu className="h-6 w-6 text-white" />
        </button>
        
        {/* Dropdown Menu */}
        {isMainMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity duration-300 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
              onClick={() => setIsMainMenuOpen(false)}
              data-testid="menu-backdrop"
            />
            
            {/* Dropdown Content */}
            <div 
              className="absolute top-12 right-0 bg-white rounded-lg shadow-xl z-50"
              style={{ 
                width: '12rem', 
                minWidth: '10rem',
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <div className="py-2">
                <nav>
                  <button
                    onClick={() => {
                      setIsTargetsModalOpen(true);
                      setIsMainMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-base flex items-center gap-2" style={{ color: '#6e44ff' }}>
                      🎯 Set Targets
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      setIsMainMenuOpen(false);
                      await signOut({ 
                        callbackUrl: '/',
                        redirect: true 
                      });
                    }}
                    className="w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-base flex items-center gap-2" style={{ color: '#6e44ff' }}>
                      🚪 Sign Out
                    </span>
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
