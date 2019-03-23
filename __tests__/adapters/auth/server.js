import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/auth/server.js';

describe('Server Auth Adapter', () => {
  let core;

  beforeAll(() => createInstance().then(c => (core = c)));
  afterAll(() => core.destroy());

  test('#login', () => {
    const a = adapter(core);
    const values = {
      username: 'jest'
    };

    return expect(a.login(values))
      .resolves
      .toEqual({
        username: 'jest',
        groups: [],
        id: 0
      });
  });

  test('#logout', () => {
    const a = adapter(core);

    return expect(a.logout())
      .resolves
      .toBe(true);
  });
});
