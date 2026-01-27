# UI Components

This directory contains **generic, reusable UI components** that are completely independent of business logic.

## Philosophy: Dumb Components

Components in this directory should be "dumb" - they don't know anything about your application's specific features. They are pure presentation components that can be reused across different parts of the app.

## Current Components

### `Modal.tsx`

A generic modal shell component that provides:

- **Background overlay** with click-to-close functionality
- **Scroll locking** - prevents background from scrolling while modal is open
- **Keyboard accessibility** - ESC key to close
- **Flexible sizing** - configurable width, height, and max dimensions
- **Optional header** - with title and close button

#### Usage Example

```tsx
import { Modal } from '@/components/ui';

function MyFeatureModal({ isOpen, onClose }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="My Feature"
      maxWidth="600px"
    >
      <div className="p-4">
        {/* Your specific feature content goes here */}
      </div>
    </Modal>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `() => void` | required | Called when modal should close |
| `children` | `ReactNode` | required | Modal content |
| `title` | `string` | `undefined` | Optional header title |
| `showCloseButton` | `boolean` | `true` | Show X button in header |
| `maxWidth` | `string` | `"900px"` | Maximum modal width |
| `height` | `string` | `"600px"` | Modal height |
| `maxHeight` | `string` | `"90vh"` | Maximum modal height |

## Pattern: Generic Shell + Specific Implementation

Instead of creating monolithic modal components, we follow this pattern:

1. **Generic Shell** (`Modal.tsx`): Handles all the modal "chrome" - overlay, positioning, scroll locking, closing
2. **Specific Implementation** (e.g., `FoodSearchModal.tsx`): Uses the shell and fills it with feature-specific content

### Benefits

- **Reusability**: Need a confirmation dialog? Settings modal? Just reuse `Modal.tsx`
- **Separation of Concerns**: Modal behavior is isolated from feature logic
- **Easier Debugging**: If there's a scroll issue, you know it's in `Modal.tsx`
- **Consistency**: All modals behave the same way across the app
- **Maintainability**: Fix a bug once in `Modal.tsx`, all modals benefit

### Example: Before vs After

❌ **Before** (monolithic):

```tsx
// FoodSearchModal.tsx - knows about modal behavior AND food search logic
function FoodSearchModal() {
  // Modal overlay logic
  // Scroll locking logic
  // Close button logic
  // Food search logic
  // Tab switching logic
  // etc...
}
```

✅ **After** (separated):

```tsx
// ui/Modal.tsx - only knows about being a modal
function Modal({ isOpen, onClose, children }) {
  // Modal overlay logic
  // Scroll locking logic
  // Close button logic
  return <div>{children}</div>;
}

// food-log/search/FoodSearchModal.tsx - only knows about food search
function FoodSearchModal() {
  return (
    <Modal isOpen={true} onClose={handleClose}>
      {/* Food search logic */}
      {/* Tab switching logic */}
    </Modal>
  );
}
```

## Adding New UI Components

When adding a new component to this directory, ask yourself:

1. **Is it generic?** Can it be used in multiple places?
2. **Is it dumb?** Does it avoid business logic?
3. **Is it reusable?** Would other features benefit from it?

If yes to all three, it belongs here!

### Good Candidates for `ui/`

- Modal, Dialog, Drawer
- Button, Input, Select
- Card, Panel, Container
- Tooltip, Popover, Dropdown
- Spinner, Progress Bar
- Toast, Alert, Banner

### Bad Candidates for `ui/`

- FoodSearchModal (feature-specific)
- UserProfileCard (domain-specific)
- DashboardStats (business logic)
- LoginForm (feature-specific)

Those belong in feature directories like `components/food-log/`, `components/auth/`, etc.
