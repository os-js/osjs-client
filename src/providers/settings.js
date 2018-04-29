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

import {ServiceProvider} from '@osjs/common';
import {resolveTreeByKey} from '../utils/config';

const serverSettings = core => ({
  save: settings => core.request(core.url('/settings'), {
    method: 'post',
    body: settings
  }, 'json'),

  load: () => core.request(core.url('/settings'), {
    method: 'get'
  }, 'json')
});

const localStorageSettings = core => ({
  save: settings => {
    Object.keys(settings).forEach((k) => {
      localStorage.setItem(k, JSON.stringify(settings[k]));
    });

    return Promise.resolve(true);
  },

  load: () => Promise.resolve(Object.keys(localStorage).reduce((o, v) => {
    let value = localStorage.getItem(v);
    try {
      value = JSON.parse(value);
    } catch (e) {
      console.warn('localStorageAdapter parse error', e);
    }

    return Object.assign(o, {[v]: value});
  }, {}))
});

const defaultAdapters = {
  server: serverSettings,
  localStorage: localStorageSettings
};

/**
 * OS.js Settings Service Provider
 *
 * @desc Provides services for settings
 */
export default class SettingsServiceProvider extends ServiceProvider {

  constructor(core, args = {}) {
    args = Object.assign({
      config: {}
    }, args);

    super(core);

    const adapter = core.config('standalone')
      ? localStorageSettings
      : typeof args.adapter === 'function'
        ? args.adapter
        : defaultAdapters[args.adapter || 'localStorage'];

    this.adapter = Object.assign({
      load: () => Promise.reject(new Error('Not implemented')),
      save: () => Promise.reject(new Error('Not implemented')),
      init: () => Promise.resolve(true),
      destroy: () => {}
    }, adapter(core, args.config));


    /**
     * Internal timeout reference used for debouncing
     * @type {Object}
     */
    this.debounce = null;

    /**
     * The settings tree
     * @type {Object}
     */
    this.settings = {};
  }

  async init() {
    this.core.singleton('osjs/settings', () => ({
      save: () => this.save(),
      load: () => this.load(),
      get: (...args) => this.get(...args),
      set: (...args) => this.set(...args)
    }));

    await this.adapter.init();
  }

  /**
   * Saves settings
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
   */
  async load() {
    this.core.emit('osjs/settings:load');

    const defaults = this.core.config('settings.defaults', {});

    try {
      const settings = await this.adapter.load();

      this.settings = Object.assign({}, defaults, settings);
    } catch (e) {
      console.warn('Failed to set settings', e);
      this.settings = defaults;
    }

    return true;
  }

  /**
   * Gets a settings entry by key
   *
   * @param {String} key The key to get the value from
   * @param {*} [defaultValue] If result is undefined, return this instead
   * @see {resolveTreeByKey}
   * @return {*}
   */
  get(key, defaultValue) {
    return key
      ? resolveTreeByKey(this.settings, key, defaultValue)
      : Object.assign({}, this.settings);
  }

  /**
   * Sets a settings entry by root key
   * @param {String} key The key to set
   * @param {*} value The value to set
   * @return {Settings} This
   */
  set(key, value) {
    this.settings[key] = value;

    return this;
  }

}
