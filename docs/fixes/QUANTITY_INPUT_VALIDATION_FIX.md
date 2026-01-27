# Quantity Input Validation Fix

## Problem

In the "Add Food" modal (search and favorites tabs), users could type non-numerical characters in the quantity input field, such as:

- Special characters: `-`, `=`, `[`, `]`, etc.
- Letters: `a`, `b`, `c`, etc.
- Symbols: `!`, `@`, `#`, etc.

This could lead to invalid input and potential errors when calculating nutrition values.

## Solution

Added comprehensive input validation to the quantity field with three layers of protection:

### 1. `onKeyDown` Event Handler

Prevents non-numeric characters from being typed:

**Allowed Keys:**

- Numbers: `0-9`
- Decimal point: `.`
- Navigation: `Backspace`, `Delete`, `ArrowLeft`, `ArrowRight`, `Tab`
- Keyboard shortcuts: `Cmd/Ctrl+A`, `Cmd/Ctrl+C`, `Cmd/Ctrl+V`, `Cmd/Ctrl+X`
- Submit: `Enter` (to add food)

**Blocked Keys:**

- Special characters: `-`, `=`, `[`, `]`, `(`, `)`, etc.
- Letters: `a-z`, `A-Z`
- Symbols: `!`, `@`, `#`, `$`, `%`, etc.

### 2. `onPaste` Event Handler

Prevents pasting non-numeric content:

- Validates clipboard text with regex: `/^[0-9.]*$/`
- Only allows numbers and decimal points
- Blocks pasting text like "abc", "123abc", "test", etc.

### 3. HTML Attributes

- `type="number"` - Native browser validation
- `min="0"` - Prevents negative numbers
- `step="any"` - Allows decimal values

## Code Changes

### File: `src/components/food-log/search/components/FoodSelectionSection.tsx`

**Before:**

```tsx
<input
  type="number"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  onKeyDown={handleKeyDown}
  className="w-full p-2 border border-gray-300 rounded-sm"
/>
```

**After:**

```tsx
<input
  type="number"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  onKeyDown={(e) => {
    // Prevent non-numeric characters except decimal point, backspace, delete, arrow keys, tab
    if (
      !/[0-9.]/.test(e.key) && 
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
      !(e.key === 'a' && (e.metaKey || e.ctrlKey)) && // Allow Cmd/Ctrl+A
      !(e.key === 'c' && (e.metaKey || e.ctrlKey)) && // Allow Cmd/Ctrl+C
      !(e.key === 'v' && (e.metaKey || e.ctrlKey)) && // Allow Cmd/Ctrl+V
      !(e.key === 'x' && (e.metaKey || e.ctrlKey))    // Allow Cmd/Ctrl+X
    ) {
      e.preventDefault();
    }
    // Call original handleKeyDown for Enter key functionality
    if (e.key === 'Enter') {
      handleKeyDown(e);
    }
  }}
  onPaste={(e) => {
    // Prevent pasting non-numeric content
    const pastedText = e.clipboardData.getData('text');
    if (!/^[0-9.]*$/.test(pastedText)) {
      e.preventDefault();
    }
  }}
  min="0"
  step="any"
  className="w-full p-2 border border-gray-300 rounded-sm"
/>
```

## User Experience

### What Works Now ✅

- Type numbers: `1`, `2`, `3`, etc.
- Type decimal: `1.5`, `2.75`, `100.25`
- Use backspace/delete to edit
- Use arrow keys to navigate
- Copy/paste valid numbers
- Select all (Cmd/Ctrl+A)
- Press Enter to submit

### What's Blocked ❌

- Type letters: `a`, `b`, `c`
- Type special chars: `-`, `=`, `[`, `]`
- Type symbols: `!`, `@`, `#`
- Paste text: `"abc"`, `"test123"`
- Paste invalid formats: `"12-34"`, `"100g"`

## Testing

### Test Cases

1. **Valid Input**
   - Type: `100` → ✅ Accepts
   - Type: `1.5` → ✅ Accepts
   - Type: `0.25` → ✅ Accepts

2. **Invalid Characters**
   - Type: `-` → ❌ Blocked
   - Type: `=` → ❌ Blocked
   - Type: `a` → ❌ Blocked

3. **Paste Test**
   - Paste: `"200"` → ✅ Accepts
   - Paste: `"abc"` → ❌ Blocked
   - Paste: `"12-34"` → ❌ Blocked

4. **Navigation**
   - Backspace → ✅ Works
   - Delete → ✅ Works
   - Arrow keys → ✅ Works
   - Cmd/Ctrl+A → ✅ Works

5. **Enter Key**
   - Press Enter → ✅ Submits form (adds food)

## Browser Compatibility

Works in all modern browsers:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Notes

- The quantity field appears in both **Search** and **Favorites** tabs
- Same component (`FoodSelectionSection`) is used in both tabs
- The `CustomTab` has its own quantity input which may need similar treatment (not updated in this fix)

## Related Files

- `src/components/food-log/search/components/FoodSelectionSection.tsx` - Updated component
- `src/components/food-log/search/FoodSearchModal.tsx` - Parent modal component

## Date

October 9, 2025
