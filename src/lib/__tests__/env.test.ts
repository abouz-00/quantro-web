import { serverEnv, clientEnv, isProduction, isDevelopment, isTest, checkProductionEnv } from '../env';

describe('env', () => {
  it('parses server environment variables into a typed object', () => {
    expect(serverEnv).toBeDefined();
    expect(typeof serverEnv.NODE_ENV).toBe('string');
  });

  it('parses client environment variables into a typed object', () => {
    expect(clientEnv).toBeDefined();
  });

  it('derives exactly one of isProduction/isDevelopment/isTest from NODE_ENV', () => {
    expect(isTest).toBe(true);
    expect(isProduction).toBe(false);
    expect(isDevelopment).toBe(false);
  });

  it('checkProductionEnv is a no-op outside of production', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    checkProductionEnv();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
