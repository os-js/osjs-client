import logger from '../../logger';

export default class VFSSearchAdapter {
  constructor(core) {
    this.core = core;
  }

  destroy() {
  }

  async init() {
  }

  async search(pattern) {
    const vfs = this.core.make('osjs/vfs');
    const promises = this.core.make('osjs/fs')
      .mountpoints()
      .map(mount => `${mount.name}:/`)
      .map(path => {
        return vfs.search({path}, pattern)
          .catch(error => {
            logger.warn('Error while searching', error);
            return [];
          });
      });
    return Promise.all(promises)
      .then(lists => [].concat(...lists));
  }
}
