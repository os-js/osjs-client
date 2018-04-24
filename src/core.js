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

import CoreServiceProvider from './providers/core';
import DesktopServiceProvider from './providers/desktop';
import NotificationServiceProvider from './providers/notifications';
import VFSServiceProvider from './providers/vfs';
import ThemeServiceProvider from './providers/theme';
import AuthServiceProvider from './providers/auth';

const encodeQueryData = data => Object.keys(data)
  .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
  .join('&');

const providerOptions = (name, defaults, opts = {}) => Object.assign({
  args: defaults[name] ? defaults[name] : {}
}, opts);

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
   * @param {Boolean|Map<string, Object>} [options.registerDefault=true] Register default provided service providers. Can also be a map with arguments to pass on to options.
   * @param {String[]} [options.classNames] List of class names to apply to root dom element
   */
  constructor(config, options = {}) {
    options = Object.assign({}, {
      registerDefault: true,
      classNames: ['osjs-root'],
      root: document.body
    }, options);

    super('Core', defaultConfiguration, config, options);

    this.user = null;
    this.ws = null;
    this.$root = options.root;
    this.$resourceRoot = options.resourceRoot || document.querySelector('head');

    options.classNames.forEach(n => this.$root.classList.add(n));

    if (options.registerDefault) {
      const defaults = typeof options.registerDefault === 'object'
        ? options.registerDefault || {}
        : {};

      this.register(CoreServiceProvider, providerOptions('core', defaults));
      this.register(DesktopServiceProvider, providerOptions('desktop', defaults));
      this.register(VFSServiceProvider, providerOptions('vfs', defaults));
      this.register(ThemeServiceProvider, providerOptions('theme', defaults));
      this.register(NotificationServiceProvider, providerOptions('notification', defaults));
      this.register(AuthServiceProvider, providerOptions('auth', defaults, {
        before: true
      }));
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

    Application.getApplications().forEach(app => app.destroy());

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

    await super.boot();

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

    await this._createConnection();

    const result = await super.start();
    if (!result) {
      console.groupEnd();
      return;
    }

    this.emit('osjs/core:started');

    console.groupEnd();
  }

  /**
   * Creates the main connection to server
   */
  _createConnection() {
    if (this.configuration.standalone) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const ws = this.configuration.ws;
      const uri = `${ws.protocol}://${ws.hostname}:${ws.port}${ws.path}`;

      console.log('Creating websocket connection on', uri);

      this.ws = new WebSocket(uri);
      this.ws.onopen = () => {
        console.info('Connection opened');

        // Allow for some grace-time in case we close
        // prematurely
        setTimeout(() => resolve(), 100);
      };

      this.ws.onclose = (ev) => {
        reject();

        this.make('osjs/notification', {
          title: 'Connection lost',
          message: 'The websocket connection was lost...'
        });
        console.warn('Connection closed', ev);
      };
    });
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
    // TODO: Check actual connection or standalone mode
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
