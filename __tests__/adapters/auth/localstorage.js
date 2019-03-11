import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/auth/localstorage.js';
let core;

beforeAll(() => createInstance().then(c => (core = c)));
afterAll(() => core.destroy());

it('Should log in with input values', () => {
  const a = adapter(core);
  const values = {
    foo: 'bar'
  };

  return expect(a.login(values))
    .resolves
    .toBe(values);
});
