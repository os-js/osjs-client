import {ServiceProvider} from '@osjs/common';
import {createInstance} from 'osjs';
import Search from '../src/search.js';

const files = [{
  path: 'jest:/test.txt',
  filename: 'test.txt'
}, {
  path: 'jest:/foo/bar.baz',
  filename: 'bar.baz'
}, {
  path: 'jest:/hello.world',
  filename: 'hello.world'
}];

class MockVFSServiceProvider extends ServiceProvider {
  init() {
    this.core.singleton('osjs/vfs', () => ({
      search: async (root, pattern) => {
        return files.filter((f) => f.filename.includes(pattern));
      }
    }));

    this.core.singleton('osjs/fs', () => ({
      mountpoints: () => [{
        name: 'jest'
      }]
    }));
  }

  provides() {
    return [
      'osjs/vfs',
      'osjs/fs'
    ];
  }
}
class MySearchAdapter {
    constructor(core) {
        this.core = core;

    }

    destroy() {
    }

    async init() {
    }

    async search(pattern) {
        const obj = [
            {
                filename: "mahdi.png",
                humanSize: "5.9 KiB"+pattern,
                icon: null,
                id: null,
                isDirectory: false,
                isFile: true,
                label: null,
                mime: "image/png",
                parent_id: null,
                path: "hhh",
                size: 1959,
                stat: {
                    atime: "2022-11-26T22:06:27.343Z",
                    atimeMs: 1669500387343,
                    birthtime: "2022-11-26T22:06:27.049Z",
                    birthtimeMs: 1669500387049.1592,
                    blksize: 4096,
                    blocks: 8,
                    ctime: "2022-11-26T22:06:27.389Z",
                    ctimeMs: 1669500387389.1677,
                    dev: 473163771,
                    gid: 0,
                    ino: 3377699720581588,
                    mode: 3320,
                    mtime: "1985-10-26T08:15:00.000Z",
                    mtimeMs: 499162500000,
                    nlink: 1,
                    rdev: 0,
                    size: 1959,
                    uid: 0
                }
            }
        ];
        return Promise.all(obj)
            .then(lists => [].concat(...lists));
    }
}
describe('Search', () => {
  let core;
  let search;
  let options = {};
  options = {
        args: {
            search: {
                adapters: [MySearchAdapter],
            }
        }
  };
  beforeAll(() => createInstance((c) => {
    c.register(MockVFSServiceProvider);
  }).then(c => core = c));

  afterAll(() => core.destroy());

  test('#constructor', () => {
    search = new Search(core,options);
  });

  test('#search', () => {
    return search.search('hello')
      .then(result => {
        expect(result).toMatchObject([{
          path: 'jest:/hello.world',
          filename: 'hello.world'
        }]);
      });
  });
});
