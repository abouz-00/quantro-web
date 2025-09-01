import * as logComponents from '../index';

describe('components/log/index', () => {
  it('exports all log components', () => {
    expect(logComponents.Header).toBeDefined();
    expect(logComponents.DateNavigation).toBeDefined();
    expect(logComponents.ActionButtons).toBeDefined();
    expect(logComponents.ContextMenu).toBeDefined();
    expect(logComponents.CopyToast).toBeDefined();
    expect(logComponents.LogPage).toBeDefined();
  });
});
