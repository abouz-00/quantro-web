"use client";

import React, { useState, useCallback, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/react-calendar.css";
import { HiChevronLeft, HiChevronRight, HiCalendar, HiX } from "react-icons/hi";
import { dateHelpers } from "../../hooks/useDateManager";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DatePickerComponentProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export default function DatePickerComponent({ 
  selectedDate, 
  onDateChange, 
  className = ""
}: DatePickerComponentProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Handle client-side mounting to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add escape key handler and body scroll lock
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCalendarOpen) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCalendarOpen]);

  // Helper function to format date display
  const formatDateDisplay = useCallback((date: Date) => {
    return dateHelpers.formatDisplayDate(date);
  }, []);

  const handleDateChange = useCallback((value: Value) => {
    if (value && !Array.isArray(value)) {
      // Normalize date to remove time component
      const normalizedDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
      onDateChange(normalizedDate);
      setIsCalendarOpen(false);
    }
  }, [onDateChange]);

  const handleCalendarToggle = useCallback(() => {
    setIsCalendarOpen(prev => !prev);
  }, []);

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    onDateChange(normalizedToday);
  }, [onDateChange]);

  const handlePreviousDay = useCallback(() => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  }, [selectedDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  }, [selectedDate, onDateChange]);

  // Fallback if not mounted
  if (!isMounted) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="w-64 h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center space-x-4 ${className}`}>
        {/* Previous Day Button */}
        <button
          onClick={handlePreviousDay}
          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group cursor-pointer"
          aria-label="Previous day"
          style={{ cursor: 'pointer' }}
        >
          <HiChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </button>
        
        {/* Date Display with Calendar */}
        <div 
          className="flex items-center space-x-2" 
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <HiCalendar 
            className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-700 transition-all duration-200" 
            onClick={handleCalendarToggle}
            title="Open calendar"
            style={{ cursor: 'pointer' }}
          />
          <button
            type="button"
            className="border-none bg-transparent text-xl font-bold text-center cursor-pointer text-gray-800 px-0 hover:text-gray-700 transition-all duration-200 select-none rounded-md hover:bg-gray-100"
            style={{ 
              minWidth: '200px', 
              cursor: 'pointer !important',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              padding: '4px 8px',
              pointerEvents: 'auto',
              outline: 'none',
              border: 'none'
            }}
            onClick={handleCalendarToggle}
            onDoubleClick={handleGoToToday}
            title={formatDateDisplay(selectedDate) === "Today" ? "Click to open calendar • Double-click to confirm today" : "Click to open calendar • Double-click to go to today"}
          >
            {formatDateDisplay(selectedDate)}
          </button>
        </div>

        {/* Next Day Button */}
        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group cursor-pointer"
          aria-label="Next day"
          style={{ cursor: 'pointer' }}
        >
          <HiChevronRight className="h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </button>
      </div>

      {/* Modal Calendar Overlay */}
      {isCalendarOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCalendarOpen(false);
            }
          }}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Calendar */}
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="en-US"
              calendarType="gregory"
              showNeighboringMonth={true}
              showNavigation={true}
              prev2Label={null}
              next2Label={null}
              prevLabel={<HiChevronLeft className="w-4 h-4" />}
              nextLabel={<HiChevronRight className="w-4 h-4" />}
              minDate={new Date(2021, 0, 1)}
              maxDate={new Date(2040, 11, 31)}
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  const isSelected = dateHelpers.isSameDate(date, selectedDate);
                  const isToday = dateHelpers.isToday(date);
                  
                  if (isSelected && isToday) {
                    return 'selected-today';
                  } else if (isSelected) {
                    return 'selected-day';
                  } else if (isToday) {
                    return 'today-only';
                  }
                }
                return null;
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
