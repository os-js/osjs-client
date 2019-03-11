import {createInstance} from 'osjs';
import Application from '../src/application.js';
import Window from '../src/window.js';

let core;
let application;

beforeAll(() => createInstance().then(c => core = c));
afterAll(() => core.destroy());

it('Should create a new instance', () => {
  application = new Application(core, {
    args: {
      foo: 'bar'
    },
    options: {},
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

it('Should remove window', () => {
  const fn = jest.fn(() => {});

  application.on('destroy-window', fn);
  application.removeWindow((win, index) => index > 0);

  expect(application.windows.length).toBe(1);
  expect(fn).toBeCalled();
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
