import nullAdapter from '../../../src/adapters/vfs/null.js';

describe('Null VFS Adapter', () => {
  test('#readdir', () => {
    return expect(nullAdapter.readdir('null:/'))
      .resolves
      .toBeInstanceOf(Array);
  });

  test('#readfile', () => {
    return nullAdapter.readfile('null:/filename')
      .then(({body, mime}) => {
        expect(body).toBeInstanceOf(ArrayBuffer);
        expect(mime).toBe('application/octet-stream');
      });
  });

  test('#writefile', () => {
    return expect(nullAdapter.writefile('null:/filename', new Blob()))
      .resolves
      .toBe(-1);
  });

  test('#copy', () => {
    return expect(nullAdapter.copy('null:/from', 'null:/to'))
      .resolves
      .toBe(false);
  });

  test('#rename', () => {
    return expect(nullAdapter.rename('null:/from', 'null:/to'))
      .resolves
      .toBe(false);
  });

  test('#mkdir', () => {
    return expect(nullAdapter.mkdir('null:/directory'))
      .resolves
      .toBe(false);
  });

  test('#unlink', () => {
    return expect(nullAdapter.unlink('null:/directory'))
      .resolves
      .toBe(false);
  });

  test('#exists', () => {
    return expect(nullAdapter.exists('null:/filename'))
      .resolves
      .toBe(false);
  });

  test('#url', () => {
    return expect(nullAdapter.url('null:/filename'))
      .resolves
      .toBe(null); // Except that it doesn't
  });

  test('#search', () => {
    return expect(nullAdapter.search('null:/'))
      .resolves
      .toBeInstanceOf(Array);
  });

  test('#touch', () => {
    return expect(nullAdapter.touch('null:/'))
      .resolves
      .toBe(false);
  });

  test('#stat', () => {
    return expect(nullAdapter.stat('null:/filename'))
      .resolves
      .toEqual({});
  });
});
