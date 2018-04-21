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

import * as VFS from './vfs';
import EventHandler from './event-handler';
import SystemTransport from './vfs/transports/system';

/**
 * VFS Mountpoint
 * @param {String} name Name
 * @param {String} label Label
 * @param {String} transport Transport name
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
const createMountpoint = (core, transports, props) => {
  const name = props.transport || 'system'; // FIXME
  const transport = new transports[name](core);

  return Object.assign({
    _transport: transport,
    mouted: true,
    attributes: {
      local: true,
      readOnly: false
    }
  }, props);
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
   * @param {Map<String,Transport>} [options.transports] Transport registry
   * @param {Mountpoint[]} [options.mounts] Mountpoints
   */
  constructor(core, options = {}) {
    options = Object.assign({}, {
      transports: {},
      mounts: []
    }, options);

    super('Filesystem');

    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * Transport registry
     * @type {Map<String, Transport>}
     */
    this.transports = Object.assign({}, {
      system: SystemTransport
    }, this.core.config('vfs.transports', {}), options.transports);

    /**
     * Mountpoints
     * @type {Mountpoint[]}
     */
    this.mounts = this.core.config('vfs.mountpoints')
      .concat(options.mounts) // TODO: Unique
      .map(mount => createMountpoint(this.core, this.transports, mount));

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
   * Mount given filesystem
   * @param {String} name Filesystem name
   * @throws {Error} On invalid name or if already mounted
   */
  async mount(name) {
    const found = this.mounts.find(m => m.name === name);
    if (!found) {
      throw new Error(`Filesystem '${name}' not found`);
    }
    if (found.mounted) {
      throw new Error(`Filesystem '${name}' already mounted`);
    }

    // TODO
    found.mounted = true;
    this.emit('mounted', found);
    this.core.emit('osjs/fs:mount');
  }

  /**
   * Unmount given filesystem
   * @param {String} name Filesystem name
   * @throws {Error} On invalid name or if already unmounted
   */
  async unmount() {
    const found = this.mounts.find(m => m.name === name);
    if (!found) {
      throw new Error(`Filesystem '${name}' not found`);
    }
    if (!found.mounted) {
      throw new Error(`Filesystem '${name}' already unmounted`);
    }

    // TODO
    found.mounted = false;
    this.emit('unmounted', found);
    this.core.emit('osjs/fs:unmount');
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
    // TODO: 'rename' and 'copy' between transports
    const [path] = args;
    const mount = getMountpointFromPath(this.mounts, path);

    this.core.emit(`osjs/vfs:${method}`, ...args);

    return VFS[method](mount._transport)(...args);
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
