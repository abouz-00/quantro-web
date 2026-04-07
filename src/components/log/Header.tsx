import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

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
  // Track whether the menu is mounted in DOM (for exit animation)
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isMainMenuOpen) {
      setIsMenuMounted(true);
      setIsClosing(false);
    }
  }, [isMainMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsClosing(true);
    // Wait for exit animation to finish before unmounting
    setTimeout(() => {
      setIsMainMenuOpen(false);
      setIsMenuMounted(false);
      setIsClosing(false);
    }, 150);
  }, [setIsMainMenuOpen]);

  return (
    <header 
      className="w-full h-16 flex items-center justify-between px-6 shadow-sm relative transition-all duration-300 rounded-b-3xl bg-primary"
    >
      <div className="flex items-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-1 rounded-lg transition-all duration-200 cursor-pointer"
          aria-label="Go to Dashboard"
        >
          <Image 
            src="/header.svg" 
            alt="Quantro Logo" 
            width={32}
            height={32}
            className="h-8 w-auto"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.1))',
              maxHeight: '2rem'
            }}
          />
        </button>
      </div>
      
      <div className="relative">
        {/* Animated hamburger / X button */}
        <button
          onClick={() => isMainMenuOpen ? closeMenu() : setIsMainMenuOpen(true)}
          className="p-2 rounded-lg transition-colors duration-200 relative z-[60] cursor-pointer"
          aria-label={isMainMenuOpen ? "Close main menu" : "Open main menu"}
        >
          <div className="w-6 h-5 relative flex flex-col justify-center items-center">
            <span 
              className="block absolute h-[2px] w-5 bg-white rounded-full transition-all duration-300 ease-in-out"
              style={{
                transform: isMainMenuOpen 
                  ? 'rotate(45deg)' 
                  : 'translateY(-6px)',
              }}
            />
            <span 
              className="block absolute h-[2px] w-5 bg-white rounded-full transition-all duration-300 ease-in-out"
              style={{
                opacity: isMainMenuOpen ? 0 : 1,
                transform: isMainMenuOpen ? 'translateX(10px)' : 'none',
              }}
            />
            <span 
              className="block absolute h-[2px] w-5 bg-white rounded-full transition-all duration-300 ease-in-out"
              style={{
                transform: isMainMenuOpen 
                  ? 'rotate(-45deg)' 
                  : 'translateY(6px)',
              }}
            />
          </div>
        </button>
        
        {/* Dropdown Menu */}
        {isMenuMounted && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                animation: isClosing 
                  ? 'backdropFadeOut 0.15s ease-in forwards' 
                  : 'backdropFadeIn 0.2s ease-out forwards',
              }}
              onClick={closeMenu}
              data-testid="menu-backdrop"
            />
            
            {/* Dropdown Content */}
            <div 
              className="absolute top-12 right-0 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ 
                width: '12rem', 
                minWidth: '10rem',
                transformOrigin: 'top right',
                animation: isClosing
                  ? 'menuSlideUp 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                  : 'menuSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <div className="py-1">
                <nav>
                  <button
                    onClick={() => {
                      closeMenu();
                      router.push('/dashboard');
                    }}
                    className="w-full text-left px-4 py-3 transition-colors duration-150 flex items-center hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-base flex items-center gap-2 text-primary">
                      🏠 Dashboard
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTargetsModalOpen(true);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-3 transition-colors duration-150 flex items-center hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-base flex items-center gap-2 text-primary">
                      🎯 Set Targets
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      closeMenu();
                      await signOut({ 
                        callbackUrl: '/',
                        redirect: true 
                      });
                    }}
                    className="w-full text-left px-4 py-3 transition-colors duration-150 flex items-center hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-base flex items-center gap-2 text-primary">
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
