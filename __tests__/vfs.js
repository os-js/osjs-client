import * as VFS from '../src/vfs.js';
import nullAdapter from '../src/adapters/vfs/null.js';

const testMount = {
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

const otherMount = {
  enabled: true,
  mounted: false,
  adapter: 'null',
  label: 'other',
  root: 'other:/',
  attributes: {
    visibility: 'global',
    local: true,
    searchable: false,
    readOnly: false
  }
};

const testAdapter = Object.assign({}, nullAdapter, {
  readdir: (path, options) => Promise.resolve([{
    isDirectory: false,
    isFile: true,
    filename: 'jest.tst',
    path: 'null:/jest.tst',
    mime: 'text/plain'
  }]),
});

const call = (method, ...args) => VFS[method](testAdapter, testMount)(...args);
const callOther = (method, ...args) => VFS[method](testAdapter, otherMount)(...args);

describe('VFS', () => {
  test('#readdir', () => {
    return expect(call('readdir', 'null:/'))
      .resolves
      .toMatchObject([{
        isDirectory: false,
        isFile: true,
        filename: 'jest.tst',
        path: 'null:/jest.tst',
        mime: 'text/plain'
      }]);
  });

  test('#readfile - string', () => {
    return expect(call('readfile', 'null:/filename'))
      .resolves
      .toBe('');
  });

  test('#readfile - blob', () => {
    return expect(call('readfile', 'null:/filename', 'blob'))
      .resolves
      .toBeInstanceOf(Blob);
  });

  test('#readfile - uri', () => {
    return expect(call('readfile', 'null:/filename', 'uri'))
      .resolves
      .toBe('data:application/octet-stream;base64,');
  });

  test('#readfile - arraybuffer', () => {
    return expect(call('readfile', 'null:/filename', 'arraybuffer'))
      .resolves
      .toBeInstanceOf(ArrayBuffer);
  });

  test('writefile - blob', () => {
    return expect(call('writefile', 'null:/filename', new Blob()))
      .resolves
      .toBe(-1);
  });

  test('#writefile - arraybuffer', () => {
    return expect(call('writefile', 'null:/filename', new ArrayBuffer()))
      .resolves
      .toBe(-1);
  });

  test('#writefile - string', () => {
    return expect(call('writefile', 'null:/filename', 'data'))
      .resolves
      .toBe(-1);
  });

  test('#copy', () => {
    return expect(call('copy', 'null:/from', 'null:/to'))
      .resolves
      .toBe(false);
  });

  test('#rename', () => {
    return expect(call('rename', 'null:/from', 'null:/to'))
      .resolves
      .toBe(false);
  });

  test('#mkdir', () => {
    return expect(call('mkdir', 'null:/directory'))
      .resolves
      .toBe(false);
  });

  test('#unlink', () => {
    return expect(call('unlink', 'null:/directory'))
      .resolves
      .toBe(false);
  });

  test('#exists', () => {
    return expect(call('exists', 'null:/filename'))
      .resolves
      .toBe(false);
  });

  test('#url', () => {
    return expect(call('url', 'null:/filename'))
      .resolves
      .toBe(null); // Except that it doesn't
  });

  test('#search', () => {
    return expect(call('search', 'null:/'))
      .resolves
      .toBeInstanceOf(Array);
  });

  test('#search - not enabled', () => {
    return expect(callOther('search', 'other:/'))
      .resolves
      .toBeInstanceOf(Array);
  });

  test('#touch', () => {
    return expect(call('touch', 'null:/'))
      .resolves
      .toBe(false);
  });

  test('#download', () => {
    return expect(call('download', 'null:/'))
      .resolves
      .toBe(undefined);
  });

  test('#stat', () => {
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
});
