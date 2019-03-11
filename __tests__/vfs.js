import * as VFS from '../src/vfs.js';
import nullAdapter from '../src/adapters/vfs/null.js';

const nullMount = {
  enabled: true,
  mounted: false,
  adapter: 'null',
  label: 'null',
  root: 'null:/',
  attributes: {
    visibility: 'global',
    local: true,
    searchable: true,
    readOnly: false
  }
};

const call = (method, ...args) => VFS[method](nullAdapter, nullMount)(...args);

it('readdir should return a directory list', () => {
  return expect(call('readdir', 'null:/'))
    .resolves
    .toBeInstanceOf(Array);
});

it('readfile should return string', () => {
  return expect(call('readfile', 'null:/filename'))
    .resolves
    .toBe('');
});

it('readfile should return blob', () => {
  return expect(call('readfile', 'null:/filename', 'blob'))
    .resolves
    .toBeInstanceOf(Blob);
});

it('readfile should return uri', () => {
  return expect(call('readfile', 'null:/filename', 'uri'))
    .resolves
    .toBe('data:application/octet-stream;base64,');
});

it('readfile should return arraybuffer', () => {
  return expect(call('readfile', 'null:/filename', 'arraybuffer'))
    .resolves
    .toBeInstanceOf(ArrayBuffer);
});

it('writefile should write blob', () => {
  return expect(call('writefile', 'null:/filename', new Blob()))
    .resolves
    .toBe(-1);
});

it('writefile should write arraybuffer', () => {
  return expect(call('writefile', 'null:/filename', new ArrayBuffer()))
    .resolves
    .toBe(-1);
});

it('copy should should return boolean', () => {
  return expect(call('copy', 'null:/from', 'null:/to'))
    .resolves
    .toBe(false);
});

it('rename should should return boolean', () => {
  return expect(call('rename', 'null:/from', 'null:/to'))
    .resolves
    .toBe(false);
});

it('mkdir should should return boolean', () => {
  return expect(call('mkdir', 'null:/directory'))
    .resolves
    .toBe(false);
});

it('unlink should should return boolean', () => {
  return expect(call('unlink', 'null:/directory'))
    .resolves
    .toBe(false);
});

it('exists should should return boolean', () => {
  return expect(call('exists', 'null:/filename'))
    .resolves
    .toBe(false);
});

it('url should should return string', () => {
  return expect(call('url', 'null:/filename'))
    .resolves
    .toBe(null); // Except that it doesn't
});

it('search should should return array', () => {
  return expect(call('search', 'null:/'))
    .resolves
    .toBeInstanceOf(Array);
});

it('touch should should return boolean', () => {
  return expect(call('touch', 'null:/'))
    .resolves
    .toBe(false);
});

it('stat should should return object', () => {
  return expect(call('stat', 'null:/filename'))
    .resolves
    .toEqual({
      filename: null,
      icon: null,
      id: null,
      isDirectory: false,
      isFile: true,
      label: null,
      mime: 'application/octet-stream',
      parent_id: null,
      path: null,
      size: -1,
      stat: {}
    });
});
