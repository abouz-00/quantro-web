import * as utils from '../index';

describe('utils/index', () => {
  it('exports all utils', () => {
    expect(utils.generateEntryId).toBeDefined();
    expect(utils.calculateTotals).toBeDefined();
  });
});
