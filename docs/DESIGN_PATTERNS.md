# 🎨 Design Patterns & Principles

## 📋 Overview

Quantro follows established design patterns and architectural principles to ensure maintainable, scalable, and testable code. This document outlines the key patterns implemented throughout the application.

## 🏗️ Architectural Patterns

### **1. Component-Based Architecture**

**Pattern**: Decompose the UI into small, reusable, and composable components.

**Implementation**:

```tsx
// Domain-specific component organization
src/components/food-log/
├── core/           # Business logic components
├── charts/         # Visualization components  
├── search/         # Search functionality
├── table/          # Data table components
└── hooks/          # Custom business logic hooks
```

**Benefits**:

- Single Responsibility Principle
- High reusability across pages
- Easy testing and debugging
- Clear separation of concerns

### **2. Custom Hook Pattern**

**Pattern**: Extract stateful logic into reusable custom hooks.

**Implementation**:

```tsx
// useFoodData.ts - Encapsulates food data management
export const useFoodData = () => {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  const addFoodEntry = async (entry: FoodEntry) => {
    // Business logic here
  };
  
  return { foodEntries, selectedEntries, addFoodEntry };
};
```

**Benefits**:

- Logic reuse across components
- Easier unit testing
- Separation of concerns
- Better code organization

### **3. Service Layer Pattern**

**Pattern**: Centralize API calls and data operations in service modules.

**Implementation**:

```tsx
// foodLogService.ts
export class FoodLogService {
  static async getAllEntries(date: string): Promise<FoodEntry[]> {
    // API call with error handling and caching
  }
  
  static async createEntry(entry: FoodEntry): Promise<FoodEntry> {
    // Create operation with validation
  }
}
```

**Benefits**:

- Centralized data access logic
- Consistent error handling
- Easy to mock for testing
- API abstraction layer

## 🧩 Component Design Patterns

### **1. Compound Components Pattern**

**Pattern**: Create flexible, composable components that work together.

**Implementation**:

```tsx
// Food table with multiple sub-components
<FoodTable>
  <FoodTable.Header />
  <FoodTable.Body entries={entries} />
  <FoodTable.Row entry={entry} />
</FoodTable>
```

**Benefits**:

- Flexible composition
- Clear component relationships
- Reduced prop drilling

### **2. Container/Presentational Pattern**

**Pattern**: Separate data logic from presentation logic.

**Implementation**:

```tsx
// Container Component (LogPage.tsx)
const LogPage = () => {
  const { foodEntries, addEntry } = useFoodData();
  
  return <FoodTablePresentation entries={foodEntries} onAdd={addEntry} />;
};

// Presentational Component (FoodTable.tsx)
const FoodTablePresentation = ({ entries, onAdd }) => {
  return <table>...</table>;
};
```

**Benefits**:

- Clear separation of concerns
- Easier testing of UI logic
- Better reusability

### **3. Higher-Order Component Pattern**

**Pattern**: Wrap components with additional functionality.

**Implementation**:

```tsx
// ErrorBoundary.tsx - HOC for error handling
export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Error boundary logic
  return <div>{children}</div>;
}

// Usage in layout
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Benefits**:

- Cross-cutting concerns
- Reusable error handling
- Clean component APIs

## 🔄 State Management Patterns

### **1. Local State Pattern**

**When to use**: Component-specific state that doesn't need sharing.

**Implementation**:

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingEntry, setEditingEntry] = useState<string | null>(null);
```

### **2. Lifted State Pattern**

**When to use**: State shared between sibling components.

**Implementation**:

```tsx
// Parent component manages shared state
const LogPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  return (
    <>
      <DatePicker date={selectedDate} onChange={setSelectedDate} />
      <FoodTable date={selectedDate} />
    </>
  );
};
```

### **3. Context Pattern**

**When to use**: Global application state (authentication, themes).

**Implementation**:

```tsx
// SessionWrapper.tsx
const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};
```

## 🎯 Data Flow Patterns

### **1. Unidirectional Data Flow**

