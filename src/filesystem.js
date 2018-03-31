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

/*
 * Factory for request (transports)
 */
const createRequest = core => async (fn, body, fetchOptions = {}, type) => {
  const url = core.url(`/vfs/${fn}`);
  const response = await core.request(url, Object.assign({
    body
  }, fetchOptions), type);

  if (type === 'json') {
    return {mime: 'application/json', body: response};
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const result = await response.arrayBuffer();

  return {mime: contentType, body: result};
};

/*
 * Creates given mountpoint
 */
const createMountpoint = (core, props) => {
  const request = createRequest(core);
  const transport = Object.keys(VFS)
    .reduce((result, method) => Object.assign(result, {
      [method]: (...args) => {
        core.emit(`osjs/vfs:${method}`, ...args);

        return VFS[method](request)(...args);
      }
    }), {});

  return Object.assign({
    transport,
    mouted: true,
    attributes: {
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
   */
  constructor(core) {
    super('Filesystem');

    this.core = core;
    this.mounts = [
      createMountpoint(this.core, {
        name: 'osjs',
        label: 'OS.js',
      })
    ];
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
