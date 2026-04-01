import React, { useEffect, useState } from 'react';

interface UndoDeleteToastProps {
  show: boolean;
  itemCount: number;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export const UndoDeleteToast: React.FC<UndoDeleteToastProps> = ({
  show,
  itemCount,
  onUndo,
  onDismiss,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);
  // Reset progress when show changes - derive initial state from prop
  const [prevShow, setPrevShow] = useState(show);
  if (show && !prevShow) {
    setProgress(100);
    setPrevShow(true);
  } else if (!show && prevShow) {
    setPrevShow(false);
  }

  useEffect(() => {
    if (!show) return;

    let current = 100;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      current -= step;
      if (current <= 0) {
        clearInterval(timer);
        onDismiss();
        return;
      }
      setProgress(current);
    }, interval);

    return () => clearInterval(timer);
  }, [show, duration, onDismiss]);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-lg shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3 bg-gray-900 text-white px-4 py-3">
        <span className="text-sm">
          Deleted {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onUndo}
          className="text-sm font-semibold text-violet-300 hover:text-violet-100 transition-colors duration-150 cursor-pointer"
        >
          Undo
        </button>
      </div>
      <div
        className="h-0.5 bg-violet-400 transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
