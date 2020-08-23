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
 * @license Simplified BSD License
 */

import {ServiceProvider} from '@osjs/common';
import Auth from '../auth';

/**
 * Auth Service Contract
 * TODO: typedef
 * @typedef {Object} AuthProviderContract
 * @property {Function} show
 * @property {Function} login
 * @property {Function} logout
 * @property {Function} user
 */

/**
 * Auth Service Options
 * @typedef {Object} AuthServiceOptions
 */

/**
 * OS.js Auth Service Provider
 *
 * Creates the login prompt and handles authentication flow
 */
export default class AuthServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {AuthServiceOptions} [options={}]
   */
  constructor(core, options = {}) {
    super(core);

    /**
     * @type {Auth}
     * @readonly
     */
    this.auth = new Auth(core, options);
  }

  /**
   * Initializes authentication
   * @return {Promise<undefined>}
   */
  init() {
    this.core.singleton('osjs/auth', () => this.createAuthContract());

    return this.auth.init();
  }

  /**
   * Destroys authentication
   */
  destroy() {
    this.auth.destroy();

    return super.destroy();
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/auth'
    ];
  }

  /**
   * @return {AuthProviderContract}
   */
  createAuthContract() {
    return {
      show: (cb) => this.auth.show(cb),
      login: (values) => this.auth.login(values),
      logout: (reload) => this.auth.logout(reload),
      user: () => this.core.getUser()
    };
  }
}
