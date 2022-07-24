import * as fetch from '../../src/utils/fetch';

describe('utils.fetch#encodeQueryData', () => {
  test('should create valid query string', () => {
    const result1 = fetch.encodeQueryData({
      a: 1,
      b: true,
      c: null,
      d: 'foo',
      e: undefined
    });

    const result2 = fetch.encodeQueryData({
      a: 1,
      b: {
        c: {
          d: 'foo'
        }
      }
    });

    expect(result1).toEqual('a=1&b=true&c=null&d=foo&e=undefined');
    expect(result2).toEqual('a=1&b=%7B%22c%22%3A%7B%22d%22%3A%22foo%22%7D%7D');
  });
});
