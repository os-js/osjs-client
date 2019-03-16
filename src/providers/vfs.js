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

import {ServiceProvider} from '@osjs/common';
import Filesystem from '../filesystem';
import * as utils from '../utils/vfs';

/**
 * OS.js Virtual Filesystem Service Provider
 *
 * @desc Provides methods to interact with filesystems
 */
export default class VFSServiceProvider extends ServiceProvider {
  constructor(core, args = {}) {
    super(core);

    this.fs = new Filesystem(core, {
      adapters: args.adapters || {},
      mounts: args.mounts || []
    });
  }

  /**
   * Get a list of services this provider registers
   */
  provides() {
    return [
      'osjs/vfs',
      'osjs/fs'
    ];
  }

  init() {
    this.core.singleton('osjs/vfs', () => this.fs.request());

    const iconMap = this.core.config('vfs.icons', {});
    const icon = utils.getFileIcon(iconMap);

    this.core.singleton('osjs/fs', () => ({
      pathJoin: (...args) => utils.pathJoin(...args),
      icon: icon,
      mountpoints: (...args) => this.fs.getMounts(...args),
      mount: (...args) => this.fs.mount(...args),
      unmount: (...args) => this.fs.unmount(...args)
    }));

    return this.fs.mountAll(false);
  }
}
