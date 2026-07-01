import { logger } from '../logger';

describe('logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs info messages with the expected shape', () => {
    logger.info('something happened', { foo: 'bar' });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(logSpy.mock.calls[0][0]);
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('something happened');
    expect(entry.context).toEqual({ foo: 'bar' });
    expect(entry.timestamp).toEqual(expect.any(String));
  });

  it('logs warnings', () => {
    logger.warn('careful');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(entry.level).toBe('warn');
    expect(entry.message).toBe('careful');
  });

  it('serializes Error instances passed to error()', () => {
    logger.error('it broke', new Error('boom'));
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(entry.level).toBe('error');
    expect(entry.message).toBe('it broke');
    expect(entry.error).toEqual(
      expect.objectContaining({ name: 'Error', message: 'boom' })
    );
  });

  it('serializes non-Error values passed to error()', () => {
    logger.error('unexpected', 'plain string reason');
    const entry = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(entry.error).toEqual({ value: 'plain string reason' });
  });

  it('omits the error field entirely when none is provided', () => {
    logger.error('no cause here');
    const entry = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(entry.error).toBeUndefined();
  });
});
