import { renderHook } from '@testing-library/react';
import { useContextMenu } from '../useContextMenu';

describe('useContextMenu Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
