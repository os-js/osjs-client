import logger from '../src/logger.js';

describe('Logger', () => {
  test('should log to console', () => {
    console.log = jest.fn();

    logger.clearMiddleware(); // NOTE: Needed to "re initialize"
    logger.log('console');
    expect(console.log).toHaveBeenNthCalledWith(1, 'console');
  });

  test('should use middleware', () => {
    const now = Date.now();

    console.log = jest.fn();
    logger.addMiddleware((m, ...args) => [now, ...args]);
    logger.log('middleware 1');
    expect(console.log).toHaveBeenCalledWith(now, 'middleware 1');

    console.log = jest.fn();
    logger.addMiddleware((m, ...args) => [...args, 'foo']);
    logger.log('middleware 2');
    expect(console.log).toHaveBeenCalledWith(now, 'middleware 2', 'foo');

    logger.clearMiddleware();
  });
});

