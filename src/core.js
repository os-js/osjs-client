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

import Application from './application';
import {CoreBase} from '@osjs/common';
import {defaultConfiguration} from './config';

const encodeQueryData = data => Object.keys(data)
  .filter(k => typeof data[k] !== 'object')
  .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
  .join('&');

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
    }, options);

    super(defaultConfiguration, config, options);

    this.user = null;
    this.ws = null;
    this.connected = false;
    this.reconnecting = false;
    this.$root = options.root;
    this.$resourceRoot = options.resourceRoot || document.querySelector('head');
  }

  /**
   * Destroy core instance
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.emit('osjs/core:destroy');

    Application.destroyAll();

    super.destroy();
  }

  /**
   * Boots up OS.js
   */
  async boot() {
    if (this.booted) {
      return;
    }

    console.group('Core::boot()');

    try {
      await super.boot();
    } catch (e) {
      console.error(e);
      return;
    }

    this.options.classNames.forEach(n => this.$root.classList.add(n));

    if (this.has('osjs/auth')) {
      this.make('osjs/auth').show(user => {
        this.user = user;

        if (this.has('osjs/settings')) {
          this.make('osjs/settings').load()
            .then(() => this.start())
            .catch(() => this.start());
        } else {
          this.start();
        }
      });
    } else {
      console.warn('OS.js STARTED WITHOUT ANY AUTHENTICATION');
      this.start();
    }

    console.groupEnd();
  }

  /**
   * Starts all core services
   */
  async start() {
    if (this.started) {
      return;
    }

    console.group('Core::start()');

    this.emit('osjs/core:start');

    this._createListeners();

    const result = await super.start();
    if (!result) {
      console.groupEnd();
      return;
    }

    const connect = () => new Promise((resolve, reject) => {
      const valid = this._createConnection(error => error ? reject(error) : resolve());
      if (!valid) {
        reject('Already connecting...');
      }
    });

    await connect();

    this.emit('osjs/core:started');

    console.groupEnd();
  }

  /**
   * Creates the main connection to server
   */
  _createConnection(cb) {
    cb = cb || function() {};

    if (this.configuration.standalone || this.connected) {
      return false;
    }

    const ws = this.configuration.ws;
    const uri = `${ws.protocol}://${ws.hostname}:${ws.port}${ws.path}`;

    console.log('Creating websocket connection on', uri);

    this.ws = new WebSocket(uri);
    this.ws.onopen = (ev) => {
      const reconnected = !!this.reconnecting;
      clearInterval(this.reconnecting);
      this.connected = true;
      this.reconnecting = false;

      // Allow for some grace-time in case we close prematurely
      setTimeout(() => cb(), 100);

      this.emit('osjs/core:connect', ev, reconnected);
    };

    this.ws.onclose = (ev) => {
      if (this.connected) {
        this.reconnecting = setInterval(() => this._createConnection(), 5000);
      }

      this.connected = false;

      cb(new Error('Connection closed'));

      this.emit('osjs/core:disconnect', ev);
    };

    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        console.debug('WebSocket message', data);
        this.emit(data.name, data.params);
      } catch (e) {
        console.warn(e);
      }
    };

    return true;
  }

  /**
   * Creates event listeners*
   */
  _createListeners() {
    window.addEventListener('message', ev => {
      const message = ev.data || {};
      if (message) {
        if (message.pid >= 0) {
          const proc = Application.getApplications().find(p => p.pid === message.pid);
          if (proc) {
            console.debug('Routing message', message);
            proc.emit('message', ...message.args);
            return;
          }
        }

        console.warn('Message with unknown reciever', message);
      }
    });
  }

  /**
   * Creates an URL based on configured public path
   *
   * @param {String} [endpoint=/] Endpoint
   * @return {String}
   */
  url(endpoint = '/') {
    return this.configuration.public + endpoint.replace(/^\/+/, '');
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
  async request(url, options = {}, type = null) {
    if (this.config('standalone')) {
      const msg = this.make('osjs/locale')
        .translate('ERR_REQUEST_STANDALONE');

      throw new Error(msg);
    }

    options = Object.assign({}, {
      credentials: 'same-origin',
      method: 'get',
      headers: {}
    }, options);

    if (type === 'json') {
      options.headers = Object.assign(options.headers, {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      });
    }

    if (options.body && options.method === 'get') {
      url += '?' + encodeQueryData(options.body);
      delete options.body;
    }

    if (typeof options.body !== 'undefined' && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error('An error occured:' + response.statusText); // TODO
    }

    if (type === 'json') {
      return response.json();
    }

    return response;
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
  async run(name, args = {}, options = {}) {
    console.log('Core::run()', name, args, options);

    return this.make('osjs/package', name, args, options);
  }

  /**
   * Spawns an application based on the file given
   * @param {Object} file A file object
   * @param {Object} [options] Options
   * @return {Boolean|Application}
   */
  async open(file, options = {}) {
    const pm = this.make('osjs/packages');
    const compatible = pm.metadata.filter(meta => {
      if (meta.mimes) {
        return !!meta.mimes.find(mime => {
          try {
            const re = new RegExp(mime);
            return re.test(file.mime);
          } catch (e) {
            console.warn(e);
          }

          return mime === file.mime;
        });
      }

      return false;
    }).map(meta => meta.name);

    if (compatible.length) {
      // FIXME
      return this.run(compatible[0], {
        file
      }, options);
    }

    return false;
  }

}
