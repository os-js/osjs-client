/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2020, Anders Evenrud <andersevenrud@gmail.com>
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

import {ServiceProvider} from '@osjs/common';
import Filesystem from '../filesystem';
import * as utils from '../utils/vfs';

/**
 * Filesytem Service Contract
 * TODO: typedef
 * @typedef {Object} VFSServiceFilesystemContract
 * @property {Function} basename
 * @property {Function} pathname
 * @property {Function} pathJoin
 * @property {Function} icon
 * @property {Function} mountpoints
 * @property {Function} mount
 * @property {Function} unmount
 */

/**
 * VFS Service Contract
 * TODO: typedef
 * @typedef {Object} VFSServiceContract
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
 */

/**
 * VFS Service Options
 * @typedef {Object} VFSServiceOptions
 * @property {{name: FilesystemAdapter}} [adapters={}]
 * @property {FilesystemMountpoint[]} [mountpoints=[]]
 */

/**
 * OS.js Virtual Filesystem Service Provider
 */
export default class VFSServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {VFSServiceOptions} [options={}]
   */
  constructor(core, options = {}) {
    super(core);

    /**
     * @type {Filesystem}
     * @readonly
     */
    this.fs = new Filesystem(core, {
      adapters: options.adapters || {},
      mounts: options.mounts || []
    });
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/vfs',
      'osjs/fs'
    ];
  }

  /**
   * Initializes VFS providers
   * @return {Promise<undefined>}
   */
  init() {
    this.core.singleton('osjs/vfs', () => this.createVFSContract());
    this.core.singleton('osjs/fs', () => this.createFilesystemContract());

    return this.fs.mountAll(false);
  }

  /**
   * @return {VFSServiceContract}
   */
  createVFSContract() {
    return this.fs.request();
  }

  /**
   * @return {VFSServiceFilesystemContract}
   */
  createFilesystemContract() {
    const iconMap = this.core.config('vfs.icons', {});
    const icon = utils.getFileIcon(iconMap);

    return {
      basename: p => utils.basename(p),
      pathname: p => utils.pathname(p),
      pathJoin: (...args) => utils.pathJoin(...args),
      icon: icon,
      mountpoints: (all = false) => this.fs.getMounts(all),
      mount: name => this.fs.mount(name),
      unmount: name => this.fs.unmount(name)
    };
  }
}
