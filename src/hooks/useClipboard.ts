import { useState, useCallback } from 'react';
import { FoodEntry } from '../types/food';
import { generateEntryId } from '../utils/dateUtils';

export const useClipboard = () => {
  const [clipboardEntries, setClipboardEntries] = useState<FoodEntry[]>([]);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const copyEntries = useCallback((entries: FoodEntry[]) => {
    setClipboardEntries(entries);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }, []);

  const pasteEntries = useCallback((selectedDate: Date, addFoodEntry: (entry: FoodEntry) => void) => {
    if (clipboardEntries.length === 0) return;
    
    const newEntries = clipboardEntries.map(entry => ({
      ...entry,
      id: generateEntryId(),
      date: selectedDate.toISOString()
    }));
    
    newEntries.forEach(entry => addFoodEntry(entry));
  }, [clipboardEntries]);

  return {
    clipboardEntries,
    showCopyToast,
    copyEntries,
    pasteEntries
  };
};
