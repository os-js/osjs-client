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
import Login from './login';
import serverAuth  from './adapters/auth/server';
import localStorageAuth from './adapters/auth/localstorage';

/**
 * Handles Authentication
 */
export default class Auth {

  /**
   * @param {Core} core OS.js Core instance reference
   * @param {object} [args.ui] Options for default login UI adapter
   * @param {Function} [args.adapter] Custom login adapter
   * @param {Function} [args.login] Custom UI
   * @param {object} [args.config] Configuration object to be passed on
   */
  constructor(core, args = {}) {
    const defaultUi = core.config('auth.ui', {});

    const defaultAdapters = {
      server: serverAuth,
      localStorage: localStorageAuth
    };

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
    this.core = core;
  }

  /**
   * Initializes authentication handler
   */
  init() {
    this.ui.on('login:post', values => this.login(values));

    return this.adapter.init();
  }

  /**
   * Destroy authentication handler
   */
  destroy() {
    this.ui.destroy();
  }

  /**
   * Run the shutdown procedure
   */
  shutdown(reload) {
    try {
      this.core.destroy();
    } catch (e) {
      console.warn('Exception on destruction', e);
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

  /**
   * Shows Login UI
   * @return {Promise<boolean, Error>}
   */
  show(cb) {
    const login = this.core.config('auth.login', {});
    const autologin = login.username && login.password;

    this.callback = cb;
    this.ui.init(autologin);

    if (autologin) {
      return this.login(login);
    }

    return Promise.resolve(true);
  }

  /**
   * Performs a login
   * @param {object} values Form values as JSON
   */
  login(values) {
    this.ui.emit('login:start');

    return this.adapter
      .login(values)
      .then(response => {
        if (response) {
          this.ui.destroy();
          this.callback(response);

          this.core.emit('osjs/core:logged-in');
          this.ui.emit('login:stop');

          return true;
        }

        return false;
      })
      .catch(e => {
        if (this.core.config('development')) {
          console.warn('Exception on login', e);
        }

        this.ui.emit('login:error', 'Login failed');
        this.ui.emit('login:stop');

        return false;
      });
  }

  /**
   * Performs a logout
   * @param {boolean} [reload=true] Reload client afterwards
   */
  logout(reload = true) {
    return this.adapter.logout(reload)
      .then(response => {
        if (!response) {
          return false;
        }

        this.shutdown(reload);

        return true;
      });
  }
}
