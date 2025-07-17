# Date Functionality Integration Guide

This document outlines the implementation of a comprehensive date management system for the food logging application using `react-calendar`.

## Overview

The date functionality has been modularized into separate, reusable components and hooks to improve maintainability, reusability, and consistency across the application.

## Components and Files

### 1. DatePicker Component (`src/components/ui/DatePicker.tsx`)

A comprehensive, reusable date picker component that wraps `react-calendar` with custom styling and functionality.

**Features:**
- Navigation buttons (previous/next day)
- Calendar icon toggle
- Custom date formatting
- Double-click to go to today
- Keyboard navigation support
- Modal calendar popup
- Custom vertical calendar layout

**Props:**
```typescript
interface DatePickerComponentProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}
```

**Usage:**
```tsx
import DatePickerComponent from "../ui/DatePicker";

<DatePickerComponent
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  className="custom-styles"
/>
```

### 2. Date Manager Hook (`src/hooks/useDateManager.ts`)

A powerful custom hook that provides comprehensive date management functionality with optional localStorage persistence.

**Features:**
- Date state management
- Navigation functions (next, previous, today)
- Date arithmetic (add/subtract days)
- Formatting utilities
- LocalStorage persistence
- Callback integration

**Parameters:**
```typescript
interface UseDateManagerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  enableLocalStorage?: boolean;
  storageKey?: string;
}
```

**Returns:**
```typescript
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
```

**Usage:**
```tsx
import { useDateManager } from "../../hooks/useDateManager";

const {
  selectedDate,
  setSelectedDate,
  formatApiDate,
  goToToday,
  goToPreviousDay,
  goToNextDay
} = useDateManager({
  enableLocalStorage: true,
  storageKey: 'foodLogSelectedDate'
});
```

### 3. Custom CSS Styles (`src/styles/react-calendar.css`)

Comprehensive styling for the react-calendar component that matches the application's design system.

**Features:**
- Custom theme integration with purple header
- Hover states and transitions
- Vertical calendar layout (more tall than wide)
- Modern design with rounded corners and shadows
- Proper day grid layout
- Working navigation arrows

**Usage:**
```tsx
import "../../styles/react-calendar.css";
```

## Integration in LogPage

The LogPage component has been refactored to use the new date management system:

### Before:
```tsx
// Multiple useState hooks for date management
const [selectedDate, setSelectedDate] = useState<Date>(new Date());
const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

// Multiple callback functions for date operations
const handleDateChange = useCallback((date: Date | null) => { ... });
const handleCalendarToggle = useCallback(() => { ... });
const handleGoToToday = useCallback(() => { ... });
const handlePreviousDay = useCallback(() => { ... });
const handleNextDay = useCallback(() => { ... });

// Large DatePicker component inline
<DatePicker
  selected={selectedDate}
  onChange={handleDateChange}
  // ... many props
/>
```

### After:
```tsx
// Single hook for all date functionality
const {
  selectedDate,
  setSelectedDate,
  formatApiDate,
  goToToday,
  goToPreviousDay,
  goToNextDay
} = useDateManager({
  enableLocalStorage: true,
  storageKey: 'foodLogSelectedDate'
});

// Simple component usage
<DatePickerComponent
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  className=""
/>
```

## Benefits

### 1. **Modularity**
- Date functionality is separated into reusable components
- Easy to maintain and update
- Can be used across different pages

### 2. **Consistency**
- Unified date formatting across the application
- Consistent styling and behavior
- Standardized keyboard shortcuts

### 3. **Performance**
- Reduced code duplication
- Optimized re-renders with proper memoization
- Efficient state management

### 4. **User Experience**
- Persistent date selection with localStorage
- Intuitive keyboard navigation
- Smooth animations and transitions
- Mobile-responsive design

### 5. **Developer Experience**
- Type-safe interfaces
- Comprehensive utility functions
- Easy to test and debug
- Clear separation of concerns

## Available Utility Functions

The `dateHelpers` object provides additional utility functions:

```typescript
import { dateHelpers } from "../../hooks/useDateManager";

// Check if a date is today
dateHelpers.isToday(date);

// Compare two dates
dateHelpers.isSameDate(date1, date2);

// Format dates
dateHelpers.formatDisplayDate(date);
dateHelpers.formatApiDate(date);

// Date arithmetic
dateHelpers.addDays(date, 5);
dateHelpers.subtractDays(date, 3);

// Date ranges
dateHelpers.getStartOfWeek(date);
dateHelpers.getEndOfMonth(date);

// Date information
dateHelpers.isWeekend(date);
dateHelpers.getWeekday(date);
dateHelpers.getDaysBetween(startDate, endDate);
```

## Keyboard Shortcuts

The date functionality supports the following keyboard shortcuts:

- **Ctrl/Cmd + Left Arrow**: Previous day
- **Ctrl/Cmd + Right Arrow**: Next day
- **Ctrl/Cmd + T**: Go to today
- **Escape**: Close calendar (when open)

## Future Enhancements

### Potential Improvements:
1. **Date Range Selection**: Add support for selecting date ranges
2. **Quick Date Jumps**: Add preset buttons (yesterday, last week, last month)
3. **Custom Date Formats**: Allow customizable date display formats
4. **Internationalization**: Add support for different locales
5. **Date Validation**: Add min/max date constraints
6. **Weekly/Monthly Views**: Add alternative calendar views
7. **Time Selection**: Add time picker functionality when needed

### Usage in Other Components:
The date functionality can be easily integrated into other parts of the application:

```tsx
// Dashboard component
const Dashboard = () => {
  const { selectedDate, formatDisplayDate } = useDateManager();
  return <h1>Dashboard for {formatDisplayDate()}</h1>;
};

// Reports component
const Reports = () => {
  const { selectedDate, goToPreviousDay, goToNextDay } = useDateManager({
    enableLocalStorage: true,
    storageKey: 'reportsDate'
  });
  
  return (
    <div>
      <DatePickerComponent
        selectedDate={selectedDate}
        onDateChange={() => {}} // Custom handler
      />
    </div>
  );
};
```

## Migration Guide

If you have existing components using date functionality, follow these steps:

1. **Install the hook**: Import `useDateManager` from the hooks directory
2. **Replace state**: Replace individual date states with the hook
3. **Update handlers**: Use the hook's built-in navigation functions
4. **Replace components**: Swap custom date pickers with `DatePickerComponent`
5. **Import styles**: Add the custom CSS import
6. **Test functionality**: Verify all date operations work correctly

This modular approach ensures that date functionality is consistent, maintainable, and easily extensible throughout the application.
