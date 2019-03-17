import {createInstance} from 'osjs';
import Application from '../src/application.js';
import Window from '../src/window.js';
import Websocket from '../src/websocket.js';

let core;
let application;

beforeAll(() => createInstance().then(c => core = c));
afterAll(() => core.destroy());

it('Should create a new instance', () => {
  application = new Application(core, {
    args: {
      foo: 'bar'
    },
    options: {
      restore: {
        windows: [{
          id: 'RestoredWindow',
          position: {
            top: 100,
            left: 100
          },
          dimension: {
            width: 800,
            height: 600
          }
        }]
      }
    },
    metadata: {
      name: 'Jest',
      type: 'application'
    }
  });
});

it('Should get resource URI', () => {
  expect(application.resource('foo')).toBe('/apps/Jest/foo');
});

it('Should create windows', () => {
  const fn = jest.fn(() => {});

  application.on('create-window', fn);

  expect(application.createWindow({
    id: 'UniqueWindow'
  }))
    .toBeInstanceOf(Window);

  expect(application.createWindow())
    .toBeInstanceOf(Window);

  expect(application.windows.length).toBe(2);
  expect(fn).toBeCalled();
});

it('Should create windows w/restore data', () => {
  const win = application.createWindow({
    id: 'RestoredWindow'
  });

  expect(win).toBeInstanceOf(Window);
  expect(win.state.dimension).toEqual({width: 800, height: 600});
  expect(win.state.position).toEqual({top: 100, left: 100});
  win.destroy();
});

it('Should not create another window with same ID', () => {
  return expect(() => application.createWindow({
    id: 'UniqueWindow'
  }))
    .toThrow(Error);
});

it('Should remove window', () => {
  const fn = jest.fn(() => {});

  application.on('destroy-window', fn);
  application.removeWindow((win, index) => index > 0);

  expect(application.windows.length).toBe(1);
  expect(fn).toBeCalled();
});

it('Should perform request', () => {
  return expect(application.request('/test'))
    .resolves
    .toBe(true);
});

it('Should create a new Worker', () => {
  const w = application.worker('/worker.js');

  expect(w).toBeInstanceOf(Worker);
  expect(application.workers.length).toBe(1);
});

it('Should create a new Websocket', () => {
  const w = application.socket('/worker.js');

  expect(w).toBeInstanceOf(Websocket);
  expect(application.sockets.length).toBe(1);
});

it('Should get Session', () => {
  expect(application.getSession()).toMatchObject({
    name: 'Jest',
    args: {
      foo: 'bar'
    },
    windows: [{
      id: 'UniqueWindow'
    }]
  });
});

it('Should get Application list', () => {
  expect(Application.getApplications().length)
    .toBe(1);

  expect(Application.getApplications()[0])
    .toBeInstanceOf(Application);
});

it('Should destroy instance', () => {
  const onLocalDestroy = jest.fn(() => {});
  const onGlobalDestroy = jest.fn(() => {});

  application.on('destroy', onLocalDestroy);
  core.on('osjs/application:destroy', onGlobalDestroy);

  application.destroy();
  expect(onLocalDestroy).toBeCalled();
  expect(onGlobalDestroy).toBeCalled();
  expect(application.workers.length).toBe(0);
  expect(application.sockets.length).toBe(0);
  expect(application.windows.length).toBe(0);
});

it('Should not destroy destroy instance again', () => {
  const onLocalDestroy = jest.fn(() => {});
  application.on('destroy', onLocalDestroy);
  application.destroy();

  expect(onLocalDestroy).not.toBeCalled();
});

it('Should save settings', () => {
  expect(application.saveSettings())
    .resolves
    .toBe(true);
});

it('Should destroy all applications', () => {
  new Application(core, {
    args: {
      foo: 'bar'
    },
    options: {},
    metadata: {
      name: 'Jest',
      type: 'application'
    }
  });

  Application.destroyAll();

  expect(Application.getApplications().length)
    .toBe(0);
});
