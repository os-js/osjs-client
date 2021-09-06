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
      a: {
        a: 1,
        b: true,
        c: null,
        d: 'foo',
        e: undefined
      },
      b: {
        c: {
          d: 'foo'
        }
      }
    });

    expect(result1).toEqual('a.i=1&b.b=true&c.n=null&d.s=foo&e.u=undefined');
    expect(result2).toEqual('a.a.i=1&a.b.b=true&a.c.n=null&a.d.s=foo&a.e.u=undefined&b.c.d.s=foo');
  });
});