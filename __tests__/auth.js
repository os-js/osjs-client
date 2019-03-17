import {createInstance} from 'osjs';
import Core from '../src/core.js';
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

it('Should try to reload on shutdown', () => {
  const a = new Auth(core);
  a.shutdown(true);
});

it('Should try to auto login', () => {
  const c = new Core({
    auth: {
      username: 'test',
      password: 'test'
    }
  });

  const a = new Auth(c);
  return expect(a.show())
    .resolves
    .toBe(true);
});

it('Should trigger login from UI', () => {
  const c = new Core();
  const a = new Auth(c);
  const fn = jest.fn();

  c.on('osjs/core:logged-in', fn);

  a.ui.emit('login:post', {
    username: 'test',
    password: 'test'
  });

  setTimeout(() => expect(fn).toBeCalled(), 25);
});

it('Should trigger failure', () => {
  const c = new Core();
  const a = new Auth(c, {
    adapter: () => ({
      login: () => Promise.reject('Simulated failure'),
      logout: () => Promise.resolve(null)
    })
  });

  const fnError = jest.fn();
  const fnStop = jest.fn();

  a.ui.on('login:error', fnError);
  a.ui.on('login:stop', fnStop);

  return a.login()
    .then(() => a.logout())
    .then(() => {
      expect(fnError).toBeCalled();
      expect(fnStop).toBeCalled();
    });
});
