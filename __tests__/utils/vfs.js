import * as vfs from '../../src/utils/vfs';

const ab2str = ab => (new Uint8Array(ab)).toString();

const str2ab = str => {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const blob2str = blob => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = e => reject(e);
  r.readAsText(blob);
});

describe('utils.vfs#getFileIcon', () => {
  const check = s => vfs.parentDirectory(s);

  it('Should remove slashes', () => expect(check('foo://///')).toEqual('foo:/'));
  it('Should get parent directory', () => expect(check('foo:/bar')).toEqual('foo:/'));
  it('Should get parent directory', () => expect(check('foo:/bar/baz')).toEqual('foo:/bar/'));
  it('Should get parent directory', () => expect(check('foo:/bar/baz/jazz')).toEqual('foo:/bar/baz/'));
});

describe('utils.vfs#transformReaddir', () => {
  const root = 'foo:/bar/';

  const input = [{
    isDirectory: false,
    isFile: true,
    path: 'foo:/bar/.dotfile',
    filename: '.dotfile',
    mime: 'text/plain',
    size: 123
  }, {
    isDirectory: true,
    isFile: false,
    path: 'foo:/bar/directory',
    filename: 'directory',
    mime: null,
    size: 0
  }, {
    isDirectory: true,
    isFile: false,
    path: 'foo:/bar/xdirectory',
    filename: 'xdirectory',
    mime: null,
    size: 0
  }, {
    isDirectory: false,
    isFile: true,
    path: 'foo:/bar/file',
    filename: 'file',
    mime: 'text/plain',
    size: 123
  }, {
    isDirectory: false,
    isFile: true,
    path: 'foo:/bar/xfile',
    filename: 'xfile',
    mime: 'text/plain',
    size: 666
  }];

  const check = (options = {}) => vfs.transformReaddir({path: root}, input, options);
  const checkMap = (options = {}, key = 'filename') => check(options).map(iter => iter[key]);

  it('Should add parent directory', () => {
    expect(check({
      showHiddenFiles: true
    })[0]).toEqual({
      isDirectory: true,
      isFile: false,
      path: 'foo:/',
      filename: '..',
      mime: null,
      size: 0,
      humanSize: '0 B',
      stat: {}
    });
  });

  it('Should remove dotfiles', () => {
    expect(checkMap({
      showHiddenFiles: false
    })).toEqual(['..', 'directory', 'xdirectory', 'file', 'xfile']);
  });

  it('Should sort by descending order', () => {
    const result = checkMap({
      showHiddenFiles: false,
      sortDir: 'desc'
    });

    const every = ['..', 'xdirectory', 'directory', 'xfile', 'file']
      .every((str, index) => result[index] === str);

    expect(every).toEqual(true);
  });

  it('Should sort by specified column', () => {
    const result = checkMap({
      showHiddenFiles: true,
      sortDir: 'desc',
      sortBy: 'size'
    }, 'size');

    const every = [0, 0, 0, 123, 123, 666]
      .every((str, index) => result[index] === str);

    expect(every).toEqual(true);
  });
});

describe('utils.vfs#getFileIcon', () => {
  const fn = vfs.getFileIcon({
    '^text/*': {name: 'text'},
    '^application': {name: 'application'},
    'foo/bar': {name: 'foo'}
  });

  it('Should match whildchar', () => expect(
    fn({mime: 'text/plain'})
  ).toEqual({name: 'text'}));

  it('Should match regexp', () => expect(
    fn({mime: 'application/foo'})
  ).toEqual({name: 'application'}));

  it('Should match plain', () => expect(
    fn({mime: 'foo/bar'})
  ).toEqual({name: 'foo'}));
});

describe('utils.vfs#createFileIter', () => {
  it('Should create a new iter', () => {
    return expect(vfs.createFileIter()).toEqual({
      isDirectory: false,
      isFile: true,
      mime: 'application/octet-stream',
      icon: null,
      size: -1,
      path: null,
      filename: null,
      label: null,
      stat: {},
      id: null,
      parent_id: null
    });
  });
});

describe('utils.vfs#humanFileSize', () => {
  const check = (s, i, si) => vfs.humanFileSize(Math.pow(s, i), si);

  it('Should return in B-s', () => expect(check(1)).toBe('0 B'));
  it('Should return in B-s', () => expect(check(1, 1, true)).toBe('1 B'));

  it('Should return in KiB-s', () => expect(check(1024, 1)).toBe('1.0 KiB'));
  it('Should return in MiB-s', () => expect(check(1024, 2)).toBe('1.0 MiB'));
  it('Should return in GiB-s', () => expect(check(1024, 3)).toBe('1.0 GiB'));
  it('Should return in TiB-s', () => expect(check(1024, 4)).toBe('1.0 TiB'));
  it('Should return in PiB-s', () => expect(check(1024, 5)).toBe('1.0 PiB'));
  it('Should return in EiB-s', () => expect(check(1024, 6)).toBe('1.0 EiB'));
  it('Should return in ZiB-s', () => expect(check(1024, 7)).toBe('1.0 ZiB'));
  it('Should return in YiB-s', () => expect(check(1024, 8)).toBe('1.0 YiB'));

  it('Should return in K-s', () => expect(check(1024, 1, true)).toBe('1.0 kB'));
  it('Should return in M-s', () => expect(check(1024, 2, true)).toBe('1.0 MB'));
  it('Should return in G-s', () => expect(check(1024, 3, true)).toBe('1.1 GB'));
  it('Should return in T-s', () => expect(check(1024, 4, true)).toBe('1.1 TB'));
  it('Should return in P-s', () => expect(check(1024, 5, true)).toBe('1.1 PB'));
  it('Should return in E-s', () => expect(check(1024, 6, true)).toBe('1.2 EB'));
  it('Should return in Z-s', () => expect(check(1024, 7, true)).toBe('1.2 ZB'));
  it('Should return in Y-s', () => expect(check(1024, 8, true)).toBe('1.2 YB'));
});

describe('utils.vfs#transformArrayBuffer', () => {
  const testText = 'foo';
  const testAb = str2ab(testText);
  const testAbString = ab2str(testAb);
  const create = type => vfs.transformArrayBuffer(testAb, 'text/plain', type);

  /* FIXME
  it('Should create string', () =>
    create('string')
      .then(result => expect(result).toBe('foo')));
      */

  it('Should create data url', () =>
    create('uri')
      .then(result => expect(result).toBe('data:text/plain;charset=undefined,f%00o%00o%00')));

  /* FIXME
  it('Should create blob', () =>
    create('blob')
      .then(blob2str)
      .then(result => expect(result).toBe(testText)));
      */

  it('Should create arraybuffer (default)', () =>
    create('arraybuffer')
      .then(ab2str)
      .then(result => expect(result).toBe(testAbString)));
});

describe('utils.vfs#basename', () => {
  it('Should resolve', () => {
    expect(vfs.basename('home:/foo/bar')).toBe('bar');
  });
});

describe('utils.vfs#pathname', () => {
  it('Should resolve', () => {
    expect(vfs.pathname('home:/foo/bar')).toBe('home:/foo');
  });
});
