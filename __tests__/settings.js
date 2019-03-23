import {createInstance} from 'osjs';
import Settings from '../src/settings.js';

describe('Settings', () => {
  let core;
  let settings;

  beforeAll(() => {
    return createInstance()
      .then(c => {
        core = c;
        settings = new Settings(core, {});
      });
  });

  afterAll(() => core.destroy());

  test('#init', () => {
    return expect(settings.init())
      .resolves
      .toBe(true);
  });

  test('#load', () => {
    return expect(settings.load())
      .resolves
      .toBe(true);
  });

  test('#set', () => {
    expect(() => settings.set('osjs/locked', 'foo', 'Hello World'))
      .not
      .toThrow();

    expect(() => settings.set('osjs/jest', 'foo', 'Hello World'))
      .not
      .toThrow();
  });

  test('#get', () => {
    expect(settings.get('osjs/jest', 'foo')).toBe('Hello World');
    expect(settings.get('osjs/jest', 'bar')).toBe(undefined);
    expect(settings.get('osjs/jest', 'baz', 'default')).toBe('default');
    expect(settings.get()).toEqual({
      'osjs/desktop': {},
      'osjs/locale': {},
      'osjs/session': [],
      'osjs/jest': {
        foo: 'Hello World'
      }
    });
  });

  test('#save', () => {
    return expect(settings.save())
      .resolves
      .toBe(true);
  });

  test('#clear', () => {
    return settings.clear('osjs/jest')
      .then(result => {
        expect(result).toBe(true);
        expect(settings.get('osjs/jest', 'foo')).toBe(undefined);
      });
  });
});
