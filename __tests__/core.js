import {createInstance} from '../__mocks__/core.js';

let core;

beforeAll(() => {
  return createInstance()
    .then(c => (core = c));
});

afterAll(() => core.destroy());

it('Should create urls', () => {
  expect(core.url('foo/bar')).toBe('/foo/bar');
  expect(core.url('foo/bar', {prefix: true})).toBe('http://localhost/foo/bar');
  expect(core.url('foo/bar', {prefix: true, type: 'websocket'})).toBe('ws://localhost/foo/bar');
});

/*
it('Should not create request in standalone mode', () => {
  return expect(core.request('/foo'))
    .rejects
    .toThrow();
});
*/

it('Should fail to run unknown application', () => {
  return expect(() => core.run('UnknownApplication'))
    .toThrow();
});

it('Should run valid application', () => {
  return expect(() => core.run('ValidApplication'))
    .not
    .toThrow();
});

it('Should not try to open associated application', () => {
  return expect(core
    .open({
      mime: 'foo/bar'
    }))
    .resolves
    .toBe(false);
});

it('Should try to open associated application', () => {
  return expect(core
    .open({
      mime: 'valid/bazz'
    }))
    .resolves
    .toBe(true);
});

it('Should set request options', () => {
  core.setRequestOptions({
    foo: 'bar'
  });

  expect(core.requestOptions).toEqual({
    foo: 'bar'
  });
});

it('Should get user', () => {
  expect(core.getUser()).toEqual({
    id: null,
    username: 'osjs',
    groups: []
  });
});
