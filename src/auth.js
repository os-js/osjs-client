/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
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
import Cookies from 'js-cookie';
import Login from './login';
import serverAuth  from './adapters/auth/server';
import localStorageAuth from './adapters/auth/localstorage';
import logger from './logger';

const defaultAdapters = {
  server: serverAuth,
  localStorage: localStorageAuth
};

const createUi = (core, options) => {
  const defaultUi = core.config('auth.ui', {});

  return options.login
    ? options.login(core, options.config || {})
    : new Login(core, options.ui || defaultUi);
};

const createAdapter = (core, options) => {
  const adapter = core.config('standalone')
    ? localStorageAuth
    : typeof options.adapter === 'function'
      ? options.adapter
      : defaultAdapters[options.adapter || 'server'];

  return {
    login: () => Promise.reject(new Error('Not implemented')),
    logout: () => Promise.reject(new Error('Not implemented')),
    register: () => Promise.reject(new Error('Not implemented')),
    init: () => Promise.resolve(true),
    destroy: () => {},
    ...adapter(core, options.config || {})
  };
};

/**
 * TODO: typedef
 * @typedef {Object} AuthAdapter
 */

/**
 * TODO: typedef
 * @typedef {Object} AuthAdapterConfig
 */

/**
 * @typedef {Object} AuthForm
 * @property {string} [username]
 * @property {string} [password]
 */

/**
 * @callback AuthAdapterCallback
 * @param {Core} core
 * @return {AuthAdapter}
 */

/**
 * @callback LoginAdapterCallback
 * @param {Core} core
 * @return {Login}
 */

/**
 * @callback AuthCallback
 * @param {AuthForm} data
 * @return {boolean}
 */

/**
 * @typedef {Object} AuthSettings
 * @property {AuthAdapterCallback|AuthAdapter} [adapter] Adapter to use
 * @property {LoginAdapterCallback|Login} [login] Login Adapter to use
 * @property {AuthAdapterConfig} [config] Adapter configuration
 */

/**
 * Handles Authentication
 */
export default class Auth {

  /**
   * @param {Core} core OS.js Core instance reference
   * @param {AuthSettings} [options={}] Auth Options
   */
  constructor(core, options = {}) {
    /**
     * Authentication UI
     * @type {Login}
     * @readonly
     */
    this.ui = createUi(core, options);

    /**
     * Authentication adapter
     * @type {AuthAdapter}
     * @readonly
     */
    this.adapter = createAdapter(core, options);

    /**
     * Authentication callback function
     * @type {AuthCallback}
     * @readonly
     */
    this.callback = function() {};

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;
  }

  /**
   * Initializes authentication handler
   */
  init() {
    this.ui.on('login:post', values => this.login(values));
    this.ui.on('register:post', values => this.register(values));

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
   * @param {boolean} [reload] Reload afterwards
   */
  shutdown(reload) {
    try {
      this.core.destroy();
    } catch (e) {
      logger.warn('Exception on destruction', e);
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
   * @param {AuthCallback} cb Authentication callback
   * @return {Promise<boolean>}
   */
  show(cb) {
    const login = this.core.config('auth.login', {});
    const autologin = login.username && login.password;
    const settings = this.core.config('auth.cookie');

    this.callback = cb;
    this.ui.init(autologin);

    if (autologin) {
      return this.login(login);
    } else if (settings.enabled) {
      const cookie = Cookies.get(settings.name);
      console.warn(cookie);
      if (cookie) {
        return this.login(JSON.parse(cookie));
      }
    }

    return Promise.resolve(true);
  }

  /**
   * Performs a login
   * @param {AuthForm} values Form values as JSON
   * @return {Promise<boolean>}
   */
  login(values) {
    this.ui.emit('login:start');

    return this.adapter
      .login(values)
      .then(response => {
        if (response) {
          const settings = this.core.config('auth.cookie');
          if (settings.enabled) {
            Cookies.set(settings.name, JSON.stringify(values), {
              expires: settings.expires,
              sameSite: 'strict'
            });
          } else {
            Cookies.remove(settings.name);
          }

          this.ui.destroy();
          this.callback(response);

          this.core.emit('osjs/core:logged-in');
          this.ui.emit('login:stop', response);

          return true;
        }

        return false;
      })
      .catch(e => {
        if (this.core.config('development')) {
          logger.warn('Exception on login', e);
        }

        this.ui.emit('login:error', 'Login failed', e);
        this.ui.emit('login:stop');

        return false;
      });
  }

  /**
   * Performs a logout
   * @param {boolean} [reload=true] Reload client afterwards
   * @return {Promise<boolean>}
   */
  logout(reload = true) {
    return this.adapter.logout(reload)
      .then(response => {
        if (!response) {
          return false;
        }

        const settings = this.core.config('auth.cookie');
        Cookies.remove(settings.name);

        this.shutdown(reload);

        return true;
      });
  }

  /**
   * Performs a register call
   * @param {AuthForm} values Form values as JSON
   * @return {Promise<*>}
   */
  register(values) {
    this.ui.emit('register:start');

    return this.adapter
      .register(values)
      .then(response => {
        if (response) {
          this.ui.emit('register:stop', response);

          return response;
        }

        return false;
      })
      .catch(e => {
        if (this.core.config('development')) {
          logger.warn('Exception on registration', e);
        }

        this.ui.emit('register:error', 'Registration failed');
        this.ui.emit('register:stop');

        return false;
      });
  }
}
