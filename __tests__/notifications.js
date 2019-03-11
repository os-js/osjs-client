import {createInstance} from 'osjs';
import Notification from '../src/notification.js';
import Notifications from '../src/notifications.js';

let core;
let notifications;

beforeAll(() => {
  return createInstance()
    .then(c => (core = c));
});

afterAll(() => core.destroy());

it('Should create a new instance', () => {
  notifications = new Notifications(core);
  notifications.init();
});

it('Should fail at creating new notification', () => {
  expect(() => notifications.create())
    .toThrow(Error);
});

it('Should create new notification', () => {
  expect(notifications.create({
    title: 'Jest'
  })).toBeInstanceOf(Notification);
});

it('Should destroy instance', () => {
  notifications.destroy();
});
