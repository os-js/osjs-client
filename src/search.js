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
import Window from './window';
import createUI from './adapters/ui/search';

/**
 * Search Service
 */
export default class Search {
  constructor(core) {
    this.core = core;
    this.ui = null;
    this.focusLastWindow = null;
    this.$element = document.createElement('div');
  }

  destroy() {
    if (this.ui) {
      this.ui.destroy();
    }
  }

  /**
   * Initializes Search Service
   */
  init() {
    const {icon} = this.core.make('osjs/theme');
    const _ = this.core.make('osjs/locale').translate;

    this.$element.className = 'osjs-search';
    this.core.$root.appendChild(this.$element);

    this.core.make('osjs/tray').create({
      title: _('LBL_SEARCH_TOOLTOP', 'F3'),
      icon: icon('system-search.png')
    }, () => this.show());

    this.ui = createUI(this.core, this.$element);
    this.ui.on('hide', () => this.hide());
    this.ui.on('open', iter => this.core.open(iter));
    this.ui.on('search', query => {
      this.search(query)
        .then(results => this.ui.emit('success', results))
        .catch(error => this.ui.emit('error', error));
    });
  }

  /**
   * Performs a search across all mounts
   * @param {string} pattern Search query
   * @return {Promise<FileMetadata[], Error>}
   */
  search(pattern) {
    const vfs = this.core.make('osjs/vfs');
    const promises = this.core.make('osjs/fs')
      .mountpoints()
      .map(mount => `${mount.name}:/`)
      .map(path => {
        return vfs.search({path}, pattern)
          .catch(error => {
            console.warn('Error while searching', error);
            return [];
          });
      });

    return Promise.all(promises)
      .then(lists => [].concat(...lists));
  }

  /**
   * Focuses UI
   */
  focus() {
    if (this.ui) {
      this.ui.emit('focus');
    }
  }

  /**
   * Hides UI
   */
  hide() {
    if (this.ui) {
      this.ui.emit('toggle', false);

      const win = Window.lastWindow();
      if (this.focusLastWindow && win) {
        win.focus();
      }
    }
  }

  /**
   * Shows UI
   */
  show() {
    if (this.ui) {
      const win = Window.lastWindow();

      this.focusLastWindow = win && win.blur();

      this.ui.emit('toggle', true);
      setTimeout(() => this.focus(), 1);
    }
  }
}
