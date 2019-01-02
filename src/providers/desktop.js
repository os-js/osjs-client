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
import Desktop from '../desktop';

/**
 * OS.js Desktop Service Provider
 *
 * @desc Provides desktop features
 */
export default class DesktopServiceProvider extends ServiceProvider {

  constructor(core, options = {}) {
    super(core, options || {});

    this.desktop = null;
  }

  destroy() {
    this.desktop = this.desktop.destroy();
  }

  /**
   * Get a list of services this provider registers
   */
  provides() {
    return [
      'osjs/desktop'
    ];
  }

  init() {
    this.desktop = new Desktop(this.core, this.options);
    this.desktop.init();

    this.core.singleton('osjs/desktop', () => ({
      addContextMenuEntries: entries => this.desktop.addContextMenu(entries),
      applySettings: settings => this.desktop.applySettings(settings),
      getRect: () => this.desktop.getRect()
    }));

    this.core.on('osjs/core:started', () => {
      this.desktop.applySettings();
    });
  }

  start() {
    this.desktop.start();
  }
}
