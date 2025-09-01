import { renderHook } from '@testing-library/react';
import { useDragContainment } from '../useDragContainment';

// Mock HTMLElement methods
const mockGetBoundingClientRect = jest.fn();
const mockQuerySelector = jest.fn();
const mockContains = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// Mock document and window
Object.defineProperty(document, 'querySelector', {
  writable: true,
  value: mockQuerySelector,
});

Object.defineProperty(document, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(document, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

Object.defineProperty(document.body.style, 'cursor', {
  writable: true,
  value: '',
});

// Mock HTMLElement
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  writable: true,
  value: mockGetBoundingClientRect,
});

Object.defineProperty(HTMLElement.prototype, 'contains', {
  writable: true,
  value: mockContains,
});

describe('useDragContainment', () => {
  let mockFoodTableContainer: HTMLElement;
  let mockDragTarget: HTMLElement;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock elements
    mockFoodTableContainer = document.createElement('div');
    mockFoodTableContainer.className = 'food-table-container';

    mockDragTarget = document.createElement('div');
    mockDragTarget.className = 'food-item';

    // Setup default mock behaviors
    mockQuerySelector.mockReturnValue(mockFoodTableContainer);
    mockGetBoundingClientRect.mockReturnValue({
      left: 100,
      right: 500,
      top: 100,
      bottom: 400,
    });
    mockContains.mockReturnValue(true);
  });

  afterEach(() => {
    // Reset document.body.style.cursor
    document.body.style.cursor = '';
  });

  it('should add dragstart event listener on mount', () => {
    renderHook(() => useDragContainment());

    expect(mockAddEventListener).toHaveBeenCalledWith('dragstart', expect.any(Function));
  });

  it('should remove dragstart event listener on unmount', () => {
    const { unmount } = renderHook(() => useDragContainment());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('dragstart', expect.any(Function));
  });

  it('should allow drags that start outside food table container', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting outside food table
    mockContains.mockReturnValue(false);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Should not add dragover or drop listeners for external drags
    expect(mockAddEventListener).not.toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(mockAddEventListener).not.toHaveBeenCalledWith('drop', expect.any(Function));
  });

  it('should set up containment for drags starting inside food table', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting inside food table
    mockContains.mockReturnValue(true);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Should add dragover and drop listeners for internal drags
    expect(mockAddEventListener).toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('drop', expect.any(Function));
  });

  it('should prevent dragover events outside container boundaries', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting inside food table
    mockContains.mockReturnValue(true);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler to set up containment
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Find the dragover handler
    const dragOverHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragover'
    )[1];

    // Create dragover event outside boundaries
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragOverEvent, 'clientX', { value: 50 }); // Outside left boundary (100)
    Object.defineProperty(dragOverEvent, 'clientY', { value: 200 });

    dragOverEvent.preventDefault = jest.fn();
    dragOverEvent.stopPropagation = jest.fn();

    // Trigger dragover outside boundaries
    dragOverHandler(dragOverEvent);

    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    expect(dragOverEvent.stopPropagation).toHaveBeenCalled();
    expect(document.body.style.cursor).toBe('not-allowed');
  });

  it('should allow dragover events inside container boundaries', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting inside food table
    mockContains.mockReturnValue(true);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler to set up containment
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Find the dragover handler
    const dragOverHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragover'
    )[1];

    // Create dragover event inside boundaries
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      clientX: 300, // Inside boundaries (100-500)
      clientY: 200,
    });

    dragOverEvent.preventDefault = jest.fn();
    dragOverEvent.stopPropagation = jest.fn();

    // Trigger dragover inside boundaries
    dragOverHandler(dragOverEvent);

    expect(dragOverEvent.preventDefault).not.toHaveBeenCalled();
    expect(dragOverEvent.stopPropagation).not.toHaveBeenCalled();
    expect(document.body.style.cursor).toBe('');
  });

  it('should prevent drop events outside container boundaries', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting inside food table
    mockContains.mockReturnValue(true);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler to set up containment
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Find the drop handler
    const dropHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'drop'
    )[1];

    // Create drop event outside boundaries
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dropEvent, 'clientX', { value: 600 }); // Outside right boundary (500)
    Object.defineProperty(dropEvent, 'clientY', { value: 200 });

    dropEvent.preventDefault = jest.fn();
    dropEvent.stopPropagation = jest.fn();

    // Trigger drop outside boundaries
    dropHandler(dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(dropEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should allow drop events inside container boundaries', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting inside food table
    mockContains.mockReturnValue(true);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler to set up containment
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Find the drop handler
    const dropHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'drop'
    )[1];

    // Create drop event inside boundaries
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX: 300, // Inside boundaries (100-500)
      clientY: 200,
    });

    dropEvent.preventDefault = jest.fn();
    dropEvent.stopPropagation = jest.fn();

    // Trigger drop inside boundaries
    dropHandler(dropEvent);

    expect(dropEvent.preventDefault).not.toHaveBeenCalled();
    expect(dropEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners and cursor on drop', () => {
    renderHook(() => useDragContainment());

    // Mock drag starting inside food table
    mockContains.mockReturnValue(true);

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler to set up containment
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Find the drop handler
    const dropHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'drop'
    )[1];

    // Create drop event inside boundaries
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX: 300,
      clientY: 200,
    });

    // Trigger drop to test cleanup
    dropHandler(dropEvent);

    // Should remove the dragover and drop listeners
    expect(mockRemoveEventListener).toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('drop', expect.any(Function));
    expect(document.body.style.cursor).toBe('');
  });

  it('should handle missing food table container gracefully', () => {
    // Mock querySelector to return null
    mockQuerySelector.mockReturnValue(null);

    renderHook(() => useDragContainment());

    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dragStartEvent, 'target', { value: mockDragTarget });

    // Trigger the dragstart handler
    const dragStartHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'dragstart'
    )[1];
    dragStartHandler(dragStartEvent);

    // Should still add dragstart listener, but not add dragover or drop listeners when container is missing
    expect(mockAddEventListener).toHaveBeenCalledWith('dragstart', expect.any(Function));
    expect(mockAddEventListener).not.toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(mockAddEventListener).not.toHaveBeenCalledWith('drop', expect.any(Function));
  });
});
