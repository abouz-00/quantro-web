import * as hooks from '../index';

describe('hooks/index', () => {
  it('exports all hooks', () => {
    expect(hooks.useClipboard).toBeDefined();
    expect(hooks.useContextMenu).toBeDefined();
    expect(hooks.useCustomFoods).toBeDefined();
    expect(hooks.useDateManager).toBeDefined();
    expect(hooks.useDragContainment).toBeDefined();
    expect(hooks.useFoodData).toBeDefined();
    expect(hooks.useGoals).toBeDefined();
    expect(hooks.useKeyboardShortcuts).toBeDefined();
    expect(hooks.useErrorReporting).toBeDefined();
  });
});
