import {createInstance} from 'osjs';
import Notification from '../src/notification.js';
import Notifications from '../src/notifications.js';

describe('Notifications', () => {
  let core;
  let notifications;

  beforeAll(() => {
    return createInstance()
      .then(c => (core = c));
  });

  afterAll(() => core.destroy());

  test('#init', () => {
    notifications = new Notifications(core);
    notifications.init();
  });

  test('#create - failure', () => {
    expect(() => notifications.create())
      .toThrow(Error);
  });

  test('#create', () => {
    expect(notifications.create({
      title: 'Jest'
    })).toBeInstanceOf(Notification);
  });

  test('#destroy', () => {
    notifications.destroy();
  });
});
