import {createInstance} from 'osjs';
import Splash from '../src/splash.js';

describe('Splash', () => {
  let core;
  let splash;

  beforeAll(() => {
    return createInstance()
      .then(c => {
        core = c;
        splash = new Splash(core);
      });
  });

  afterAll(() => core.destroy());

  // TODO: Check DOM node
  // TODO: Check events ?

  test('#show', () => {
    splash.show();
  });

  test('#destroy', () => {
    splash.destroy();
  });
});
