// Example: Simple Date Selection Component
// This demonstrates how to use the new date functionality in a standalone component

"use client";

import React from 'react';
import DatePickerComponent from '../src/components/ui/DatePicker';
import { useDateManager, dateHelpers } from '../src/hooks/useDateManager';

export default function ExampleDateComponent() {
  // Use the date manager hook with localStorage persistence
  const {
    selectedDate,
    setSelectedDate,
    goToToday,
    isToday,
    formatDisplayDate,
    formatApiDate
  } = useDateManager({
    enableLocalStorage: true,
    storageKey: 'exampleComponentDate',
    onDateChange: (date) => {
      console.log('Date changed to:', date);
      // You can trigger API calls or other side effects here
    }
  });

  // Example of using date helper functions
  const dateInfo = {
    isToday: isToday,
    isWeekend: dateHelpers.isWeekend(selectedDate),
    weekday: dateHelpers.getWeekday(selectedDate),
    month: dateHelpers.getMonth(selectedDate),
    year: dateHelpers.getYear(selectedDate),
    startOfWeek: dateHelpers.getStartOfWeek(selectedDate),
    endOfWeek: dateHelpers.getEndOfWeek(selectedDate),
    daysFromToday: dateHelpers.getDaysBetween(new Date(), selectedDate)
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Date Selection Example</h2>
      
      {/* Date Picker Component */}
      <div className="mb-6">
        <DatePickerComponent
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          className="justify-center"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isToday}
        >
          Go to Today
        </button>
      </div>

      {/* Date Information Display */}
      <div className="space-y-2 text-sm">
        <div><strong>Display:</strong> {formatDisplayDate()}</div>
        <div><strong>API Format:</strong> {formatApiDate()}</div>
        <div><strong>Is Today:</strong> {dateInfo.isToday ? 'Yes' : 'No'}</div>
        <div><strong>Is Weekend:</strong> {dateInfo.isWeekend ? 'Yes' : 'No'}</div>
        <div><strong>Weekday:</strong> {dateInfo.weekday}</div>
        <div><strong>Month:</strong> {dateInfo.month}</div>
        <div><strong>Year:</strong> {dateInfo.year}</div>
        <div><strong>Days from today:</strong> {dateInfo.daysFromToday}</div>
      </div>

      {/* Date Range Example */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="font-semibold mb-2">Current Week:</h3>
        <div className="text-sm text-gray-600">
          {dateHelpers.formatDisplayDate(dateInfo.startOfWeek)} - {dateHelpers.formatDisplayDate(dateInfo.endOfWeek)}
        </div>
      </div>
    </div>
  );
}

// Example: Custom Hook for Specific Use Case
export function useFoodLogDate() {
  const dateManager = useDateManager({
    enableLocalStorage: true,
    storageKey: 'foodLogSelectedDate'
  });

  // Custom logic specific to food logging
  const loadFoodDataForDate = async (date: Date) => {
    try {
      const apiDate = dateHelpers.formatApiDate(date);
      const response = await fetch(`/api/food-logs?date=${apiDate}`);
      return response.json();
    } catch (error) {
      console.error('Failed to load food data:', error);
      return [];
    }
  };

  return {
    ...dateManager,
    loadFoodDataForDate
  };
}

// Example: Date Range Selector Component
export function DateRangeExample() {
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Date>(new Date());

  const daysBetween = dateHelpers.getDaysBetween(startDate, endDate);

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Date Range Selection</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date:</label>
          <DatePickerComponent
            selectedDate={startDate}
            onDateChange={setStartDate}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">End Date:</label>
          <DatePickerComponent
            selectedDate={endDate}
            onDateChange={setEndDate}
          />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <strong>Range:</strong> {daysBetween} day{daysBetween !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
