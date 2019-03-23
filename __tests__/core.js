import {createInstance} from '../__mocks__/core.js';
import Core from '../src/core.js';
import Application from '../src/application.js';

describe('Core', () => {
  let core;

  beforeAll(() => {
    return createInstance()
      .then(c => (core = c));
  });

  afterAll(() => core.destroy());

  test('#off - fail unregister event', () => {
    return expect(() => core.off('osjs/fail'))
      .toThrow(TypeError);
  });

  test('#off - unregister event', () => {
    return expect(() => core.off('osjs/fail', () => {}))
      .not
      .toThrow(TypeError);
  });

  test('#boot', () => {
    return expect(core.boot())
      .resolves
      .toBe(false);
  });

  test('#start', () => {
    return expect(core.start())
      .resolves
      .toBe(false);
  });

  test('#url', () => {
    expect(core.url('foo/bar')).toBe('/foo/bar');
    expect(core.url('foo/bar', {prefix: true})).toBe('http://localhost/foo/bar');
    expect(core.url('foo/bar', {prefix: true, type: 'websocket'})).toBe('ws://localhost/foo/bar');
  });

  test('#_createConnection', () => {
    const c = new Core({});

    return c.start()
      .then(result => {
        expect(result).toBe(true);
        c.destroy();
      });
  });

  test('#_createConnection - failure', () => {
    const c = new Core({
      ws: {
        uri: 'ws://fail'
      }
    });

    return expect(new Promise((resolve, reject) => {
      c._createConnection(error => error ? reject(error) : resolve());
    }))
      .rejects
      .toThrow(Error);
  });

  test('#request - standalone error', () => {
    const c = new Core({
      standalone: true
    });

    return expect(c.request('/foo'))
      .rejects
      .toThrow();
  });

  test('#request', () => {
    return expect(core.request('/success-test').then(response => response.json()))
      .resolves
      .toBe(true);
  });

  test('#request - handle failure', () => {
    return expect(core.request('/fail-test').then(response => response.json()))
      .rejects
      .toThrow();
  });

  test('#run - fail to run unknown application', () => {
    return expect(() => core.run('UnknownApplication'))
      .toThrow();
  });

  test('#run - run valid application', () => {
    return expect(() => core.run('ValidApplication'))
      .not
      .toThrow();
  });

  test('#open - not try to open associated application', () => {
    return expect(core
      .open({
        mime: 'foo/bar'
      }))
      .resolves
      .toBe(false);
  });

  test('#open - try to open associated application', () => {
    return expect(core
      .open({
        mime: 'valid/bazz'
      }))
      .resolves
      .toBe(true);
  });

  test('#open - not try to open application for mime', () => {
    return expect(core
      .open({
        mime: 'osjs/application',
        path: 'apps:/ValidApplication'
      }))
      .resolves
      .toBeInstanceOf(Application);
  });

  test('#setRequestOptions', () => {
    core.setRequestOptions({
      foo: 'bar'
    });

    expect(core.requestOptions).toEqual({
      foo: 'bar'
    });
  });

  test('#getUser', () => {
    expect(core.getUser()).toEqual({
      id: null,
      username: 'osjs',
      groups: []
    });
  });

  test('#broadcast', () => {
    return core.run('ValidApplication')
      .then(app => {
        const valid = jest.fn();
        const invalid = jest.fn();
        app.on('broadcast-event', valid);
        app.on('broadcast-eventz', invalid);
        core.broadcast('ValidApplication', 'broadcast-event');

        expect(valid).toBeCalled();
        expect(invalid).not.toBeCalled();
        app.destroy();
      });
  });

  test('event: websocket core proxy', () => {
    const c = new Core({});
    const fn = jest.fn();

    return c.start()
      .then(result => {
        c.on('test/websocket', fn);

        c.ws.emit('message', {
          data: JSON.stringify({
            params: [1, 2, 3],
            name: 'test/websocket'
          })
        });

        expect(fn).toBeCalled();
        expect(fn.mock.calls[0]).toEqual([1, 2, 3 ]);
      });
  });

  test('event: osjs/application:socket:message', () => {
    const fn = jest.fn();

    return core.run('ValidApplication')
      .then(app => {
        app.on('ws:message', fn);

        core.emit('osjs/application:socket:message', {
          pid: app.pid,
          args: [1, 2, 3]
        });

        expect(fn).toBeCalled();
        expect(fn.mock.calls[0]).toEqual([1, 2, 3 ]);
        app.destroy();
      });
  });

  test('event: osjs/iframe:message', () => {
    const fn = jest.fn();

    return core.run('ValidApplication')
      .then(app => {
        const win = app.createWindow();
        win.on('iframe:get', fn);

        const event = new MessageEvent('message', {
          data: {
            name: 'osjs/iframe:message',
            params: [{
              pid: app.pid,
              wid: win.wid,
              args: [1, 2, 3]
            }]
          }
        });

        window.dispatchEvent(event);

        expect(fn).toBeCalled();
        expect(fn.mock.calls[0]).toEqual([1, 2, 3 ]);
        app.destroy();
      });
  });
});
