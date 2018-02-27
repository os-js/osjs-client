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

import EventHandler from './event-handler';
import CoreServiceProvider from './providers/core';

/**
 * OS.js Core
 *
 * Handles registration of service providers
 * and all instanciation.
 */
export default class Core extends EventHandler {

  /**
   * Create core instance
   */
  constructor() {
    super('Core');

    this.providers = [];
    this.registry = [];
    this.instances = {};
    this.configuration = {};
    this.ws = null;
    this.$root = document.body;
    this.$root.classList.add('osjs-root');
  }

  /**
   * Destroy core instance
   */
  destroy() {
    this.emit('osjs/core:destroy');

    for ( let i = 0; i < this.providers.length; i++ ) {
      console.debug('Destroying service provider', i);

      try {
        this.providers[i].destroy();
      } catch ( e ) {
        console.warn(e);
      }
    }

    this.providers = [];
    this.instances =  {};
  }

  /**
   * Initialize all service providers
   */
  async init() {
    console.group('Core::init()');

    this.register(CoreServiceProvider);
    this.emit('osjs/core:init');

    for ( let i = 0; i < this.providers.length; i++ ) {
      console.debug('Registering service provider', i);

      try {
        await this.providers[i].init();
      } catch ( e ) {
        console.warn(e);
      }
    }

    console.groupEnd();
  }

  /**
   * Start all service providers
   */
  async start() {
    console.group('Core::start()');

    this.emit('osjs/core:start');

    try {
      await this.init();
    } catch ( e ) {
      console.error('Cannot start because an execption occured....');
      console.error(e);
      console.groupEnd();
      return;
    }

    console.info('Booting...');

    this.providers.forEach(p => p.start());

    this._createConnection();

    console.groupEnd();
  }

  /*
   * Creates the main connection to server
   */
  _createConnection() {
    const ws = this.configuration.ws;
    const uri = `${ws.protocol}://${ws.hostname}:${ws.port}${ws.path}`;

    console.log('Creating websocket connection on', uri);

    this.ws = new WebSocket(uri);
    this.ws.onopen = () => {
      console.info('Connection opened');
    };

    this.ws.onclose = (ev) => {
      this.make('osjs/notification', {
        title: 'Connection lost',
        message: 'The websocket connection was lost...'
      });
      console.warn('Connection closed', ev);
    };
  }

  /**
   * Set the initial configuration
   */
  configure(configuration) {
    this.configuration = Object.assign({}, {
      ws: {
        protocol: window.location.protocol === 'https:' ? 'wss' : 'ws',
        port: window.location.port,
        hostname: window.location.hostname,
        path: window.location.path || '/'
      }
    }, configuration);
  }

  /**
   * Register a service provider
   *
   * @param {Class} ref A class reference
   */
  register(ref) {
    try {
      const instance = new ref(this);
      this.providers.push(instance);
    } catch (e) {
      console.error('Core::register()', e);
    }
  }

  /*
   * Wrapper for registering a service provider
   */
  _registerMethod(name, singleton, callback) {
    console.debug('Core::_registerMethod()', name);

    this.registry.push({
      singleton,
      name,
      make(...args) {
        return callback(...args);
      }
    });
  }

  /**
   * Register a instanciator provider
   *
   * @param {String} name Provider name
   * @param {Function} callback Callback that returns an instance
   */
  instance(name, callback) {
    this._registerMethod(name, false, callback);
  }

  /**
   * Register a singleton provider
   *
   * @param {String} name Provider name
   * @param {Function} callback Callback that returns an instance
   */
  singleton(name, callback) {
    this._registerMethod(name, true, callback);
  }

  /**
   * Create an instance of a provided service
   *
   * @param {String} name Package name
   * @param {*} args Constructor arguments
   * @return {*} An instance of a service
   */
  make(name, ...args) {
    const found = this.registry.find(p => p.name === name);
    if (!found) {
      throw new Error(`Provider '${name}' not found`);
    }

    if (!found.singleton) {
      return found.make(...args);
    }

    if ( !this.instances[name] ) {
      if ( found ) {
        this.instances[name] = found.make(...args);
      }
    }

    return this.instances[name];
  }

  /**
   * Create an application from a package
   *
   * @param {String} name Package name
   * @param {Object} [args] Launch arguments
   * @param {Object} [options] Launch options
   * @see {PackageManager}
   * @return {Application}
   */
  async run(name, args = {}, options = {}) {
    console.log('Core::run()', name, args, options);

    this.emit('osjs/application:create', args, options);

    return this.make('osjs/package', name, args, options);
  }

}
