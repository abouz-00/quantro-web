import React from 'react';

interface CopyToastProps {
  show: boolean;
  itemCount: number;
}

export const CopyToast: React.FC<CopyToastProps> = ({ show, itemCount }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
      <span>📋</span>
      <span>Copied {itemCount} item{itemCount !== 1 ? 's' : ''} to clipboard</span>
    </div>
  );
};
