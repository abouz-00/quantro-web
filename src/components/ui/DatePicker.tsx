"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/react-calendar.css";
import { HiChevronLeft, HiChevronRight, HiCalendar } from "react-icons/hi";
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const savedOverflow = useRef<string>("");

  const closeCalendar = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsCalendarOpen(false);
      setIsAnimatingOut(false);
    }, 150);
  }, []);

  // Escape key handler + body scroll lock with proper cleanup on unmount
  useEffect(() => {
    if (!isCalendarOpen) return;

    savedOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCalendar();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = savedOverflow.current;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCalendarOpen, closeCalendar]);

  const formatDateDisplay = useCallback(
    (date: Date) => dateHelpers.formatDisplayDate(date),
    []
  );

  const handleDateChange = useCallback(
    (value: Value) => {
      if (value && !Array.isArray(value)) {
        const d = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        onDateChange(d);
        closeCalendar();
      }
    },
    [onDateChange, closeCalendar]
  );

  const openCalendar = useCallback(() => setIsCalendarOpen(true), []);

  const handleGoToToday = useCallback(() => {
    const t = new Date();
    onDateChange(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
    closeCalendar();
  }, [onDateChange, closeCalendar]);

  const handlePreviousDay = useCallback(() => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  }, [selectedDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  }, [selectedDate, onDateChange]);

  return (
    <>
      <div className={`flex items-center space-x-4 ${className}`}>
        {/* Previous Day */}
        <button
          onClick={handlePreviousDay}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
          aria-label="Previous day"
        >
          <HiChevronLeft className="h-6 w-6 text-gray-600" />
        </button>

        {/* Date Display */}
        <button
          type="button"
          className="flex items-center space-x-2 select-none cursor-pointer bg-transparent border-none outline-none rounded-md px-2 py-1 hover:bg-gray-100 transition-colors duration-200"
          onClick={openCalendar}
          title="Open calendar"
        >
          <HiCalendar className="h-5 w-5 text-gray-500" />
          <span className="text-xl font-bold text-gray-800 min-w-[180px] text-center">
            {formatDateDisplay(selectedDate)}
          </span>
        </button>

        {/* Next Day */}
        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
          aria-label="Next day"
        >
          <HiChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-150 ${
            isAnimatingOut ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCalendar();
          }}
        >
          <div
            className={`relative transition-all duration-150 ${
              isAnimatingOut
                ? "opacity-0 scale-95"
                : "opacity-100 scale-100"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
              background: '#ffffff',
              maxWidth: '340px',
            }}
          >
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="en-US"
              calendarType="gregory"
              showNeighboringMonth={true}
              showFixedNumberOfWeeks={true}
              showNavigation={true}
              minDetail="decade"
              prev2Label={null}
              next2Label={null}
              prevLabel={<HiChevronLeft className="w-4 h-4" />}
              nextLabel={<HiChevronRight className="w-4 h-4" />}
              minDate={new Date(2021, 0, 1)}
              maxDate={new Date(2040, 11, 31)}
            />

            {/* Today Button */}
            <div style={{ padding: '0 16px 16px 16px' }}>
              <button
                type="button"
                onClick={handleGoToToday}
                className="w-full py-2.5 text-sm font-semibold rounded-xl transition-colors duration-150 cursor-pointer border-none outline-none"
                style={{
                  backgroundColor: 'rgba(110, 68, 255, 0.08)',
                  color: '#6e44ff',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 68, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 68, 255, 0.08)'}
              >
                Go to Today
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
