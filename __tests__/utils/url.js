import {urlResolver} from '../../src/utils/url';

const createResolver = pathname => {
  const href = 'http://localhost:8000' + pathname;
  const path = pathname.substr(-1) !== '/' ? pathname + '/' : pathname;
  const uri = href.replace(/[^/]*$/, '');

  return urlResolver({
    http: {
      public: path,
      uri
    },
    ws: {
      uri: uri.replace(/^http/, 'ws')
    }
  });
};

describe('utils#urlResolver', () => {
  it('Should resolve paths correctly on root install', () => {
    const resolver = createResolver('/');
    expect(resolver('/')).toBe('/');
    expect(resolver('/foo')).toBe('/foo');
    expect(resolver('bar/baz')).toBe('/bar/baz');
  });

  it('Should resolve paths correctly on root install', () => {
    const resolver = createResolver('/proxy/path');
    expect(resolver('/')).toBe('/proxy/path/');
    expect(resolver('/foo')).toBe('/proxy/path/foo');
    expect(resolver('bar/baz')).toBe('/proxy/path/bar/baz');
  });
});
