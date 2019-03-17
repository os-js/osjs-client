import {createInstance} from 'osjs';
import Session from '../src/session.js';

let core;
let session;

beforeAll(() => {
  return createInstance()
    .then(c => {
      core = c;
      session = new Session(core);

      return core.run('ValidApplication');
    });
});

afterAll(() => core.destroy());

// TODO: Launch an actual application
it('should save', () => {
  return expect(session.save())
    .resolves
    .toEqual(true);
});

it('should load', () => {
  return expect(session.load())
    .resolves
    .toEqual(true);
});

it('should load fresh', () => {
  return expect(session.load(true))
    .resolves
    .toEqual(true);
});
