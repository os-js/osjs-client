import {createInstance} from '../__mocks__/core.js';
import Core from '../src/core.js';
import Application from '../src/application.js';

let core;

beforeAll(() => {
  return createInstance()
    .then(c => (core = c));
});

afterAll(() => core.destroy());

it('Should fail to unregister event', () => {
  return expect(() => core.off('osjs/fail'))
    .toThrow(TypeError);
});

it('Should unregister event', () => {
  return expect(() => core.off('osjs/fail', () => {}))
    .not
    .toThrow(TypeError);
});

it('Should only boot once', () => {
  return expect(core.boot())
    .resolves
    .toBe(false);
});

it('Should only start once', () => {
  return expect(core.start())
    .resolves
    .toBe(false);
});

it('Should create urls', () => {
  expect(core.url('foo/bar')).toBe('/foo/bar');
  expect(core.url('foo/bar', {prefix: true})).toBe('http://localhost/foo/bar');
  expect(core.url('foo/bar', {prefix: true, type: 'websocket'})).toBe('ws://localhost/foo/bar');
});

it('Should create a new connection', () => {
  const c = new Core({});

  return c.start()
    .then(result => {
      expect(result).toBe(true);
      c.destroy();
    });
});

it('Should fail at Creating new connection', () => {
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

it('Should not create request in standalone mode', () => {
  const c = new Core({
    standalone: true
  });

  return expect(c.request('/foo'))
    .rejects
    .toThrow();
});

it('Should create a request', () => {
  return expect(core.request('/success-test').then(response => response.json()))
    .resolves
    .toBe(true);
});

it('Should handle request failure', () => {
  return expect(core.request('/fail-test').then(response => response.json()))
    .rejects
    .toThrow();
});

it('Should fail to run unknown application', () => {
  return expect(() => core.run('UnknownApplication'))
    .toThrow();
});

it('Should run valid application', () => {
  return expect(() => core.run('ValidApplication'))
    .not
    .toThrow();
});

it('Should not try to open associated application', () => {
  return expect(core
    .open({
      mime: 'foo/bar'
    }))
    .resolves
    .toBe(false);
});

it('Should try to open associated application', () => {
  return expect(core
    .open({
      mime: 'valid/bazz'
    }))
    .resolves
    .toBe(true);
});

it('Should not try to open application for mime', () => {
  return expect(core
    .open({
      mime: 'osjs/application',
      path: 'apps:/ValidApplication'
    }))
    .resolves
    .toBeInstanceOf(Application);
});

it('Should set request options', () => {
  core.setRequestOptions({
    foo: 'bar'
  });

  expect(core.requestOptions).toEqual({
    foo: 'bar'
  });
});

it('Should get user', () => {
  expect(core.getUser()).toEqual({
    id: null,
    username: 'osjs',
    groups: []
  });
});

it('Should broadcast event', () => {
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

it('Should forward websocket message to core', () => {
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

it('Should forward websocket message to application', () => {
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

it('Should forward window message', () => {
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
