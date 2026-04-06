import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
}

/**
 * Generic Modal Component
 * 
 * A reusable modal shell that provides:
 * - Background overlay with click-to-close
 * - Scroll locking (prevents background from scrolling)
 * - Proper accessibility (ESC to close)
 * - Flexible sizing options
 * 
 * This is a "dumb" component - it knows nothing about the specific
 * content inside it. All modal-specific logic lives in the components
 * that use this shell.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  maxWidth = "900px",
  height = "600px",
  maxHeight = "90vh",
}: ModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    // Save original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    // Get current scroll position
    const scrollY = window.scrollY;

    // Lock body in place
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      // Restore body styles
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.body.style.overflow = originalBodyOverflow;

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-modal-backdrop"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={(e) => {
        // Only close if clicking on the backdrop itself
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl flex flex-col animate-modal-content"
        style={{
          width: "60vw",
          minWidth: "320px",
          maxWidth,
          height,
          maxHeight,
          margin: "0 auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - only show if title or close button is needed */}
        {(title || showCloseButton) && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              {title && <h2 className="text-xl font-bold">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200 ml-auto"
                  aria-label="Close modal"
                >
                  <FaTimes size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <div
            className="h-full"
            onWheel={(e) => {
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const wheelDelta = e.deltaY;

              // Prevent scroll chaining when at boundaries
              if (
                (wheelDelta < 0 && scrollTop === 0) ||
                (wheelDelta > 0 && scrollTop + clientHeight >= scrollHeight)
              ) {
                e.preventDefault();
              }
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
