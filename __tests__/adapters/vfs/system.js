import {createInstance} from 'osjs';
import systemAdapter from '../../../src/adapters/vfs/system.js';

describe('System VFS Adapter', () => {
  let core;
  let adapter;

  beforeAll(() => createInstance().then(c => {
    core = c;
    adapter = systemAdapter(c);
  }));
  afterAll(() => core.destroy());

  test('#readdir', () => {
    return expect(adapter.readdir({path: 'null:/'}))
      .resolves
      .toBeInstanceOf(Array);
  });

  test('#readfile', () => {
    return adapter.readfile({path: 'null:/filename'})
      .then(({body, mime}) => {
        expect(body).toBeInstanceOf(ArrayBuffer);
        expect(mime).toBe('application/octet-stream');
      });
  });

  test('#writefile', () => {
    return expect(adapter.writefile({path: 'null:/filename'}, new Blob()))
      .resolves
      .toBe(-1);
  });

  test('#copy', () => {
    return expect(adapter.copy({path: 'null:/from'}, {path: 'null:/to'}))
      .resolves
      .toBe(true);
  });

  test('#rename', () => {
    return expect(adapter.rename({path: 'null:/from'}, {path: 'null:/to'}))
      .resolves
      .toBe(true);
  });

  test('#mkdir', () => {
    return expect(adapter.mkdir({path: 'null:/directory'}))
      .resolves
      .toBe(true);
  });

  test('#unlink', () => {
    return expect(adapter.unlink({path: 'null:/directory'}))
      .resolves
      .toBe(true);
  });

  test('#exists', () => {
    return expect(adapter.exists({path: 'null:/filename'}))
      .resolves
      .toBe(true);
  });

  test('#url', () => {
    return adapter.url({path: 'null:/filename'})
      .then(result => expect(typeof result === 'string'));
  });

  test('#search', () => {
    return expect(adapter.search({path: 'null:/'}))
      .resolves
      .toBeInstanceOf(Array);
  });

  test('#touch', () => {
    return expect(adapter.touch({path: 'null:/'}))
      .resolves
      .toBe(true);
  });

  test('#stat', () => {
    return expect(adapter.stat({path: 'null:/filename'}))
      .resolves
      .toEqual({});
  });

  test('#download', () => {
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
});
