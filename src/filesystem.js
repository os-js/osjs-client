/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
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
 * @license Simplified BSD License
 */

import * as VFS from './vfs';
import {EventEmitter} from '@osjs/event-emitter';
import {parseMountpointPrefix, filterMountByGroups, createWatchEvents} from './utils/vfs';
import defaultAdapter from './adapters/vfs/null';
import systemAdapter from './adapters/vfs/system';
import appsAdapter from './adapters/vfs/apps';
import logger from './logger';
import merge from 'deepmerge';

/**
 * VFS Mountpoint attributes
 *
 * @typedef {Object} FilesystemMountpointAttributes
 * @property {string} [visibility='global'] Visibility in UI
 * @property {boolean} [local=true] Local filesystem ?
 * @property {boolean} [searchable=true] If can be searched
 * @property {boolean} [readOnly=false] Readonly
 */

/**
 * VFS Mountpoint
 *
 * @typedef {Object} FilesystemMountpoint
 * @property {string} name Name
 * @property {string} label Label
 * @property {string} adapter Adater name
 * @property {string} [root] System adapter root
 * @property {boolean} [enabled=true] Enabled state
 * @property {FilesystemMountpointAttributes} [attributes] Attributes
 */

/**
 * Filesystem Adapter Methods
 * TODO: typedef
 * @typedef {Object} FilesystemAdapterMethods
 * @property {Function} capabilities
 * @property {Function} readdir
 * @property {Function} readfile
 * @property {Function} writefile
 * @property {Function} copy
 * @property {Function} move
 * @property {Function} rename
 * @property {Function} mkdir
 * @property {Function} unlink
 * @property {Function} exists
 * @property {Function} stat
 * @property {Function} url
 * @property {Function} download
 * @property {Function} search
 * @property {Function} touch
 * @property {Function} archive
 */

/**
 * @callback FilesystemAdapterWrapper
 * @return {FilesystemAdapterMethods}
 */

/**
 * Filesystem Options
 *
 * @typedef {Object} FilesystemOptions
 * @property {{name: FilesystemAdapterWrapper}} [adapters] Adapter registry
 * @property {FilesystemMountpoint[]} [mounts] Mountpoints
 */

/**
 * Filesystem Class that manages filesystems and adapters
 */
export default class Filesystem extends EventEmitter {

  /**
   * Create filesystem manager
   *
   * @param {Core} core Core reference
   * @param {FilesystemOptions} [options] Options
   */
  constructor(core, options = {}) {
    options = {
      adapters: {},
      mounts: [],
      ...options
    };

    super('Filesystem');

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Adapter registry
     * @type {{name: FilesystemAdapterWrapper}}
     * @readonly
     */
    this.adapters = {
      system: systemAdapter,
      apps: appsAdapter,
      ...this.core.config('vfs.adapters', {}),
      ...options.adapters
    };

    /**
     * Mountpoints
     * @type {FilesystemMountpoint[]}
     */
    this.mounts = [];

    /**
     * Options
     * @type {FilesystemOptions}
     */
    this.options = {};

    /**
     * A wrapper for VFS method requests
     * @type {{key: Function}}
     * @readonly
     */
    this.proxy = Object.keys(VFS).reduce((result, method) => {
      return {
        [method]: (...args) => this._request(method, ...args),
        ...result
      };
    }, {});
  }

  /**
   * Mounts all configured mountpoints
   * @param {boolean} [stopOnError=true] Stop on first error
   * @return {Promise<boolean[]>}
   */
  mountAll(stopOnError = true) {
    this.mounts = this._getConfiguredMountpoints();

    const fn = m => stopOnError
      ? this._mountpointAction(m)
      : this._mountpointAction(m).catch(err => logger.warn('Error while mounting', m, err));

    return Promise.all(this.mounts.map(fn));
  }

  /**
   * Adds a new mountpoint
   * @param {FilesystemMountpoint} props Mountpoint props
   * @param {boolean} [automount=true] Automount after creation
   * @return {Promise<boolean>}
   */
  addMountpoint(props, automount = true) {
    const mount = this.createMountpoint(props);

    this.mounts.push(mount);

    if (automount) {
      return this.mount(mount.name);
    }

    return Promise.resolve(true);
  }

  /**
   * Mount given mountpoint
   * @param {string|FilesystemMountpoint} m Mountpoint name or object
   * @throws {Error} On invalid name or if already mounted
   * @return {Promise<boolean>}
   */
  mount(m) {
    if (typeof m === 'string') {
      return this._mountAction(m, false);
    }

    return this.addMountpoint(m);
  }

