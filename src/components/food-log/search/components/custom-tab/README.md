# Custom Tab Modular Structure

This directory contains the modularized components for the Custom Tab functionality in the food log search feature. The refactoring improves maintainability, reusability, and code organization.

## Directory Structure

```
custom-tab/
├── index.ts                     # Main exports
├── types.ts                     # Type definitions
├── CustomFoodForm.tsx           # Form for creating custom foods
├── CustomFoodList.tsx           # List component for displaying custom foods
├── ErrorDisplay.tsx             # Error message component
├── States.tsx                   # Loading and empty state components
└── hooks/
    ├── useCustomFoodValidation.ts  # Validation logic hook
    └── useKeyboardNavigation.ts    # Keyboard navigation hook
```

## Components

### Core Components

#### `CustomFoodForm`
- **Purpose**: Handles the creation of new custom foods
- **Props**: Form data, change handlers, submit handler, loading state
- **Features**: Input validation, keyboard support, loading states

#### `CustomFoodList`
- **Purpose**: Displays list of existing custom foods with interaction capabilities
- **Props**: Custom foods array, selection handler, loading state
- **Features**: Keyboard navigation, mouse interactions, accessibility support

#### `ErrorDisplay`
- **Purpose**: Shows error messages in a consistent format
- **Props**: Error message string
- **Features**: Conditional rendering, styled error display

#### `States` (LoadingState & EmptyState)
- **Purpose**: Handles different UI states (loading, empty)
- **Features**: Loading spinners, empty state messaging

### Hooks

#### `useCustomFoodValidation`
- **Purpose**: Provides validation logic for custom food inputs
- **Returns**: Validation functions and error state management
- **Features**: Field-specific validation, error clearing, validation state

#### `useKeyboardNavigation`
- **Purpose**: Handles keyboard navigation for food lists
- **Parameters**: Items array, selection callback, disabled state
- **Returns**: Navigation state and event handlers
- **Features**: Arrow key navigation, Enter key selection, scroll into view

## Type Definitions

### `CustomFood`
- `id`: Unique identifier
- `name`: Food name
- `calories`: Calories per 100g
- `protein`: Protein content in grams
- `carbs`: Carbohydrates content in grams
- `fat`: Fat content in grams

### `ValidationError`
- `field`: Field name that has the error
- `message`: Error message to display

### `CustomFoodFormData`
- Form-specific structure matching the input fields
- All string values for form handling

## Usage

The main `CustomTab` component now acts as a coordinator, handling:
- Data flow between parent and child components
- Form data transformation
- State management coordination

```tsx
import { 
  CustomFoodForm,
  CustomFoodList,
  ErrorDisplay,
  LoadingState,
  EmptyState
} from './custom-tab';

// Use individual components as needed
```

## Benefits of Modularization

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Testability**: Smaller components are easier to unit test
4. **Maintainability**: Changes to one feature don't affect others
5. **Type Safety**: Strong typing throughout the module structure
6. **Accessibility**: Proper ARIA attributes and keyboard navigation
7. **Performance**: Better tree shaking and code splitting opportunities

## Migration Notes

The refactoring maintains the exact same API for the parent `CustomTab` component, ensuring no breaking changes to the consuming code. All functionality including validation, keyboard navigation, and loading states has been preserved and enhanced.
