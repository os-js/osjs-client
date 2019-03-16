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

/**
 * A Tray Icon ("Entry")
 * @property {Object} entry The given entry data
 * @property {Function} update Updates entry with given data
 * @property {Function} destroy Destroy the entry
 * @typedef TrayEntry
 */

/**
 * Tray Handler
 *
 * @desc Handles OS.js Tray Icons
 */
export default class Tray {

  /**
   * Creates the Tray Handler
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * All Tray entries
     * @type {TrayEntry[]}
     */
    this.entries = [];
  }

  destroy() {
    this.entries = [];
  }

  /**
   * Creates a new Tray entry
   * @param {object} options Options
   * @param {string} [options.icon] Icon source
   * @param {string} [options.title] The title and tooltip
   * @param {Function} [options.onclick] The callback function for clicks
   * @param {Function} [options.oncontextmenu] The callback function for contextmenu
   * @param {Function} [handler] The callback function for all events
   * @return {TrayEntry}
   */
  create(options, handler) {
    const defaultTitle = this.core.make('osjs/locale')
      .translate('LBL_TRAY');

    handler = handler || (() => {});

    const entry = Object.assign({}, {
      icon: require('./styles/logo-blue-32x32.png'),
      title: defaultTitle,
      onclick: handler,
      oncontextmenu: handler,
      handler
    }, options);

    console.debug('Created new tray entry', entry);

    this.entries.push(entry);

    this.core.emit('osjs/tray:create', entry);
    this.core.emit('osjs/tray:update', this.entries);

    const obj = {
      entry,
      update: u => {
        Object.keys(u).forEach(k => (entry[k] = u[k]));

        this.core.emit('osjs/tray:update', this.entries);
      },
      destroy: () => this.remove(entry)
    };

    return obj;
  }

  /**
   * Removes a Tray entry
   * @param {TrayEntry} entry The tray entry
   */
  remove(entry) {
    const foundIndex = this.entries.findIndex(e => e === entry);
    if (foundIndex !== -1) {
      this.entries.splice(foundIndex, 1);

      this.core.emit('osjs/tray:remove', entry);
      this.core.emit('osjs/tray:update', this.entries);
    }
  }

}
