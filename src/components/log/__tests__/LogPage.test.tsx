// Mock fetch globally before any imports
// global.fetch is already mocked in jest.setup.ts

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock @dnd-kit/sortable to avoid ResizeObserver issues
jest.doMock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
}));

// Mock @dnd-kit/utilities to avoid ResizeObserver issues
jest.doMock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
  rectIntersection: jest.fn(),
  rectSortingStrategy: jest.fn(),
}));

// Mock Chart.js directly in this test file
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
  ChartJS: {
    register: jest.fn(),
  },
}));

// Mock useClipboard hook
jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: jest.fn(() => ({
    clipboardEntries: [],
    showCopyToast: false,
    copyEntries: jest.fn(),
    pasteEntries: jest.fn(),
  })),
}));

// Mock useGoals hook
jest.mock('../../../hooks/useGoals', () => ({
  useGoals: jest.fn(() => ({
    goals: {},
    updateGoals: jest.fn(),
  })),
}));

// Mock useKeyboardShortcuts hook
jest.mock('../../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(() => ({
    handleKeyDown: jest.fn(),
  })),
}));

// Mock useContextMenu hook
jest.mock('../../../hooks/useContextMenu', () => ({
  useContextMenu: jest.fn(() => ({
    contextMenu: null,
    handleContextMenu: jest.fn(),
    closeContextMenu: jest.fn(),
  })),
}));

// Mock useDragContainment hook
jest.mock('../../../hooks/useDragContainment', () => ({
  useDragContainment: jest.fn(() => ({
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
  })),
}));

// Mock useDateManager hook
jest.mock('../../../hooks/useDateManager', () => ({
  useDateManager: jest.fn(() => ({
    selectedDate: new Date('2023-06-15'),
    setSelectedDate: jest.fn(),
    formatApiDate: () => '2023-06-15',
    goToPreviousDay: jest.fn(),
    goToNextDay: jest.fn(),
    goToToday: jest.fn(),
  })),
}));

// Mock useFoodData hook to avoid network calls
jest.mock('../../../hooks/useFoodData', () => ({
  useFoodData: jest.fn(() => ({
    foodData: [],
    selectedEntries: [],
    setSelectedEntries: jest.fn(),
    filteredEntries: [],
    displayTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    addFoodEntry: jest.fn(),
    removeFoodEntry: jest.fn(),
    updateFoodEntry: jest.fn(),
    handleReorderEntries: jest.fn(),
    handleEntrySelect: jest.fn(),
  })),
}));

// Mock FoodLogService to avoid network calls
jest.mock('../../../services/foodLogService', () => ({
  FoodLogService: {
    loadFoodData: jest.fn(() => Promise.resolve([])),
    addFoodEntry: jest.fn(() => Promise.resolve({})),
    removeFoodEntry: jest.fn(() => Promise.resolve(true)),
    updateFoodEntry: jest.fn(() => Promise.resolve(true)),
  },
}));

// Override the ChartJS import to make sure register is available
const mockChartJS = {
  register: jest.fn(),
};

// Mock the chart.js module before any imports
jest.doMock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
  ChartJS: mockChartJS,
  register: jest.fn(),
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn().mockReturnValue(null),
  Bar: jest.fn().mockReturnValue(null),
  Doughnut: jest.fn().mockReturnValue(null),
  Pie: jest.fn().mockReturnValue(null),
}));

// Mock all child components to prevent rendering issues
jest.mock('../Header', () => ({
  Header: ({ setIsTargetsModalOpen, setIsMainMenuOpen, isMainMenuOpen, ...props }: { setIsTargetsModalOpen: (open: boolean) => void; setIsMainMenuOpen: (open: boolean) => void; isMainMenuOpen: boolean; [key: string]: unknown }) => (
    <div data-testid="header" {...props}>
      <button onClick={() => setIsTargetsModalOpen(true)} data-testid="targets-button">Targets</button>
      <button onClick={() => setIsMainMenuOpen(!isMainMenuOpen)} data-testid="menu-button">Menu</button>
    </div>
  ),
}));

