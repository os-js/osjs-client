import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/settings/server.js';

describe('Server Settings Adapter', () => {
  let core;

  beforeAll(() => createInstance().then(c => (core = c)));
  afterAll(() => core.destroy());

  test('#save', () => {
    const settings = adapter(core);

    return expect(settings.save({}))
      .resolves
      .toBe(true);
  });

  test('#load', () => {
    const settings = adapter(core);

    return expect(settings.load())
      .resolves
      .toEqual({
        foo: 'bar'
      });
  });
});
