import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/settings/localstorage.js';
let core;

beforeAll(() => createInstance().then(c => (core = c)));
afterAll(() => core.destroy());

it('Should save settings', () => {
  const settings = adapter(core);

  return expect(settings.save({
    foo: 'bar',
    jazz: 'bass'
  }))
    .resolves
    .toBe(true);
});

it('Should load settings', () => {
  const settings = adapter(core);

  return expect(settings.load())
    .resolves
    .toEqual({
      foo: 'bar',
      jazz: 'bass'
    });
});

it('Should clear entry', () => {
  const settings = adapter(core);

  return settings.clear('foo')
    .then(() => {
      return expect(settings.load())
        .resolves
        .toEqual({
          jazz: 'bass'
        });
    });
});

it('Should clear settings', () => {
  const settings = adapter(core);

  return settings.clear()
    .then(() => {
      return expect(settings.load())
        .resolves
        .toEqual({});
    });
});
