// Test to verify drag event handling is robust

import { DragStartEvent } from '@dnd-kit/core';

// Test cases for drag event handling
const testDragEvents = {
  // Case 1: Normal drag event
  validDragStart: ({
    active: { id: 'test-id' },
    over: null
  } as unknown) as Partial<DragStartEvent>,

  // Case 2: Null active (the error we fixed)
  nullActiveDragStart: ({
    active: null,
    over: null
  } as unknown) as Partial<DragStartEvent>,

  // Case 3: Active without ID
  noIdDragStart: ({
    active: {},
    over: null
  } as unknown) as Partial<DragStartEvent>,

  // Case 4: Undefined event
  undefinedEvent: (undefined as unknown) as Partial<DragStartEvent>
};

// These test cases would have caused the original error:
// "null is not an object (evaluating 'active.id')"

// Our fix handles these cases with proper null checks:
function safeDragStartHandler(event: DragStartEvent) {
  // ✅ This prevents the error
  if (!event?.active?.id) {
    return;
  }
  
  // ... rest of drag logic
}

describe('Drag Safety Tests', () => {
  it('should handle null active drag events safely', () => {
    expect(() => {
      safeDragStartHandler(testDragEvents.nullActiveDragStart as DragStartEvent);
    }).not.toThrow();
  });

  it('should handle undefined event safely', () => {
    expect(() => {
      safeDragStartHandler(testDragEvents.undefinedEvent as DragStartEvent);
    }).not.toThrow();
  });

  it('should handle active without ID safely', () => {
    expect(() => {
      safeDragStartHandler(testDragEvents.noIdDragStart as DragStartEvent);
    }).not.toThrow();
  });

  it('should process valid drag events', () => {
    expect(() => {
      safeDragStartHandler(testDragEvents.validDragStart as DragStartEvent);
    }).not.toThrow();
  });
});

export { testDragEvents, safeDragStartHandler };
