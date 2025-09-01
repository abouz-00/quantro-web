import { renderHook, act, fireEvent } from '@testing-library/react';
import { useContextMenu } from '../useContextMenu';

describe('useContextMenu Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useContextMenu());
    
    expect(result.current.contextMenu.visible).toBe(false);
    expect(result.current.contextMenu.x).toBe(0);
    expect(result.current.contextMenu.y).toBe(0);
    expect(result.current.contextMenu.targetEntryId).toBe(null);
    expect(typeof result.current.handleContextMenu).toBe('function');
    expect(typeof result.current.closeContextMenu).toBe('function');
  });

  it('has required methods', () => {
    const { result } = renderHook(() => useContextMenu());
    
    expect(result.current.handleContextMenu).toBeDefined();
    expect(result.current.closeContextMenu).toBeDefined();
  });

  it('handles context menu event', () => {
    const { result } = renderHook(() => useContextMenu());
    
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleContextMenu(mockEvent, 'test-entry');
    });
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.contextMenu.visible).toBe(true);
    expect(result.current.contextMenu.x).toBe(100);
    expect(result.current.contextMenu.y).toBe(200);
    expect(result.current.contextMenu.targetEntryId).toBe('test-entry');
  });

  it('ignores rapid successive context menu events', () => {
    const { result } = renderHook(() => useContextMenu());
    
    const mockEvent1 = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;
    
    const mockEvent2 = {
      preventDefault: jest.fn(),
      clientX: 150,
      clientY: 250,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleContextMenu(mockEvent1, 'test-entry');
    });
    
    // Rapid second call
    act(() => {
      result.current.handleContextMenu(mockEvent2, 'test-entry-2');
    });
    
    // Should still have first values
    expect(result.current.contextMenu.x).toBe(100);
    expect(result.current.contextMenu.targetEntryId).toBe('test-entry');
  });

  it('closes context menu', () => {
    const { result } = renderHook(() => useContextMenu());
    
    // First open it
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleContextMenu(mockEvent, 'test-entry');
    });
    
    expect(result.current.contextMenu.visible).toBe(true);
    
    // Wait for the rapid action protection to expire
    jest.advanceTimersByTime(60);
    
    // Then close it
    act(() => {
      result.current.closeContextMenu();
    });
    
    expect(result.current.contextMenu.visible).toBe(false);
  });

  it('ignores rapid close context menu', () => {
    const { result } = renderHook(() => useContextMenu());
    
    // Open it
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleContextMenu(mockEvent, 'test-entry');
    });
    
    // Rapid close
    act(() => {
      result.current.closeContextMenu();
    });
    
    expect(result.current.contextMenu.visible).toBe(true); // Should not close
  });

  it('closes context menu on outside click', () => {
    const { result } = renderHook(() => useContextMenu());
    
    // Open it
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleContextMenu(mockEvent, 'test-entry');
    });
    
    expect(result.current.contextMenu.visible).toBe(true);
    
    // Wait for the rapid action protection to expire
    jest.advanceTimersByTime(60);
    
    // Simulate outside click
    act(() => {
      fireEvent.click(document);
    });
    
    // Wait for timeout
    act(() => {
      jest.advanceTimersByTime(20);
    });
    
    expect(result.current.contextMenu.visible).toBe(false);
  });

  it('does not close on Ctrl+click', () => {
    const { result } = renderHook(() => useContextMenu());
    
    // Open it
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleContextMenu(mockEvent, 'test-entry');
    });
    
    expect(result.current.contextMenu.visible).toBe(true);
    
    // Simulate Ctrl+click
    const ctrlClickEvent = new MouseEvent('click', { ctrlKey: true, button: 0 });
    act(() => {
      document.dispatchEvent(ctrlClickEvent);
    });
    
    expect(result.current.contextMenu.visible).toBe(true); // Should not close
  });
});
