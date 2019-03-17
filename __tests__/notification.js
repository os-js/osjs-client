import {createInstance} from 'osjs';
import Notification from '../src/notification.js';

let core;
let notification;
let root = document.createElement('div');

beforeAll(() => {
  return createInstance()
    .then(c => (core = c));
});

afterAll(() => core.destroy());

it('Should create a new instance', () => {
  const ev = jest.fn(() => {});
  core.on('osjs/notification:create', ev);

  notification = new Notification(core, root, {
    title: 'Jest',
    message: 'Jest'
  });

  expect(ev).toBeCalled();
});

it('Should render notification', () => {
  notification.render();

  expect(root.children.length).toBe(1);
  setTimeout(() => {
    expect(root.querySelector('osjs-notification-title').textContent).toBe('Jest');
    expect(root.querySelector('osjs-notification-message').textContent).toBe('Jest');
  }, 10);
});

it('Should destroy instance', () => {
  const ev = jest.fn(() => {});
  core.on('osjs/notification:destroy', ev);
  notification.destroy();

  expect(ev).toBeCalled();
});

it('Should try to create native notification', () => {
  const n = new Notification(core, root, {
    native: true
  });

  expect(n.render())
    .resolves
    .toBe(true);
});
