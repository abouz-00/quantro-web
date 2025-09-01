import * as services from '../index';

describe('services/index', () => {
  it('exports all services', () => {
    expect(services.FoodLogService).toBeDefined();
    expect(services.errorService).toBeDefined();
  });
});
