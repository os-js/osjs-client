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

import Application from './application';
import Websocket from './websocket';
import Splash from './splash';
import {CoreBase} from '@osjs/common';
import {defaultConfiguration} from './config';
import {fetch} from './utils/fetch';

/**
 * Core
 *
 * @desc Main class for OS.js service providers and bootstrapping.
 */
export default class Core extends CoreBase {

  /**
   * Create core instance
   * @param {Object} config Configuration tree
   * @param {Object} [options] Options
   * @param {Element} [options.root] The root DOM element for elements
   * @param {Element} [options.resourceRoot] The root DOM element for resources
   * @param {String[]} [options.classNames] List of class names to apply to root dom element
   */
  constructor(config, options = {}) {
    options = Object.assign({}, {
      classNames: ['osjs-root'],
      root: document.body
    }, options || {});

    super(defaultConfiguration, config, options);

    this.user = null;
    this.ws = null;
    this.ping = null;
    this.splash = new Splash(this);
    this.$root = options.root;
    this.$resourceRoot = options.resourceRoot || document.querySelector('head');
    this.requestOptions = {};

    this.options.classNames.forEach(n => this.$root.classList.add(n));

    const {uri} = this.configuration.ws;
    if (!this.configuration.ws.uri.match(/^wss?:/)) {
      const {protocol, host} = window.location;

      this.configuration.ws.uri = protocol.replace(/^http/, 'ws') + '//' + host + uri.replace(/^\/+/, '/');
    }
  }

  /**
   * Destroy core instance
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.emit('osjs/core:destroy');

    this.ping = clearInterval(this.ping);

    Application.destroyAll();

    if (this.ws) {
      this.ws.close();
    }

    this.user = null;
    this.ws = null;
    this.connecting = false;
    this.connectfailed = false;
    this.ping = null;

    super.destroy();
  }

  /**
   * Boots up OS.js
   */
  boot() {
    const done = e => {
      if (e) {
        console.error('Error while booting', e);
      }

      console.groupEnd();

      return this.start();
    };

    if (this.booted) {
      return Promise.resolve(false);
    }

    console.group('Core::boot()');

    this._attachEvents();
    this.emit('osjs/core:boot');

    return super.boot()
      .then(() => {
        this.emit('osjs/core:booted');

        if (this.has('osjs/auth')) {
          return this.make('osjs/auth').show(user => {
            this.user = user;

            if (this.has('osjs/settings')) {
              this.make('osjs/settings').load()
                .then(() => done())
                .catch(() => done());
            } else {
              done();
            }
          });
        } else {
          console.warn('OS.js STARTED WITHOUT ANY AUTHENTICATION');
        }

        return done();
      }).catch(done);
  }