**Pattern**: Data flows down, events flow up.

**Implementation**:

```tsx
// Data flows down through props
<FoodTable 
  entries={foodEntries}          // Data down
  onEntryUpdate={handleUpdate}   // Events up
  onEntryDelete={handleDelete}   // Events up
/>
```

### **2. Event Delegation Pattern**

**Pattern**: Handle events at a higher level to reduce event listeners.

**Implementation**:

```tsx
// Table handles all row events
const FoodTable = ({ entries, onRowAction }) => {
  const handleTableClick = (event) => {
    const action = event.target.dataset.action;
    const entryId = event.target.closest('[data-entry-id]').dataset.entryId;
    onRowAction(action, entryId);
  };
  
  return <table onClick={handleTableClick}>...</table>;
};
```

## 🔧 Utility Patterns

### **1. Factory Pattern**

**Pattern**: Create objects through factory functions.

**Implementation**:

```tsx
// dateUtils.ts
export const createFoodEntry = (
  foodName: string, 
  nutrients: Nutrients
): FoodEntry => {
  return {
    id: generateId(),
    foodName,
    amount: 100,
    unit: 'g',
    date: new Date().toISOString(),
    ...nutrients,
    createdAt: new Date(),
  };
};
```

### **2. Builder Pattern**

**Pattern**: Build complex objects step by step.

**Implementation**:

```tsx
// Query builder for USDA API
class USDAQueryBuilder {
  private query: string = '';
  
  search(term: string) {
    this.query += `query=${encodeURIComponent(term)}`;
    return this;
  }
  
  pageSize(size: number) {
    this.query += `&pageSize=${size}`;
    return this;
  }
  
  build() {
    return this.query;
  }
}

// Usage
const query = new USDAQueryBuilder()
  .search('apple')
  .pageSize(10)
  .build();
```

### **3. Observer Pattern**

**Pattern**: React's built-in observer pattern with useEffect.

**Implementation**:

```tsx
// Watch for date changes and update food entries
useEffect(() => {
  const loadFoodEntries = async () => {
    const entries = await foodLogService.getEntriesForDate(selectedDate);
    setFoodEntries(entries);
  };
  
  loadFoodEntries();
}, [selectedDate]); // Observer: watches selectedDate
```

## 🎨 UI Patterns

### **1. Render Props Pattern**

**Pattern**: Share code between components using props with function values.

**Implementation**:

```tsx
// Flexible data provider
const DataProvider = ({ render, endpoint }) => {
  const [data, loading, error] = useAPI(endpoint);
  
  return render({ data, loading, error });
};

// Usage
<DataProvider 
  endpoint="/api/food-entries"
  render={({ data, loading }) => 
    loading ? <Spinner /> : <FoodTable entries={data} />
  }
/>
```

### **2. Controlled Components Pattern**

**Pattern**: Form inputs controlled by React state.

**Implementation**:

```tsx
const FoodSearchModal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
```

### **3. Portal Pattern**

**Pattern**: Render components outside the normal component tree.

**Implementation**:

```tsx
// Modal portal
const Modal = ({ children, isOpen }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="modal-backdrop">
      <div className="modal">
        {children}
      </div>
    </div>,
    document.body
  );
};
```

## 🔒 Error Handling Patterns

### **1. Error Boundary Pattern**

**Pattern**: Catch JavaScript errors anywhere in the component tree.

**Implementation**:

