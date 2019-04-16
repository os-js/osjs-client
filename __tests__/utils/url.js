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

describe('Url Resolver Utils', () => {
  test('Should resolve paths correctly on root install', () => {
    const resolver = createResolver('/');
    expect(resolver('/')).toBe('/');
    expect(resolver('/foo')).toBe('/foo');
    expect(resolver('bar/baz')).toBe('/bar/baz');
  });

  test('Should resolve paths correctly on root install', () => {
    const resolver = createResolver('/proxy/path');
    expect(resolver('/')).toBe('/proxy/path/');
    expect(resolver('/foo')).toBe('/proxy/path/foo');
    expect(resolver('bar/baz')).toBe('/proxy/path/bar/baz');
  });

  test('Should default to public path', () => {
    const resolver = createResolver('/default');
    expect(resolver(null)).toBe('/default/');
  });

  test('Should return itself on absolute', () => {
    const resolver = createResolver('/');
    expect(resolver('https://os-js.org')).toBe('https://os-js.org');
  });

  test('Should resolve package urls', () => {
    const resolver = createResolver('/');
    expect(resolver('foo', {}, {name: 'Jest', type: 'application'})).toBe('/apps/Jest/foo');
    expect(resolver('foo', {}, {name: 'Jest', type: 'theme'})).toBe('/themes/Jest/foo');
    expect(resolver('foo', {}, {name: 'Jest', type: 'icons'})).toBe('/icons/Jest/foo');
  });
});
