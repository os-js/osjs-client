import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/settings/localstorage.js';
let core;

describe('LocalStorage Settings Adapter', () => {
  beforeAll(() => {
    localStorage.setItem('failure', '{failure}');

    createInstance().then(c => (core = c));
  });

  afterAll(() => {
    localStorage.clearItem('failure');
    core.destroy();
  });

  test('#save', () => {
    const settings = adapter(core);

    return expect(settings.save({
      foo: 'bar',
      jazz: 'bass'
    }))
      .resolves
      .toBe(true);
  });

  test('#load', () => {
    const settings = adapter(core);

    return expect(settings.load())
      .resolves
      .toEqual({
        foo: 'bar',
        jazz: 'bass',
        failure: '{failure}'
      });
  });

  test('#clear', () => {
    const settings = adapter(core);

    return settings.clear('foo')
      .then(() => {
        return expect(settings.load())
          .resolves
          .toEqual({
            jazz: 'bass',
            failure: '{failure}'
          });
      });
  });

  test('#clear - all', () => {
    const settings = adapter(core);

    return settings.clear()
      .then(() => {
        return expect(settings.load())
          .resolves
          .toEqual({});
      });
  });
});
