import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/auth/server.js';
let core;

beforeAll(() => createInstance().then(c => (core = c)));
afterAll(() => core.destroy());

it('Should log in with input values', () => {
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

it('Should log out', () => {
  const a = adapter(core);

  return expect(a.logout())
    .resolves
    .toBe(true);
});
