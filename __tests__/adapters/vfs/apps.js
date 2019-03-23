import {createInstance} from 'osjs';
import appAdapter from '../../../src/adapters/vfs/apps.js';

describe('Apps VFS Adapter', () => {
  let core;
  let adapter;

  beforeAll(() => createInstance().then(c => {
    core = c;
    adapter = appAdapter(c);
  }));

  afterAll(() => core.destroy());

  test('#readdir', () => {
    return expect(adapter.readdir({
      path: 'apps:/'
    }))
      .resolves
      .toEqual([{
        filename: 'ValidApplication',
        icon: null,
        isDirectory: false,
        isFile: true,
        mime: 'osjs/application',
        path: 'apps:/ValidApplication', // FIXME
        size: 0,
        stat: {}
      }]);
  });
});
