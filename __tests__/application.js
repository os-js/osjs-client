import {createInstance} from 'osjs';
import Application from '../src/application.js';
import Window from '../src/window.js';
import Websocket from '../src/websocket.js';

describe('Application', () => {
  let core;
  let application;

  beforeAll(() => createInstance().then(c => core = c));
  afterAll(() => core.destroy());

  test('#constructor', () => {
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

  test('#resource', () => {
    expect(application.resource('foo')).toBe('/apps/Jest/foo');
  });

  test('#createWindow', () => {
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

  test('#createWindow - w/restore data', () => {
    const win = application.createWindow({
      id: 'RestoredWindow'
    });

    expect(win).toBeInstanceOf(Window);
    expect(win.state.dimension).toEqual({width: 800, height: 600});
    expect(win.state.position).toEqual({top: 100, left: 100});
    win.destroy();
  });

  test('#createWindow - error on duplicate id', () => {
    return expect(() => application.createWindow({
      id: 'UniqueWindow'
    }))
      .toThrow(Error);
  });

  test('#removeWindow', () => {
    const fn = jest.fn(() => {});

    application.on('destroy-window', fn);
    application.removeWindow((win, index) => index > 0);

    expect(application.windows.length).toBe(1);
    expect(fn).toBeCalled();
  });

  test('#request', () => {
    return expect(application.request('/test'))
      .resolves
      .toBe(true);
  });

  test('#worker', () => {
    const w = application.worker('/worker.js');

    expect(w).toBeInstanceOf(Worker);
    expect(application.workers.length).toBe(1);
  });

  test('#socket', () => {
    const w = application.socket('/worker.js');

    expect(w).toBeInstanceOf(Websocket);
    expect(application.sockets.length).toBe(1);
  });

  test('#getSession', () => {
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

  test('.getApplications', () => {
    expect(Application.getApplications().length)
      .toBe(1);

    expect(Application.getApplications()[0])
      .toBeInstanceOf(Application);
  });

  test('#destroy', () => {
    const onLocalDestroy = jest.fn(() => {});
    const onGlobalDestroy = jest.fn(() => {});

    application.on('destroy', onLocalDestroy);
    core.on('osjs/application:destroy', onGlobalDestroy);

    application.destroy();
    application.destroy();
    expect(onLocalDestroy).toBeCalledTimes(1);
    expect(onGlobalDestroy).toBeCalledTimes(1);
    expect(application.workers.length).toBe(0);
    expect(application.sockets.length).toBe(0);
    expect(application.windows.length).toBe(0);
  });

  test('#saveSettings', () => {
    expect(application.saveSettings())
      .resolves
      .toBe(true);
  });

  test('.destroyAll', () => {
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
});
