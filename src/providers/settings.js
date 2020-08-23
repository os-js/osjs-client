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
import Settings from '../settings';

/**
 * Settings Service Contract
 * TODO: typedef
 * @typedef {Object} SettingsProviderContract
 * @property {Function} save
 * @property {Function} load
 * @property {Function} clear
 * @property {Function} set
 * @property {Function} get
 */

/**
 * TODO: typedef
 * @typedef {Object} SettingsServiceOptions
 * @property {Object} [config]
 */

/**
 * OS.js Settings Service Provider
 */
export default class SettingsServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {SettingsServiceOptions} [options={}]
   */
  constructor(core, options = {}) {
    super(core);

    /**
     * @type {Settings}
     * @readonly
     */
    this.settings = new Settings(core, {
      config: {},
      ...options
    });
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/settings'
    ];
  }

  /**
   * Initializes settings
   * @return {Promise<undefined>}
   */
  init() {
    this.core.singleton('osjs/settings', () => this.createSettingsContract());

    return this.settings.init();
  }

  /**
   * @return {SettingsProviderContract}
   */
  createSettingsContract() {
    return {
      save: () => this.settings.save(),
      load: () => this.settings.load(),
      clear: (ns) => this.settings.clear(ns),
      get: (ns, key, defaultValue) => this.settings.get(ns, key, defaultValue),
      set: (ns, key, value) => this.settings.set(ns, key, value)
    };
  }
}
