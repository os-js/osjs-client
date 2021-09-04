import * as fetch from '../../src/utils/fetch';

describe('utils.fetch#encodeQueryData', () => {
  test('should create valid query string', () => {
    const result1 = fetch.encodeQueryData({
      a: 1,
      b: true,
      c: null,
      d: 'foo'
    });

    const result2 = fetch.encodeQueryData({
      a: {
        a: 1,
        b: true,
        c: null,
        d: 'foo'
      },
      b: {
        c: {
          d: 'foo'
        }
      }
    });

    expect(result1).toEqual('a=1&b=true&c=null&d=foo');
    expect(result2).toEqual('a.a=1&a.b=true&a.c=null&a.d=foo&b.c.d=foo');
  });
});