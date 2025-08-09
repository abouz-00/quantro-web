import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const mockShortcuts = {
    onAddFood: jest.fn(),
    onNextDay: jest.fn(),
    onPreviousDay: jest.fn(),
    onGoToToday: jest.fn(),
    onCopy: jest.fn(),
    onPaste: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add and remove event listeners', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts(mockShortcuts));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should trigger onAddFood on Ctrl+A', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onAddFood).toHaveBeenCalled();
  });

  it('should trigger onAddFood on Cmd+A (Mac)', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onAddFood).toHaveBeenCalled();
  });

  it('should trigger onNextDay on Ctrl+Right Arrow', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onNextDay).toHaveBeenCalled();
  });

  it('should trigger onPreviousDay on Ctrl+Left Arrow', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onPreviousDay).toHaveBeenCalled();
  });

  it('should trigger onGoToToday on Ctrl+T', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 't',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onGoToToday).toHaveBeenCalled();
  });

  it('should trigger onCopy on Ctrl+C', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onCopy).toHaveBeenCalled();
  });

  it('should trigger onPaste on Ctrl+V', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'v',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onPaste).toHaveBeenCalled();
  });

  it('should trigger onDelete on Delete key', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'Delete',
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onDelete).toHaveBeenCalled();
  });

  it('should handle missing optional shortcuts gracefully', () => {
    const partialShortcuts = {
      onAddFood: jest.fn(),
      onNextDay: jest.fn(),
      onPreviousDay: jest.fn(),
      onGoToToday: jest.fn(),
      // Missing optional shortcuts
    };

    renderHook(() => useKeyboardShortcuts(partialShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
    });

    // Should not throw error when optional shortcut is missing
    expect(() => window.dispatchEvent(event)).not.toThrow();
  });

  it('should not trigger shortcuts when target is input field', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    // Create a mock input element
    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    // Mock the event target
    Object.defineProperty(event, 'target', {
      value: input,
      enumerable: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onAddFood).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should not trigger shortcuts when target is textarea', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    Object.defineProperty(event, 'target', {
      value: textarea,
      enumerable: true,
    });

    window.dispatchEvent(event);

    expect(mockShortcuts.onAddFood).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('should prevent default behavior for handled shortcuts', () => {
    renderHook(() => useKeyboardShortcuts(mockShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should handle missing shortcuts gracefully', () => {
    const partialShortcuts = {
      onAddFood: jest.fn(),
      onNextDay: jest.fn(),
      onPreviousDay: jest.fn(),
      onGoToToday: jest.fn(),
      // Missing other shortcuts
    };

    renderHook(() => useKeyboardShortcuts(partialShortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'v',
      ctrlKey: true,
    });

    // Should not throw error when optional shortcut is missing
    expect(() => window.dispatchEvent(event)).not.toThrow();
  });
});
