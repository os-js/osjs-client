import {createInstance} from 'osjs';
import Tray from '../src/tray.js';

describe('Tray', () => {
  let core;

  beforeAll(() => createInstance().then(c => core = c));
  afterAll(() => core.destroy());

  test('#create', () => {
    let createEventEmitted = false;
    core.once('osjs/tray:create', () => (createEventEmitted = true));

    const tray = new Tray(core);
    const item = tray.create({
      icon: 'icon',
      title: 'title'
    });

    expect(tray.entries.length).toBe(1);
    expect(item.entry.icon).toBe('icon');
    expect(item.entry.title).toBe('title');
    expect(createEventEmitted).toBe(true);
  });

  test('#update', () => {
    let updateEventEmitted = false;
    core.once('osjs/tray:update', () => (updateEventEmitted = true));

    const tray = new Tray(core);
    const item = tray.create();

    item.update({
      icon: 'icon-new',
      title: 'title-new'
    });

    expect(item.entry.icon).toBe('icon-new');
    expect(item.entry.title).toBe('title-new');
    expect(updateEventEmitted).toBe(true);
  });

  test('#remove', () => {
    let removeEventEmitted = false;
    core.once('osjs/tray:remove', () => (removeEventEmitted = true));

    const tray = new Tray(core);
    const item = tray.create();
    item.destroy();

    expect(tray.entries.length).toBe(0);
    expect(removeEventEmitted).toBe(true);
  });
});
