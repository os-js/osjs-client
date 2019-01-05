/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

import * as VFS from './vfs/methods';
import {EventEmitter} from '@osjs/event-emitter';
import systemAdapter from './vfs/system';
import appsAdapter from './vfs/apps';
import * as merge from 'deepmerge';

const defaultAdapter = ({
  readdir: (path, options) => Promise.resolve([]),
  readfile: (path, type, options) => Promise.resolve({body: null, mime: 'application/octet-stream'}),
  writefile: (path, data, options) => Promise.resolve(-1),
  copy: (from, to, options) => Promise.resolve(false),
  rename: (from, to, options) => Promise.resolve(false),
  mkdir: (path, options) => Promise.resolve(false),
  unlink: (path, options) => Promise.resolve(false),
  exists: (path, options) => Promise.resolve(false),
  stat: (path, options) => Promise.resolve({}),
  url: (path, options) => Promise.resolve(null),
  mount: options => Promise.resolve(true),
  unmount: options => Promise.resolve(true),
  search: (root, pattern, options) => Promise.resolve([]),
  touch: (path, options) => Promise.resolve([])
});

/**
 * VFS Mountpoint
 * @param {String} name Name
 * @param {String} label Label
 * @param {String} adapter Adater name
 * @param {Boolean} [enabled=true] Enabled state
 * @param {Object} [attributes] Attributes
 * @param {String} [attributes.visibility='global'] Visibility in UI
 * @param {Boolean} [attributes.local=true] Local filesystem ?
 * @param {Boolean} [attributes.searchable=true] If can be searched
 * @param {Boolean} [attributes.readOnly=false] Readonly
 * @typedef Mountpoint
 */

/*
 * Gets mountpoint from a path
 */
const getMountpointFromPath = (core, mounts, file) => {
  const path = typeof file === 'string' ? file : file.path;
  const re = /^(\w+):(.*)/;
  const match = String(path).replace(/\+/g, '/').match(re);
  const [prefix] = Array.from(match || []).slice(1);
  const _ = core.make('osjs/locale').translate;

  if (!prefix) {
    throw new Error(_('ERR_VFS_PATH_FORMAT_INVALID', path));
  }

  const found = mounts.find(m => m.name === prefix);

  if (!found) {
    throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND_FOR', `${prefix}:`));
  }

  return found;
};

/*
 * Creates given mountpoint
 */
const createMountpoint = (core, adapters, props) => {
  const name = props.adapter || core.config('vfs.defaultAdapter');
  const adapter = Object.assign({}, defaultAdapter, adapters[name](core));

  const result = merge({
    enabled: true,
    mounted: false,
    adapter: name,
    attributes: {
      visibility: 'global',
      local: true,
      searchable: true,
      readOnly: false
    }
  }, props);

  return Object.assign({
    _adapter: adapter,
    label: name,
    root: `${result.name || name}:/`
  }, result);
};

/**
 * Filesystem Manager
 *
 * @desc Class that manages filesystems
 */
export default class Filesystem extends EventEmitter {

  /**
   * Create filesystem manager
   *
   * @param {Core} core Core reference
   * @param {Object} [options] Options
   * @param {Map<String,Adapter>} [options.adapters] Adapter registry
   * @param {Mountpoint[]} [options.mounts] Mountpoints
   */
  constructor(core, options = {}) {
    options = Object.assign({}, {
      adapters: {},
      mounts: []
    }, options);

    super('Filesystem');

    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * Adapter registry
     * @type {Map<String, Adapter>}
     */
    this.adapters = Object.assign({}, {
      system: systemAdapter,
      apps: appsAdapter
    }, this.core.config('vfs.adapters', {}), options.adapters);

    /**
     * Mountpoints
     * @type {Mountpoint[]}
     */
    this.mounts = [];

    /**
     * Options
     * @type {Object}
     */
    this.options = {};
    /**
     * A wrapper for VFS method requests
     * @type {Map<String, Function>}
     */
    this.proxy = Object.keys(VFS).reduce((result, method) => {
      return Object.assign({
        [method]: (...args) => this._request(method, ...args)
      }, result);
    }, {});
  }

