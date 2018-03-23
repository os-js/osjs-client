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
import EventHandler from './event-handler';
import {resolveTreeByKey} from './utils';

const createConfiguration = configuration => {
  const {port, hostname, pathname} = window.location;
  const path = pathname.substr(-1) !== '/' ? pathname + '/' : pathname;
  const defaults = {
    development: true,
    standalone: false,
    public: path,
    application: {
      categories: {
        development: {
          label: 'Development'
        },
        education: {
          label: 'Education'
        },
        games: {
          label: 'Games'
        },
        graphics: {
          label: 'Graphics'
        },
        network: {
          label: 'Network'
        },
        multimedia: {
          label: 'Multimedia'
        },
        office: {
          label: 'Office'
        },
        system: {
          label: 'System'
        },
        utilities: {
          label: 'Utilities'
        },
        other: {
          label: 'Other'
        }
      }
    },
    login: {
      username: null,
      password: null
    },
    ws: {
      protocol: window.location.protocol === 'https:' ? 'wss' : 'ws',
      port,
      hostname,
      path
    }
  };

  console.log('Defaults', defaults);
  console.log('Given', configuration);

  return Object.assign({}, defaults, configuration);
};

const loadProviders = async (providers, filter) => {
  const list = providers
    .filter(filter)
    .map(({provider}) => provider);

  console.log('Loading', list.length, 'providers');

  try {
    for (let i = 0; i < list.length; i++) {
      try {
        await list[i].init();
      } catch (e) {
        console.warn(e);
      }
    }
  } catch (e) {
    console.error(e);
    console.groupEnd();

    return false;
  }

  list.forEach(p => p.start());

  return true;
};

/**
 * Core
 *
 * @desc Main class for OS.js service providers and bootstrapping.
 */
export default class Core extends EventHandler {

  /**
   * Create core instance
   * @param {Object} [options] Options
   * @param {Element} [options.root] The root DOM element for elements
   * @param {Element} [options.resourceRoot] The root DOM element for resources
   * @param {String[]} [options.classNames] List of class names to apply to root dom element
   */
  constructor(options = {}) {
    options = Object.assign({}, {
      classNames: ['osjs-root'],
      root: document.body
    }, options);

    super('Core');

    this.providers = [];
    this.registry = [];
    this.instances = {};
    this.configuration = {};
    this.user = null;
    this.ws = null;
    this.booted = false;
    this.started = false;
    this.destroyed = false;
    this.$root = options.root;
    this.$resourceRoot = options.resourceRoot || document.querySelector('head');

    options.classNames.forEach(n => this.$root.classList.add(n));
  }

  /**
   * Destroy core instance
   */
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    this.emit('osjs/core:destroy');

    Application.getApplications().forEach(app => app.destroy());

    this.providers.forEach(({provider}) => provider.destroy());

    this.providers = [];
    this.instances =  {};
  }

  /**
   * Boots up OS.js
   */
  async boot() {
    if (this.booted) {
      return;
    }
    this.booted = true;

    console.group('Core::boot()');

    await loadProviders(this.providers, ({options}) => options.before);

    console.groupEnd();
  }

  /**
   * Starts all core services
   */
  async start() {
    if (this.started) {
      return;
    }
    this.started = true;

    console.group('Core::start()');

    this.emit('osjs/core:start');

    await this._createConnection();

    const result = await loadProviders(this.providers, ({options}) => !options.before);
    if (!result) {
      return;
    }

    this.emit('osjs/core:started');

    console.groupEnd();
  }

  /*
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
   * Set the initial configuration
   */
  configure(configuration) {
    console.group('Core::configure()');

    this.configuration = createConfiguration(configuration);

    console.groupEnd();
  }

  /**
   * Gets a configuration entry by key
   *
   * @param {String} key The key to get the value from
   * @param {*} [defaultValue] If result is undefined, return this instead
   * @see {resolveTreeByKey}
   * @return {*}
   */
  config(key, defaultValue) {
    return resolveTreeByKey(this.configuration, key, defaultValue);
  }

  /**
   * Register a service provider
   *
   * @param {Class} ref A class reference
   * @param {Object} [options] Options for handling of provider
   */
  register(ref, options = {}) {
    try {
      const instance = new ref(this, options.args);
      this.providers.push({
        options,
        provider: instance
      });
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
   * @param {String} name Service name
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

    if (!this.instances[name]) {
      if (found) {
        this.instances[name] = found.make(...args);
      }
    }

    return this.instances[name];
  }

  /**
   * Check if a service exists
   * @param {String} name Provider name
   * @return {Boolean}
   */
  has(name) {
    return this.registry.findIndex(p => p.name === name) !== -1;
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
   * Register login handler
   * @param {Class} ref The class reference
   * @param {Object} options Options
   */
  login(ref, options = {}) {
    console.info('Core::login()', 'requesting login');

    const handler = new ref(this, options);
    handler.init();
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
