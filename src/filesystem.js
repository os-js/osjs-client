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

import * as VFS from './vfs';
import {EventEmitter} from '@osjs/event-emitter';
import defaultAdapter from './adapters/vfs/null';
import systemAdapter from './adapters/vfs/system';
import appsAdapter from './adapters/vfs/apps';
import merge from 'deepmerge';

/**
 * VFS Mountpoint
 * @param {string} name Name
 * @param {string} label Label
 * @param {string} adapter Adater name
 * @param {boolean} [enabled=true] Enabled state
 * @param {object} [attributes] Attributes
 * @param {string} [attributes.visibility='global'] Visibility in UI
 * @param {boolean} [attributes.local=true] Local filesystem ?
 * @param {boolean} [attributes.searchable=true] If can be searched
 * @param {boolean} [attributes.readOnly=false] Readonly
 * @typedef Mountpoint
 */

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
   * @param {object} [options] Options
   * @param {Map<string,Adapter>} [options.adapters] Adapter registry
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
     * @type {Map<string, Adapter>}
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
     * @type {Map<string, Function>}
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
          return this.createMountpoint(mount);
        } catch (e) {
          console.warn('Error while creating mountpoint', e);
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
      ? this._mountpointAction(m)
      : this._mountpointAction(m).catch(err => console.warn('Error while mounting', m, err));

    return Promise.all(this.mounts.map(fn));
  }

  /**
   * Mount given filesystem
   * @param {string} name Filesystem name
   * @throws {Error} On invalid name or if already mounted
   */
  mount(name) {
    return this._mountAction(name, false);
  }

  /**
   * Unmount given filesystem
   * @param {string} name Filesystem name
   * @throws {Error} On invalid name or if already unmounted
   */
  unmount(name) {
    return this._mountAction(name, true);
  }

  /**
   * Internal wrapper for mounting/unmounting
   *
   * @param {Mountpoint} mountpoint The mountpoint
   * @param {boolean} [unmount=false] If action is unmounting
   * @return {Promise<boolean, Error>}
   */
  _mountpointAction(mountpoint, unmount = false) {
    const eventName = unmount ? 'unmounted' : 'mounted';
    const coreEventName = unmount ? 'unmount' : 'mount';

    return mountpoint._adapter[coreEventName]({}, mountpoint)
      .then(result => {
        if (result) {
          mountpoint.mounted = !unmount;

          this.emit(eventName, mountpoint);
          this.core.emit('osjs/fs:' + coreEventName);
        }

        return result;
      });
  }

  /**
   * Internal wrapper for mounting/unmounting by name
   *
   * @param {string} name Mountpoint name
   * @param {boolean} [unmount=false] If action is unmounting
   * @return {Promise<boolean, Error>}
   */
  _mountAction(name, unmount) {
    return Promise.resolve(this.mounts.find(m => m.name === name))
      .then(found => {
        const _ = this.core.make('osjs/locale').translate;

        // FIXME: Add already mounting state
        if (!found) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND', name));
        } else if (unmount && !found.mounted) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_MOUNTED', name));
        } else if (!unmount && found.mounted) {
          throw new Error(_('ERR_VFS_MOUNT_ALREADY_MOUNTED', name));
        }

        return this._mountpointAction(found, unmount);
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
   * @param {string} method VFS method name
   * @param {*} ...args Arguments
   * @return {*}
   */
  _request(method, ...args) {
    if (['rename', 'move', 'copy'].indexOf(method) !== -1) {
      const [src, dest] = args;
      const srcMount = this.getMountpointFromPath(src);
      const destMount = this.getMountpointFromPath(dest);
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
    const mount = this.getMountpointFromPath(file);

    this.core.emit(`osjs/vfs:${method}`, ...args);

    return VFS[method](mount._adapter, mount)(...args);
  }

  /**
   * Creates a new mountpoint based on given properties
   * @param {object} props Properties (see Mountpoint)
   * @return {Mountpoint}
   */
  createMountpoint(props) {
    const name = props.adapter || this.core.config('vfs.defaultAdapter');
    const adapter = Object.assign({}, defaultAdapter, this.adapters[name](this.core));

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
  }

  /**
   * Gets mountpoint from given path
   * @param {string|object} file The file object
   * @return {Mountpoint|null}
   */
  getMountpointFromPath(file) {
    const path = typeof file === 'string' ? file : file.path;
    const re = /^(\w+):(.*)/;
    const match = String(path).replace(/\+/g, '/').match(re);
    const [prefix] = Array.from(match || []).slice(1);
    const _ = this.core.make('osjs/locale').translate;

    if (!prefix) {
      throw new Error(_('ERR_VFS_PATH_FORMAT_INVALID', path));
    }

    const found = this.mounts.find(m => m.name === prefix);

    if (!found) {
      throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND_FOR', `${prefix}:`));
    }

    return found;
  }

  /**
   * Gets all mountpoints
   * @return {object[]}
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
