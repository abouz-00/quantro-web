import { useState, useCallback, useEffect, useMemo } from 'react';

interface UseDateManagerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  enableLocalStorage?: boolean;
  storageKey?: string;
}

interface UseDateManagerReturn {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToDate: (date: Date) => void;
  addDays: (days: number) => void;
  subtractDays: (days: number) => void;
  isToday: boolean;
  formatDisplayDate: () => string;
  formatApiDate: () => string;
}

export function useDateManager({
  initialDate = new Date(),
  onDateChange,
  enableLocalStorage = false,
  storageKey = 'selectedDate'
}: UseDateManagerProps = {}): UseDateManagerReturn {
  
  // Initialize date from localStorage if enabled, otherwise use initialDate
  const [selectedDate, setSelectedDateState] = useState<Date>(() => {
    if (enableLocalStorage && typeof window !== 'undefined') {
      const savedDate = localStorage.getItem(storageKey);
      if (savedDate) {
        const parsedDate = new Date(savedDate);
        // Validate the date
        if (!isNaN(parsedDate.getTime())) {
          // Normalize to local date without time component
          return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
        }
      }
    }
    // Normalize initial date to remove time component
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate());
  });

  // Save to localStorage when date changes (if enabled)
  useEffect(() => {
    if (enableLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, selectedDate.toISOString());
    }
  }, [selectedDate, enableLocalStorage, storageKey]);

  // Call onDateChange callback when date changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  const setSelectedDate = useCallback((date: Date) => {
    // Normalize date to remove time component
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateState(normalizedDate);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    setSelectedDateState(normalizedToday);
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDateState(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDateState(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  const goToDate = useCallback((date: Date) => {
    // Normalize date to remove time component
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateState(normalizedDate);
  }, []);

  const addDays = useCallback((days: number) => {
    setSelectedDateState(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  const subtractDays = useCallback((days: number) => {
    setSelectedDateState(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
      newDate.setDate(newDate.getDate() - days);
      return newDate;
    });
  }, []);

  const isToday = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  const formatDisplayDate = useCallback(() => {
    if (isToday) {
      return "Today";
    }
    
    return selectedDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, [selectedDate, isToday]);

  const formatApiDate = useCallback(() => {
    // Ensure consistent timezone handling by using local date components
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    goToDate,
    addDays,
    subtractDays,
    isToday,
    formatDisplayDate,
    formatApiDate
  };
}

// Additional utility functions for date operations
export const dateHelpers = {
  isValidDate: (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  },

  isToday: (date: Date): boolean => {
    if (!dateHelpers.isValidDate(date)) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  },

  isSameDate: (date1: Date, date2: Date): boolean => {
    if (!dateHelpers.isValidDate(date1) || !dateHelpers.isValidDate(date2)) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  },

  formatDisplayDate: (date: Date): string => {
    if (!dateHelpers.isValidDate(date)) return "Invalid Date";
    
    if (dateHelpers.isToday(date)) {
      return "Today";
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  },

  formatApiDate: (date: Date): string => {
    if (!dateHelpers.isValidDate(date)) return "";
    // Ensure consistent timezone handling by using local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  addDays: (date: Date, days: number): Date => {
    if (!dateHelpers.isValidDate(date)) return new Date();
    if (!Number.isInteger(days)) return date;
    
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  },

  subtractDays: (date: Date, days: number): Date => {
    if (!dateHelpers.isValidDate(date)) return new Date();
    if (!Number.isInteger(days)) return date;
    
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    newDate.setDate(newDate.getDate() - days);
    return newDate;
  },

  getStartOfDay: (date: Date): Date => {
    if (!dateHelpers.isValidDate(date)) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  },

  getEndOfDay: (date: Date): Date => {
    if (!dateHelpers.isValidDate(date)) return new Date();
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  },

  getStartOfWeek: (date: Date, startOnMonday: boolean = false): Date => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = startOnMonday ? (day === 0 ? 6 : day - 1) : day;
    newDate.setDate(newDate.getDate() - diff);
    return dateHelpers.getStartOfDay(newDate);
  },

  getEndOfWeek: (date: Date, startOnMonday: boolean = false): Date => {
    const startOfWeek = dateHelpers.getStartOfWeek(date, startOnMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return dateHelpers.getEndOfDay(endOfWeek);
  },

  getStartOfMonth: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setDate(1);
    return dateHelpers.getStartOfDay(newDate);
  },

  getEndOfMonth: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(0);
    return dateHelpers.getEndOfDay(newDate);
  },

  getDaysBetween: (startDate: Date, endDate: Date): number => {
    if (!dateHelpers.isValidDate(startDate) || !dateHelpers.isValidDate(endDate)) return 0;
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
  },

  isWeekend: (date: Date): boolean => {
    if (!dateHelpers.isValidDate(date)) return false;
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  getWeekday: (date: Date): string => {
    if (!dateHelpers.isValidDate(date)) return "";
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  },

  getMonth: (date: Date): string => {
    if (!dateHelpers.isValidDate(date)) return "";
    return date.toLocaleDateString('en-US', { month: 'short' });
  },

  getYear: (date: Date): number => {
    if (!dateHelpers.isValidDate(date)) return new Date().getFullYear();
    return date.getFullYear();
  }
};
