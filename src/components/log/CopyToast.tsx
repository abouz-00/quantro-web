import React from 'react';

interface CopyToastProps {
  show: boolean;
  itemCount: number;
}

export const CopyToast: React.FC<CopyToastProps> = ({ show, itemCount }) => {
  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
      role="status"
      aria-live="polite"
    >
      <span>Copied {itemCount} item{itemCount !== 1 ? 's' : ''} to clipboard</span>
    </div>
  );
};
