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

import merge from 'deepmerge';
import simplejsonconf from 'simplejsonconf';
import localStorageSettings from './adapters/settings/localstorage';
import serverSettings from './adapters/settings/server';

const defaultAdapters = {
  server: serverSettings,
  localStorage: localStorageSettings
};

/**
 * OS.js Settings Manager
 */
export default class Settings {

  constructor(core, args) {
    const adapter = core.config('standalone')
      ? localStorageSettings
      : typeof args.adapter === 'function'
        ? args.adapter
        : defaultAdapters[args.adapter || 'localStorage'];

    this.adapter = Object.assign({
      load: () => Promise.reject(new Error('Not implemented')),
      save: () => Promise.reject(new Error('Not implemented')),
      init: () => Promise.resolve(true),
      clear: () => Promise.resolve(true),
      destroy: () => {}
    }, adapter(core, args.config));

    /**
     * Internal timeout reference used for debouncing
     * @type {object}
     */
    this.debounce = null;

    /**
     * The settings tree
     * @type {Map<string, any>}
     */
    this.settings = {};

    this.core = core;
  }

  init() {
    return this.adapter.init();
  }

  /**
   * Saves settings
   * @return {Promise<boolean,  Error>}
   */
  save() {
    return new Promise((resolve, reject) => {
      if (this.debounce) {
        const [promise, timer] = this.debounce;
        promise.resolve(false);
        this.debounce = clearTimeout(timer);
      }

      this.debounce = [
        {resolve, reject},
        setTimeout(() => {
          this.adapter.save(this.settings)
            .then((...args) => {
              this.core.emit('osjs/settings:save');

              resolve(...args);
            }).catch(reject);
        }, 100)
      ];
    });
  }

  /**
   * Loads settings
   * @return {Promise<boolean,  Error>}
   */
  load() {
    this.core.emit('osjs/settings:load');

    const defaults = this.core.config('settings.defaults', {});

    return this.adapter.load()
      .then(settings => {
        this.settings = merge(defaults, settings, {
          arrayMerge: (dest, source) => source
        });

        return true;
      }).catch(e => {
        console.warn('Failed to set settings', e);
        this.settings = defaults;

        return false;
      });
  }

  /**
   * Gets a settings entry by key
   *
   * @desc Gets a setting (from cache)
   * @param {string} [ns] The namespace
   * @param {string} [key] The key to get the value from
   * @param {*} [defaultValue] If result is undefined, return this instead
   * @return {*}
   */
  get(ns, key, defaultValue) {
    if (typeof ns === 'undefined') {
      return Object.assign({}, this.settings);
    } else if (typeof this.settings[ns] === 'undefined') {
      return key ? defaultValue : {};
    }

    const tree = simplejsonconf(this.settings[ns]);

    return key
      ? tree.get(key, defaultValue)
      : tree.get() || defaultValue;
  }

  /**
   * Sets a settings entry by root key.
   * @desc Sets a setting, but does not save.
   * @param {string} ns The namespace
   * @param {string} [key] The key to set
   * @param {*} value The value to set
   * @return {Settings} This
   */
  set(ns, key, value) {
    const lock = this.core.config('settings.lock', []);
    if (lock.indexOf(ns) !== -1) {
      return this;
    }

    if (typeof this.settings[ns] === 'undefined') {
      this.settings[ns] = {};
    }

    if (key) {
      try {
        const sjc = simplejsonconf(this.settings[ns]);
        sjc.set(key, value);
        this.settings[ns] = sjc.get();
      } catch (e) {
        console.warn('Error while setting settings for', key, e);
      }
    } else {
      this.settings[ns] = Object.assign({}, value);
    }

    return this;
  }

  /**
   * Clears a namespace by root key
   * @param {string} ns The namespace
   * @return {Promise<boolean, Error>}
   */
  clear(ns) {
    return this.adapter.clear(ns)
      .then(result => {
        if (result && this.settings[ns]) {
          delete this.settings[ns];
        }

        return result;
      });
  }

}
