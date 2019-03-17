import {createInstance} from 'osjs';
import systemAdapter from '../../../src/adapters/vfs/system.js';

let core;
let adapter;

beforeAll(() => createInstance().then(c => {
  core = c;
  adapter = systemAdapter(c);
}));
afterAll(() => core.destroy());

it('readdir should return a directory list', () => {
  return expect(adapter.readdir({path: 'null:/'}))
    .resolves
    .toBeInstanceOf(Array);
});

it('readfile should return arraybuffer', () => {
  return adapter.readfile({path: 'null:/filename'})
    .then(({body, mime}) => {
      expect(body).toBeInstanceOf(ArrayBuffer);
      expect(mime).toBe('application/octet-stream');
    });
});

it('writefile should write', () => {
  return expect(adapter.writefile({path: 'null:/filename'}, new Blob()))
    .resolves
    .toBe(-1);
});

it('copy should should return boolean', () => {
  return expect(adapter.copy({path: 'null:/from'}, {path: 'null:/to'}))
    .resolves
    .toBe(true);
});

it('rename should should return boolean', () => {
  return expect(adapter.rename({path: 'null:/from'}, {path: 'null:/to'}))
    .resolves
    .toBe(true);
});

it('mkdir should should return boolean', () => {
  return expect(adapter.mkdir({path: 'null:/directory'}))
    .resolves
    .toBe(true);
});

it('unlink should should return boolean', () => {
  return expect(adapter.unlink({path: 'null:/directory'}))
    .resolves
    .toBe(true);
});

it('exists should should return boolean', () => {
  return expect(adapter.exists({path: 'null:/filename'}))
    .resolves
    .toBe(true);
});

it('url should should return string', () => {
  return adapter.url({path: 'null:/filename'})
    .then(result => expect(typeof result === 'string'));
});

it('search should should return array', () => {
  return expect(adapter.search({path: 'null:/'}))
    .resolves
    .toBeInstanceOf(Array);
});

it('touch should should return boolean', () => {
  return expect(adapter.touch({path: 'null:/'}))
    .resolves
    .toBe(true);
});

it('stat should should return object', () => {
  return expect(adapter.stat({path: 'null:/filename'}))
    .resolves
    .toEqual({});
});

it('download should trigger', () => {
  const open = jest.fn();

  return adapter
    .download({path: 'null:/filename'}, {
      target: {
        open
      }
    })
    .then(() => {
      expect(open).toBeCalled();
    });
});

