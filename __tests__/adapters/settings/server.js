import {createInstance} from 'osjs';
import adapter from '../../../src/adapters/settings/server.js';
let core;

beforeAll(() => createInstance().then(c => (core = c)));
afterAll(() => core.destroy());

it('Should save settings', () => {
  const settings = adapter(core);

  return expect(settings.save({}))
    .resolves
    .toBe(true);
});

it('Should load settings', () => {
  const settings = adapter(core);

  return expect(settings.load())
    .resolves
    .toEqual({
      foo: 'bar'
    });
});