  /**
   * Starts all core services
   */
  start() {
    const connect = () => new Promise((resolve, reject) => {
      try {
        const valid = this._createConnection(error => error ? reject(error) : resolve());
        if (valid === false) {
          // We can skip the connection
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });

    const done = (err) => {
      this.emit('osjs/core:started');

      if (err) {
        console.warn('Error while starting', err);
      }

      console.groupEnd();

      return !!err;
    };

    if (this.started) {
      return Promise.resolve();
    }

    console.group('Core::start()');

    this.emit('osjs/core:start');

    this._createListeners();

    return super.start()
      .then(result => {
        console.groupEnd();

        if (result) {
          return connect()
            .then(() => done())
            .catch(err => done(err));
        }

        return false;
      }).catch(done);
  }

  /**
   * Attaches some internal events
   */
  _attachEvents() {
    // Attaches sounds for certain events
    this.on('osjs/core:started', () => {
      if (this.has('osjs/sounds')) {
        this.make('osjs/sounds').play('service-login');
      }
    });

    this.on('osjs/core:destroy', () => {
      if (this.has('osjs/sounds')) {
        this.make('osjs/sounds').play('service-logout');
      }
    });

    // Forwards messages to an application from internal websocket
    this.on('osjs/application:socket:message', ({pid, args}) => {
      const found = Application.getApplications()
        .find(proc => proc && proc.pid === pid);

      if (found) {
        found.emit('ws:message', ...args);
      }
    });

    // Sets up a server ping
    this.on('osjs/core:connected', config => {
      const pingTime = config.cookie.maxAge / 2;

      this.ping = setInterval(() => {
        if (this.ws) {
          if (this.ws.connected && !this.ws.reconnecting) {
            this.request('/ping').catch(e => console.warn('Error on ping', e));
          }
        }
      }, pingTime);
    });

  }

  /**
   * Creates the main connection to server
   */
  _createConnection(cb) {
    if (this.configuration.standalone) {
      return false;
    }

    const {uri} = this.config('ws');
    let wasConnected = false;

    console.log('Creating websocket connection on', uri);

    this.ws = new Websocket('CoreSocket', uri, {
      interval: this.config('ws.connectInterval', 1000)
    });

    this.ws.once('connected', () => {
      // Allow for some grace-time in case we close prematurely
      setTimeout(() => {
        wasConnected = true;
        cb();
      }, 100);
    });

    this.ws.on('connected', (ev, reconnected) => {
      this.emit('osjs/core:connect', ev, reconnected);
    });

    this.ws.once('failed', ev => {
      if (!wasConnected) {
        cb(new Error('Connection closed'));
        this.emit('osjs/core:connection-failed', ev);
      }
    });

    this.ws.on('disconnected', ev => {
      this.emit('osjs/core:disconnect', ev);
    });

    this.ws.on('message', ev => {
      try {
        const data = JSON.parse(ev.data);
        const params = data.params || [];

        console.debug('WebSocket message', data);
        this.emit(data.name, ...params);
      } catch (e) {
        console.warn('Exception on websocket message', e);
      }
    });

    return true;
  }

  /**
   * Creates event listeners*
   */
  _createListeners() {
    window.addEventListener('message', ev => {
      const message = ev.data || {};
      if (message) {
        // FIXME: This might actually collide with something... need to check more.
        if (message.pid >= 0) {
          const proc = Application.getApplications().find(p => p.pid === message.pid);
          if (proc) {
            console.debug('Routing message', message);
            proc.emit('message', ...message.args);
            return;
          }
        }
      }
    });
  }

  /**
   * Creates an URL based on configured public path
   *
   * @desc If you give a options.type, the URL will be resolved
   * to the correct resource.
   *
   * @param {String} [endpoint=/] Endpoint
   * @param {Object} [options] Additional options for resolving url
   * @param {Boolean} [options.prefix=false] Returns a full URL complete with scheme, etc. (will always be true on websocket)
   * @param {string} [options.type] Optional URL type (websocket)
   * @param {PackageMetadata} [metadata] A package metadata
   * @return {String}
   */
  url(endpoint = '/', options = {}, metadata = {}) {
    const {http, ws} = this.configuration;

    if (typeof endpoint !== 'string') {
      return http.public;
    } else if (endpoint.match(/^(http|ws|ftp)s?:/i)) {
      return endpoint;
    }

    const {type, prefix} = Object.assign({}, {
      type: null,
      prefix: options.type === 'websocket'
    }, options);

    const str = type === 'websocket' ? ws.uri : http.uri;

    let url = endpoint.replace(/^\/+/, '');
    if (metadata.type) {
      const path = endpoint.replace(/^\/?/, '/');
      const type = metadata.type === 'theme' ? 'themes' : (
        metadata.type === 'icons' ? 'icons' : 'apps'
      );

      url = `${type}/${metadata.name}${path}`;
    }

    return prefix
      ? str + url
      : http.public.replace(/^\/?/, '/') + url;
  }


  /**
   * Make a HTTP request
   *
   * @desc This is a wrapper for making a 'fetch' request with some helpers
   * and integration with OS.js
   * @param {String} url The endpoint
   * @param {Options} [options] fetch options
   * @param {String} [type] Request / Response type
   * @return {*}
   */
  request(url, options = {}, type = null) {
    const _ = this.has('osjs/locale')
      ? this.make('osjs/locale').translate
      : t => t;

    if (this.config('standalone')) {
      return Promise.reject(new Error(_('ERR_REQUEST_STANDALONE')));
    }

    if (!url.match(/^((http|ws|ftp)s?:)/i)) {
      url = this.url(url);
      // FIXME: Deep merge
      options = Object.assign({}, options || {}, this.requestOptions || {});
    }

    return fetch(url, options, type)
      .catch(error => {
        throw new Error(_('ERR_REQUEST_NOT_OK', error));
      });
  }

  /**
   * Create an application from a package
   *
   * @param {String} name Package name
   * @param {Object} [args] Launch arguments
   * @param {Object} [options] Launch options
   * @see {Packages}
   * @return {Application}
   */
  run(name, args = {}, options = {}) {
    console.log('Core::run()', name, args, options);

    return this.make('osjs/packages').launch(name, args, options);
  }

  /**
   * Spawns an application based on the file given
   * @param {Object} file A file object
   * @param {Object} [options] Options
   * @return {Boolean|Application}
   */
  open(file, options = {}) {
    const _ = this.make('osjs/locale').translate;

    const run = app => this.run(app, {file}, options);

    if (file.mime === 'osjs/application') {
      return this.run(file.path.split('/').pop());
    }

    const compatible = this.make('osjs/packages')
      .getCompatiblePackages(file.mime);

    if (compatible.length > 0) {
      if (compatible.length > 1) {
        try {
          this.make('osjs/dialog', 'choice', {
            title: _('LBL_LAUNCH_SELECT'),
            message: _('LBL_LAUNCH_SELECT_MESSAGE', file.path),
            choices: compatible.reduce((o, i) => Object.assign(o, {[i.name]: i.name}), {})
          }, (btn, value) => {
            if (btn === 'ok' && value) {
              run(value);
            }
          });

          return true;
        } catch (e) {
          console.warn('Exception on compability check', e);
        }
      }

      run(compatible[0].name);

      return Promise.resolve(true);
    }

    return Promise.reject(false);
  }

  /**
   * Removes an event handler
   * @see EventHandler#off
   */
  off(name, callback = null, force = false) {
    if (name.match(/^osjs\//) && typeof callback !== 'function') {
      throw new TypeError('The callback must be a function');
    }

    return super.off(name, callback, force);
  }

  /**
   * Set the internal fetch/request options
   * @param {Object} options Request options
   */
  setRequestOptions(options) {
    this.requestOptions = Object.assign({}, options);
  }

  /**
   * Gets the current user
   * @return {Map<string,*>} User object
   */
  getUser() {
    return Object.assign({}, this.user);
  }

}
