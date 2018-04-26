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

import Login from './login';

/**
 * Authentication Handler
 *
 * @desc Handles Authentication
 */
export default class Auth {

  /**
   * Create authentication handler
   *
   * @param {Core} core Core reference
   * @param {Object} [options] Options
   * @param {String} [options.ui] UI Options
   */
  constructor(core, options = {}) {
    this.core = core;
    this.options = Object.assign({
      ui: {}
    }, options);

    this.ui = new Login(core, this.options.ui);
  }

  /**
   * Initializes authenication handler
   *
   * @desc Shows the login screen etc
   */
  init() {
    this.ui.on('login:post', values => this.login(values));

    this.ui.init();

    const login = this.core.config('auth.login', {});
    if (login.username && login.password) {
      this.login(login);
    }
  }

  async _login(fn) {
    this.ui.emit('login:start');

    try {
      const response = await fn();
      if (!response) {
        return false;
      }

      this.ui.destroy();
      this.core.user = response.user;
      this.core.start();

      return true;
    } catch (e) {
      if (this.core.config('development')) {
        console.warn(e);
      }

      this.ui.emit('login:error', 'Login failed');

      return false;
    } finally {
      this.ui.emit('login:stop');
    }
  }

  async _logout(fn, reload) {
    const response = await fn();
    if (!response) {
      return;
    }

    this.core.destroy();

    // FIXME
    if (reload) {
      setTimeout(() => window.location.reload(), 1);
    }
  }

  /**
   * Perform login
   * @param {Object} values Values from form
   * @return {Boolean}
   */
  async login(values) {
    this.ui.emit('login:error', 'No login adapter');
    return false;
  }

}
