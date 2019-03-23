import {createInstance} from 'osjs';
import Filesystem from '../src/filesystem.js';

describe('Filesystem', () => {
  let core;
  let fs;

  beforeAll(() => {
    return createInstance()
      .then(c => {
        core = c;
        fs = new Filesystem(core);
      });
  });

  afterAll(() => core.destroy());

  test('#mountAll', () => {
    return expect(fs.mountAll())
      .resolves
      .toEqual([true, true, true]);
  });

  test('#getMountpointFromPath - failure', () => {
    expect(() => fs.getMountpointFromPath('unknown:/file.name'))
      .toThrow(Error);

    expect(() => fs.getMountpointFromPath({path: 'unknown:/file.name'}))
      .toThrow(Error);

    expect(() => fs.getMountpointFromPath({path: 'invalid'}))
      .toThrow(Error);
  });

  test('#getMountpointFromPath', () => {
    expect(fs.getMountpointFromPath('osjs:/file.name'))
      .toMatchObject({name: 'osjs'});
  });

  test('#mount - failure', () => {
    return expect(fs.mount('osjs'))
      .rejects
      .toBeInstanceOf(Error);
  });

  test('#unmount', () => {
    return expect(fs.unmount('osjs'))
      .resolves
      .toEqual(true);
  });

  test('#getMounts', () => {
    const mounts = fs.getMounts(true);
    return expect(mounts.length)
      .toBe(3);
  });

  test('getMounts - filtered', () => {
    const mounts = fs.getMounts();
    return expect(mounts.length)
      .toBe(2);
  });

  test('#unmount - failure', () => {
    return expect(fs.unmount('osjs'))
      .rejects
      .toBeInstanceOf(Error);
  });

  test('#mount - remount', () => {
    return expect(fs.mount('osjs'))
      .resolves
      .toEqual(true);
  });

  test('#mount - fail at already mounted', () => {
    return expect(fs.mount('osjs'))
      .rejects
      .toBeInstanceOf(Error);
  });

  test('#request - direct', () => {
    return expect(() => fs.request().exists('null:/foo'))
      .toThrow(Error);
  });

  test('#request - cross', () => {
    return expect(() => fs.request().copy('from:/foo', 'to:/bar'))
      .toThrow(Error);
  });
});
