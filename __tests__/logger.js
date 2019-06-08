import logger from '../src/logger.js';

describe('Logger', () => {
  const oldLog = console.log;

  beforeAll(() => {
    logger.setLogger(console);
  });

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = oldLog;
    logger.setLogger(console);
  });

  test('should log to console', () => {
    logger.log('console');
    expect(console.log).toHaveBeenNthCalledWith(1, 'console');
  });

  test('should use middleware', () => {
    const now = Date.now();
    logger.addMiddleware((...args) => [now, ...args]);
    logger.log('middleware 1');
    expect(console.log).toHaveBeenCalledWith(now, 'middleware 1');

    logger.addMiddleware((...args) => [...args, 'foo']);
    logger.log('middleware 2');
    expect(console.log).toHaveBeenCalledWith(now, 'middleware 2', 'foo');

    logger.clearMiddleware();
  });

  test('should log to void', () => {
    // eslint-disable-next-line no-undef
    logger.setLogger(new Proxy({}, {
      get: () => () => {}
    }));

    logger.log('void');

    expect(console.log).not.toHaveBeenCalled();
  });
});