  /**
   * Unmount given filesystem
   * @param {string} name Filesystem name
   * @throws {Error} On invalid name or if already unmounted
   * @return {Promise<boolean>}
   */
  unmount(name) {
    return this._mountAction(name, true);
  }

  /**
   * Internal wrapper for mounting/unmounting
   *
   * @private
   * @param {FilesystemMountpoint} mountpoint The mountpoint
   * @param {boolean} [unmount=false] If action is unmounting
   * @return {Promise<boolean>}
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
   * @private
   * @param {string} name Mountpoint name
   * @param {boolean} [unmount=false] If action is unmounting
   * @return {Promise<boolean>}
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
   * FIXME: Not correct type, but works for documentation atm
   * @return {FilesystemAdapterMethods} A map of VFS functions
   */
  request() {
    return this.proxy;
  }

  /**
   * Perform a VFS method request
   *
   * @private
   * @param {string} method VFS method name
   * @param {*} ...args Arguments
   * @return {*}
   */
  _request(method, ...args) {
    const ev = `osjs/vfs:${method}`;

    const done = (error) => {
      this.core.emit(`${ev}:done`, ...args);

      if (!error && this.core.config('vfs.watch')) {
        const eva = createWatchEvents(method, args);
        eva.forEach(([e, a]) => this.core.emit(e, a));
      }
    };

    this.core.emit(ev, ...args);

    return this._requestAction(method, ...args)
      .then(result => {
        done();
        return result;
      })
      .catch(error => {
        done(error);
        throw error;
      });
  }

  /**
   * Request action wrapper
   * @private
   * @param {string} method
   * @param {*} ...args Arguments
   * @return {Promise<*>}
   */
  _requestAction(method, ...args) {
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
    } else if (method === 'archive') {
      const [selection] = args;
      const mount = this.getMountpointFromPath(selection[0].path);
      if (!mount) {
        return Promise.reject(new Error('No selection was specified'));
      }

      return VFS[method](mount._adapter, mount)(...args);
    }

    const [file] = args;
    const mount = this.getMountpointFromPath(file);

    return VFS[method](mount._adapter, mount)(...args);
  }

  /**
   * Creates a new mountpoint based on given properties
   * @param {FilesystemMountpoint} props Properties
   * @return {FilesystemMountpoint}
   */
  createMountpoint(props) {
    const name = props.adapter || this.core.config('vfs.defaultAdapter');
    const adapter = {...defaultAdapter, ...this.adapters[name](this.core)};

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

    return {
      _adapter: adapter,
      label: name,
      root: `${result.name || name}:/`,
      ...result
    };
  }

  /**
   * Gets mountpoint from given path
   * @param {string|VFSFile} file The file
   * @return {FilesystemMountpoint|null}
   */
  getMountpointFromPath(file) {
    const path = typeof file === 'string' ? file : file.path;
    const prefix = parseMountpointPrefix(path);
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
   * @return {FilesystemMountpoint[]}
   */
  getMounts(all = false) {
    const user = this.core.getUser();
    const theme = this.core.make('osjs/theme');
    const icon = str => str
      ? (typeof str === 'string' ? str : theme.icon(str.name))
      : theme.icon('drive-harddisk');

    return this.mounts
      .filter(m => all || m.mounted)
      .filter(m => m.enabled !== false)
      .filter(m => {
        const mg = m.attributes ? m.attributes.groups : [];
        const ms = m.attributes ? m.attributes.strictGroups !== false : true;
        return filterMountByGroups(user.groups)(mg, ms);
      })
      .map(m => ({
        attributes: {...m.attributes},
        icon: icon(m.icon),
        name: m.name,
        label: m.label,
        root: m.root
      }));
  }

  /**
   * Gets configured mountpoints
   * @return {FilesystemMountpoint[]}
   */
  _getConfiguredMountpoints() {
    const list = [
      ...this.core.config('vfs.mountpoints', []),
      ...(this.options.mounts || [])
    ];

    return list
      .map(mount => {
        try {
          return this.createMountpoint(mount);
        } catch (e) {
          logger.warn('Error while creating mountpoint', e);
        }

        return null;
      })
      .filter((mount, pos, arr) => {
        const index = arr.findIndex(item => item.label === mount.label || item.root === mount.label);
        if (index === pos) {
          return true;
        }

        logger.warn('Removed duplicate mountpoint', mount);
        return false;
      })
      .filter(mount => mount !== null);
  }
}
