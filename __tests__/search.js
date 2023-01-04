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

describe('Search', () => {
  let core;
  let search;

  beforeAll(() => createInstance((c) => {
    c.register(MockVFSServiceProvider);
  }).then(c => core = c));

  afterAll(() => core.destroy());

  test('#constructor', () => {
    search = new Search(core);
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