jest.mock('../DateNavigation', () => ({
  DateNavigation: ({ ...props }: { [key: string]: unknown }) => (
    <div data-testid="date-navigation" {...props}>June 15, 2023</div>
  ),
}));

jest.mock('../ActionButtons', () => ({
  ActionButtons: ({ onAddFood, ...props }: { onAddFood: () => void; [key: string]: unknown }) => (
    <div data-testid="action-buttons" {...props}>
      <button onClick={onAddFood}>Add Food</button>
    </div>
  ),
}));

jest.mock('../ContextMenu', () => ({
  ContextMenu: ({ ...props }: { [key: string]: unknown }) => (
    <div data-testid="context-menu" {...props}>ContextMenu</div>
  ),
}));

jest.mock('../CopyToast', () => ({
  CopyToast: ({ show, ...props }: { show: boolean; [key: string]: unknown }) => 
    show ? <div data-testid="copy-toast" {...props}>CopyToast</div> : null,
}));

// Mock FoodLogTable to avoid @dnd-kit issues
jest.mock('../../food-log', () => ({
  FoodLogTable: ({ 'data-testid': testId, ...props }: React.PropsWithChildren<{ 'data-testid'?: string }>) => (
    <div data-testid={testId || 'food-log-table'} {...props}>FoodLogTable</div>
  ),
}));

// Mock food-log components
jest.mock('../../food-log', () => ({
  FoodLogTable: ({ ...props }: { [key: string]: unknown }) => (
    <div data-testid="food-log-table" {...props}>FoodLogTable</div>
  ),
}));

// Mock food-log core components
jest.mock('../../food-log/core', () => ({
  EnergySummary: ({ ...props }: { [key: string]: unknown }) => (
    <div data-testid="energy-summary" {...props}>EnergySummary</div>
  ),
  MicronutrientsSection: ({ ...props }: { [key: string]: unknown }) => (
    <div data-testid="micronutrients-section" {...props}>MicronutrientsSection</div>
  ),
}));

// Mock food-log modals
jest.mock('../../food-log/modals', () => ({
  EditFoodModal: () => null,
  TargetsModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="targets-modal">
        Targets Modal
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock food-log search
jest.mock('../../food-log/search', () => ({
  FoodSearchModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="food-search-modal">
      Food Search Modal
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import LogPage from '../LogPage';

describe('LogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<LogPage />);
    }).not.toThrow();
  });

  it('renders main page structure', () => {
    render(<LogPage />);

    // Check that the main page structure is rendered
    const mainContainer = document.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveStyle({ backgroundColor: 'rgb(245, 240, 231)' });
  });

  it('renders essential components', () => {
    render(<LogPage />);

    // Check for header element
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    
    // Check for logo in header
    const logo = screen.getByAltText('Quantro Logo');
    expect(logo).toBeInTheDocument();
    
    // Check for date navigation elements
    const previousButton = screen.getByLabelText('Previous day');
    expect(previousButton).toBeInTheDocument();
    
    // Check for calendar icon
    const calendarIcon = screen.getByTitle('Open calendar');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('has interactive elements', () => {
    render(<LogPage />);
    
    // Check that navigation buttons exist and are clickable
    const previousButton = screen.getByLabelText('Previous day');
    expect(previousButton).toBeInTheDocument();
    
    fireEvent.click(previousButton);
    // The click should not throw an error
    expect(previousButton).toBeInTheDocument();
  });

  it('renders the page layout correctly', () => {
    render(<LogPage />);
    
    // Check for main content structure
    const contentArea = document.querySelector('.flex.rounded-t-3xl');
    expect(contentArea).toBeInTheDocument();
    
    // Check for container
    const container = document.querySelector('.container.mx-auto');
    expect(container).toBeInTheDocument();
  });

  it('does not render copy toast by default', () => {
    render(<LogPage />);

    expect(screen.queryByTestId('copy-toast')).not.toBeInTheDocument();
  });
});