  /**
   * Mounts all configured mountpoints
   */
  mountAll(stopOnError = true) {
    this.mounts = this.core.config('vfs.mountpoints')
      .concat(this.options.mounts || [])
      .map(mount => {
        try {
          return createMountpoint(this.core, this.adapters, mount);
        } catch (e) {
          console.warn(e);
        }

        return null;
      })
      .filter((mount, pos, arr) => {
        const index = arr.findIndex(item => item.label === mount.label || item.root === mount.label);
        if (index === pos) {
          return true;
        }

        console.warn('Removed duplicate mountpoint', mount);
        return false;
      })
      .filter(mount => mount !== null);

    const fn = m => stopOnError
      ? this._mount(m)
      : this._mount(m).catch(err => console.warn(err));

    return Promise.all(this.mounts.map(fn));
  }

  /**
   * Wrapper for mounting
   * @param {Mountpoint} mountpoint The mountpoint
   */
  _mount(mountpoint) {
    return mountpoint._adapter.mount({}, mountpoint)
      .then(result => {
        if (result) {
          mountpoint.mounted = true;
          this.emit('mounted', mountpoint);
          this.core.emit('osjs/fs:mount');
        }

        return result;
      });
  }

  /**
   * Wrapper for unmounting
   * @param {Mountpoint} mountpoint The mountpoint
   */
  _unmount(mountpoint) {
    return mountpoint._adapter.unmount({}, mountpoint)
      .then(result => {
        if (result) {
          mountpoint.mounted = false;
          this.emit('unmounted', mountpoint);
          this.core.emit('osjs/fs:unmount');
        }

        return result;
      });
  }

  /**
   * Mount given filesystem
   * @param {String} name Filesystem name
   * @throws {Error} On invalid name or if already mounted
   */
  mount(name) {
    return Promise.resolve(this.mounts.find(m => m.name === name))
      .then(found => {
        const _ = this.core.make('osjs/locale').translate;

        if (!found) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND', name));
        } else if (!found.mounted) {
          throw new Error(_('ERR_VFS_MOUNT_ALREADY_MOUNTED', name));
        }

        return this._mount(found);
      });
  }

  /**
   * Unmount given filesystem
   * @param {String} name Filesystem name
   * @throws {Error} On invalid name or if already unmounted
   */
  unmount(name) {
    return Promise.resolve(this.mounts.find(m => m.name === name))
      .then(found => {
        const _ = this.core.make('osjs/locale').translate;

        if (!found) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND', name));
        } else if (!found.mounted) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_MOUNTED', name));
        }

        return this._unmount(found);
      });
  }

  /**
   * Gets the proxy for VFS methods
   * @return {Map<String, Function>} A map of VFS functions
   */
  request() {
    return this.proxy;
  }

  /**
   * Perform a VFS method request
   * @param {String} method VFS method name
   * @param {*} ...args Arguments
   * @return {*}
   */
  _request(method, ...args) {
    if (['rename', 'move', 'copy'].indexOf(method) !== -1) {
      const [src, dest] = args;
      const srcMount = getMountpointFromPath(this.core, this.mounts, src);
      const destMount = getMountpointFromPath(this.core, this.mounts, dest);
      const sameAdapter = srcMount.adapter === destMount.adapter;

      if (!sameAdapter) {
        return VFS.readfile(srcMount._adapter, srcMount)(src)
          .then(ab => VFS.writefile(destMount._adapter, destMount)(dest, ab))
          .then(result => {
            return method === 'rename'
              ? VFS.unlink(srcMount._adapter, srcMount)(src).then(() => result)
              : result;
          });
      }
    }

    const [file] = args;
    const mount = getMountpointFromPath(this.core, this.mounts, file);

    this.core.emit(`osjs/vfs:${method}`, ...args);

    return VFS[method](mount._adapter, mount)(...args);
  }

  /**
   * Gets all mountpoints
   * @return {Object[]}
   */
  getMounts(all = false) {
    const theme = this.core.make('osjs/theme');
    const icon = str => str
      ? (typeof str === 'string' ? str : theme.icon(str.name))
      : theme.icon('drive-harddisk');

    return this.mounts
      .filter(m => all || m.mounted)
      .filter(m => m.enabled !== false)
      .map(m => ({
        attributes: Object.assign({}, m.attributes),
        icon: icon(m.icon),
        name: m.name,
        label: m.label,
        root: m.root
      }));
  }

}