```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### **2. Try-Catch with Async/Await Pattern**

**Pattern**: Handle async errors gracefully.

**Implementation**:

```tsx
const useFoodData = () => {
  const [error, setError] = useState(null);
  
  const addFoodEntry = async (entry: FoodEntry) => {
    try {
      setError(null);
      const result = await foodLogService.createEntry(entry);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  return { addFoodEntry, error };
};
```

## 🎯 Performance Patterns

### **1. Memoization Pattern**

**Pattern**: Cache expensive calculations and prevent unnecessary re-renders.

**Implementation**:

```tsx
// React.memo for component memoization
const FoodTableRow = React.memo(({ entry, onUpdate }) => {
  return <tr>...</tr>;
});

// useMemo for expensive calculations
const totalCalories = useMemo(() => {
  return foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
}, [foodEntries]);

// useCallback for function memoization
const handleEntryUpdate = useCallback((id: string, data: Partial<FoodEntry>) => {
  setFoodEntries(entries => 
    entries.map(entry => 
      entry.id === id ? { ...entry, ...data } : entry
    )
  );
}, []);
```

### **2. Lazy Loading Pattern**

**Pattern**: Load components only when needed.

**Implementation**:

```tsx
// Dynamic imports for code splitting
const FoodSearchModal = lazy(() => import('./FoodSearchModal'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <FoodSearchModal />
</Suspense>
```

### **3. Debounce Pattern**

**Pattern**: Delay execution of functions to improve performance.

**Implementation**:

```tsx
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage in search
const searchTerm = useDebounce(inputValue, 300);
```

## 📚 Testing Patterns

### **1. Arrange-Act-Assert Pattern**

**Pattern**: Structure tests with clear phases.

**Implementation**:

```tsx
test('should add food entry when form is submitted', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<FoodForm onSubmit={mockSubmit} />);
  
  // Act
  await user.type(screen.getByLabelText(/food name/i), 'Apple');
  await user.click(screen.getByRole('button', { name: /add/i }));
  
  // Assert
  expect(mockSubmit).toHaveBeenCalledWith({
    foodName: 'Apple',
    // ... other properties
  });
});
```

### **2. Test Doubles Pattern**

**Pattern**: Use mocks, stubs, and spies for isolated testing.

**Implementation**:

```tsx
// Mock external dependencies
jest.mock('../services/foodLogService', () => ({
  FoodLogService: {
    getAllEntries: jest.fn().mockResolvedValue([]),
    createEntry: jest.fn().mockResolvedValue({ id: '1' }),
  },
}));
```

## 🎨 Styling Patterns

### **1. Utility-First CSS Pattern**

**Pattern**: Use Tailwind CSS utility classes for styling.

**Implementation**:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">Food Entries</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Add Food
  </button>
</div>
```

### **2. CSS-in-JS Pattern**

**Pattern**: Co-locate styles with components when needed.

**Implementation**:

```tsx
// styles.ts
export const tableStyles = {
  container: 'w-full overflow-hidden rounded-lg border border-gray-200',
  header: 'bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500',
  row: 'hover:bg-gray-50 transition-colors duration-150',
};
```

## 🚀 Deployment Patterns

### **1. Environment Configuration Pattern**

**Pattern**: Use environment variables for configuration.

**Implementation**:

```tsx
// Environment-specific configuration
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
};
```

### **2. Feature Flag Pattern**

**Pattern**: Control feature rollout with flags.

**Implementation**:

```tsx
const FEATURE_FLAGS = {
  enableAdvancedCharts: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_CHARTS === 'true',
  enableBetaFeatures: process.env.NODE_ENV === 'development',
};

// Usage
{FEATURE_FLAGS.enableAdvancedCharts && <AdvancedCharts />}
```

---

## 📊 Pattern Selection Guidelines

### **When to Use Each Pattern:**

- **Custom Hooks**: When you have stateful logic that's used in multiple components
- **Service Layer**: For all external API calls and data operations
- **Context**: For truly global state (auth, theme, language)
- **Compound Components**: When building flexible, reusable UI components
- **Memoization**: When you have expensive calculations or frequent re-renders
- **Error Boundaries**: At the application and feature level for graceful error handling

### **Anti-Patterns to Avoid:**

- **Prop Drilling**: Pass data through many component levels - use Context instead
- **Massive Components**: Break large components into smaller, focused ones
- **Direct DOM Manipulation**: Use React's declarative approach instead
- **Inline Styles**: Use Tailwind classes or CSS modules for maintainability
- **God Objects**: Keep services and utilities focused on single responsibilities

This pattern library ensures consistent, maintainable code across the Quantro application while following React and Next.js best practices.
