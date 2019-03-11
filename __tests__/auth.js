import {createInstance} from 'osjs';
import Auth from '../src/auth.js';

// TODO: UI

let core;
let auth;

beforeAll(() => createInstance().then(c => core = c));
afterAll(() => core.destroy());

it('Should create a new instance', () => {
  auth = new Auth(core);
});

it('Should initialize', () => {
  return expect(auth.init())
    .resolves
    .toBe(true);
});

it('Should log in', () => {
  const cb = jest.fn(() => {});
  auth.show(cb);

  return auth.login({
    username: 'demo',
    password: 'demo'
  })
    .then(result => {
      expect(cb).toBeCalled();
      expect(result).toBe(true);
    });
});

it('Should log out', () => {
  return expect(auth.logout())
    .resolves
    .toBe(true);
});

it('Should destroy instance', () => {
  auth.destroy();
});
