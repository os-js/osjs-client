import {createInstance} from 'osjs';
import Settings from '../src/settings.js';

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

it('Should init', () => {
  return expect(settings.init())
    .resolves
    .toBe(true);
});

it('Should load', () => {
  return expect(settings.load())
    .resolves
    .toBe(true);
});

it('Should set value', () => {
  return expect(() => settings.set('osjs/jest', 'foo', 'Hello World'))
    .not
    .toThrow();
});

it('Should get value', () => {
  expect(settings.get('osjs/jest', 'foo')).toBe('Hello World');
  expect(settings.get('osjs/jest', 'bar')).toBe(undefined);
  expect(settings.get('osjs/jest', 'baz', 'default')).toBe('default');
});

it('Should save', () => {
  return expect(settings.save())
    .resolves
    .toBe(true);
});

it('Should clear', () => {
  return settings.clear('osjs/jest')
    .then(result => {
      expect(result).toBe(true);
      expect(settings.get('osjs/jest', 'foo')).toBe(undefined);
    });
});
