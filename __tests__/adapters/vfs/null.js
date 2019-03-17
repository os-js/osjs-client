import nullAdapter from '../../../src/adapters/vfs/null.js';

it('readdir should return a directory list', () => {
  return expect(nullAdapter.readdir('null:/'))
    .resolves
    .toBeInstanceOf(Array);
});

it('readfile should return arraybuffer', () => {
  return nullAdapter.readfile('null:/filename')
    .then(({body, mime}) => {
      expect(body).toBeInstanceOf(ArrayBuffer);
      expect(mime).toBe('application/octet-stream');
    });
});

it('writefile should write', () => {
  return expect(nullAdapter.writefile('null:/filename', new Blob()))
    .resolves
    .toBe(-1);
});

it('copy should should return boolean', () => {
  return expect(nullAdapter.copy('null:/from', 'null:/to'))
    .resolves
    .toBe(false);
});

it('rename should should return boolean', () => {
  return expect(nullAdapter.rename('null:/from', 'null:/to'))
    .resolves
    .toBe(false);
});

it('mkdir should should return boolean', () => {
  return expect(nullAdapter.mkdir('null:/directory'))
    .resolves
    .toBe(false);
});

it('unlink should should return boolean', () => {
  return expect(nullAdapter.unlink('null:/directory'))
    .resolves
    .toBe(false);
});

it('exists should should return boolean', () => {
  return expect(nullAdapter.exists('null:/filename'))
    .resolves
    .toBe(false);
});

it('url should should return string', () => {
  return expect(nullAdapter.url('null:/filename'))
    .resolves
    .toBe(null); // Except that it doesn't
});

it('search should should return array', () => {
  return expect(nullAdapter.search('null:/'))
    .resolves
    .toBeInstanceOf(Array);
});

it('touch should should return boolean', () => {
  return expect(nullAdapter.touch('null:/'))
    .resolves
    .toBe(false);
});

it('stat should should return object', () => {
  return expect(nullAdapter.stat('null:/filename'))
    .resolves
    .toEqual({});
});

