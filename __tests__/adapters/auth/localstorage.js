import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/auth/localstorage.js';

describe('LocalStorage Auth Adapter', () => {
  let core;

  beforeAll(() => createInstance().then(c => (core = c)));
  afterAll(() => core.destroy());

  test('#login', () => {
    const a = adapter(core);
    const values = {
      foo: 'bar'
    };

    return expect(a.login(values))
      .resolves
      .toBe(values);
  });
});
