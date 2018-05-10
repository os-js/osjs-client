/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
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
import {EventHandler} from '@osjs/common';
import systemAdapter from './vfs/system';
import merge from 'deepmerge';

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
  unmount: options => Promise.resolve(true)
});

/**
 * VFS Mountpoint
 * @param {String} name Name
 * @param {String} label Label
 * @param {String} adapter Adater name
 * @typedef Mountpoint
 */

/*
 * Gets mountpoint from a path
 */
const getMountpointFromPath = (mounts, path) => {
  const re = /^(\w+):(.*)/;
  const match = String(path).replace(/\+/g, '/').match(re);
  const [prefix] = Array.from(match || []).slice(1);

  if (!prefix) {
    throw new Error(`Given path '${path}' does not match 'name:/path'`);
  }

  const found = mounts.find(m => m.name === prefix);

  if (!found) {
    throw new Error(`Mountpoint for '${prefix}:' not found`);
  }

  return found;
};

/*
 * Creates given mountpoint
 */
const createMountpoint = (core, adapters, props) => {
  const name = props.adapter || 'system'; // FIXME
  const adapter = Object.assign({}, defaultAdapter, adapters[name](core));

  const result = merge({
    mounted: false,
    adapter: name,
    attributes: {
      local: true,
      readOnly: false
    }
  }, props);

  result._adapter = adapter;
  if (!result.label) {
    result.label = result.name || name;
  }

  return result;
};

/**
 * Filesystem Manager
 *
 * @desc Class that manages filesystems
 */
export default class Filesystem extends EventHandler {

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
      system: systemAdapter
    }, this.core.config('vfs.adapters', {}), options.adapters);

    /**
     * Mountpoints
     * @type {Mountpoint[]}
     */
    this.mounts = this.core.config('vfs.mountpoints')
      .concat(options.mounts) // TODO: Unique
      .map(mount => createMountpoint(this.core, this.adapters, mount));

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
    return mountpoint._adapter.mount()
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
    return mountpoint._adapter.unmount()
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
        if (!found) {
          throw new Error(`Filesystem '${name}' not found`);
        } else if (found.mounted) {
          throw new Error(`Filesystem '${name}' already mounted`);
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
        if (!found) {
          throw new Error(`Filesystem '${name}' not found`);
        } else if (!found.mounted) {
          throw new Error(`Filesystem '${name}' not mounted`);
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
    // TODO: 'rename' and 'copy' between adapters
    const [path] = args;
    const mount = getMountpointFromPath(this.mounts, path);

    this.core.emit(`osjs/vfs:${method}`, ...args);

    return VFS[method](mount._adapter)(...args);
  }

  /**
   * Gets all mountpoints
   * @return {Object[]}
   */
  getMounts(all = false) {
    return this.mounts
      .filter(m => all || m.mounted)
      .map(m => ({
        name: m.name,
        label: m.label
      }));
  }

}
