import React from 'react';
import DatePickerComponent from '../ui/DatePicker';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange
}) => {
  return (
    <div className="flex justify-center py-4">
      <div 
        className="flex items-center space-x-2 rounded-full shadow-lg px-3 py-2" 
        style={{ backgroundColor: '#F8F5F0', border: '1px solid #EDE6DC' }}
      >
        <DatePickerComponent
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          className=""
        />
      </div>
    </div>
  );
};
