import {createInstance} from 'osjs';
import Filesystem from '../src/filesystem.js';

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

it('Should mount all filesystems', () => {
  return expect(fs.mountAll())
    .resolves
    .toEqual([true, true, true]);
});

it('Should fail at finding mountpoint from path', () => {
  expect(() => fs.getMountpointFromPath('unknown:/file.name'))
    .toThrow(Error);

  expect(() => fs.getMountpointFromPath({path: 'unknown:/file.name'}))
    .toThrow(Error);
});

it('Should find mountpoint from path', () => {
  expect(fs.getMountpointFromPath('osjs:/file.name'))
    .toMatchObject({name: 'osjs'});
});

it('Should fail at mounting already mounted filesystem', () => {
  return expect(fs.mount('osjs'))
    .rejects
    .toBeInstanceOf(Error);
});

it('Should unmount filesystem', () => {
  return expect(fs.unmount('osjs'))
    .resolves
    .toEqual(true);
});

it('Should get all mountpoints', () => {
  const mounts = fs.getMounts(true);
  return expect(mounts.length)
    .toBe(3);
});

it('Should get filtered mountpoints', () => {
  const mounts = fs.getMounts();
  return expect(mounts.length)
    .toBe(2);
});

it('Should fail at unmount filesystem', () => {
  return expect(fs.unmount('osjs'))
    .rejects
    .toBeInstanceOf(Error);
});

it('Should remount filesystem', () => {
  return expect(fs.mount('osjs'))
    .resolves
    .toEqual(true);
});

it('Should fail at mounting already mounted filesystem', () => {
  return expect(fs.mount('osjs'))
    .rejects
    .toBeInstanceOf(Error);
});
