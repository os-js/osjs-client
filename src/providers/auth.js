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
import Login from '../login';

const serverAuth = (core, options) => {
  const request = (endpoint, params = {}) => core.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(params)
  }, 'json');

  return {
    login: (values) => request('/login', values),
    logout: () =>  request('/logout')
  };
};

const localStorageAuth = (core, options) => ({
  login: (values) => Promise.resolve(values)
});

const defaultAdapters = {
  server: serverAuth,
  localStorage: localStorageAuth
};

/**
 * OS.js Auth Service Provider
 *
 * @desc Creates the login prompt and handles authentication flow
 */
export default class AuthServiceProvider extends ServiceProvider {

  /**
   * @param {Object} core OS.js Core
   * @param {Object} [args] Arguments
   * @param {Object} [args.ui] Options for default login UI adapter
   * @param {Function} [args.adapter] Custom login adapter
   * @param {Function} [args.login] Custom UI
   * @param {Object} [args.config] Configuration object to be passed on
   */
  constructor(core, args = {}) {
    super(core);

    const defaultUi = core.config('auth.ui', {});

    const adapter = core.config('standalone')
      ? localStorageAuth
      : typeof args.adapter === 'function'
        ? args.adapter
        : defaultAdapters[args.adapter || 'server'];

    this.ui = args.login
      ? args.login(core, args.config || {})
      : new Login(core, args.ui || defaultUi);

    this.adapter = Object.assign({
      login: () => Promise.reject(new Error('Not implemented')),
      logout: () => Promise.reject(new Error('Not implemented')),
      init: () => Promise.resolve(true),
      destroy: () => {}
    }, adapter(core, args.config || {}));

    this.callback = function() {};
  }

  /**
   * Initializes authentication
   */
  init() {
    this.core.singleton('osjs/auth', () => ({
      show: (cb) => this.show(cb),
      login: (values) => this.login(values),
      logout: (reload) => this.logout(reload),
      user: () => this.core.getUser()
    }));

    this.ui.on('login:post', values => this.login(values));

    return this.adapter.init();
  }

  /**
   * Destroys authentication
   */
  destroy() {
    this.ui.destroy();

    return super.destroy();
  }

  /**
   * Get a list of services this provider registers
   */
  provides() {
    return [
      'osjs/auth'
    ];
  }

  /**
   * Shows Login UI
   */
  show(cb) {
    const login = this.core.config('auth.login', {});
    const autologin = login.username && login.password;

    this.callback = cb;
    this.ui.init(autologin);

    if (autologin) {
      this.login(login);
    }
  }

  /**
   * Performs a login
   */
  async login(values) {
    this.ui.emit('login:start');

    try {
      const response = await this.adapter.login(values);
      if (!response) {
        return false;
      }


      this.ui.destroy();
      this.callback(response);

      this.core.emit('osjs/core:logged-in');

      return true;
    } catch (e) {
      if (this.core.config('development')) {
        console.warn('Exception on login', e);
      }

      this.ui.emit('login:error', 'Login failed');

      return false;
    } finally {
      this.ui.emit('login:stop');
    }
  }

  /**
   * Performs a logout
   */
  async logout(reload = true) {
    const response = await this.adapter.logout(reload);
    if (!response) {
      return;
    }

    try {
      this.core.destroy();
    } catch (e) {
      console.warn('Exception on logout', e);
    }

    this.core.emit('osjs/core:logged-out');

    if (reload) {
      setTimeout(() => {
        window.location.reload();
        // FIXME Reload, not refresh
        // this.core.boot();
      }, 1);
    }
  }

}
