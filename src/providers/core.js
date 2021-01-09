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

import Application from '../application';
import Window from '../window';
import WindowBehavior from '../window-behavior';
import Session from '../session';
import Packages from '../packages';
import Tray from '../tray';
import Websocket from '../websocket';
import Clipboard from '../clipboard';
import Middleware from '../middleware';
import * as translations from '../locale';
import {format, translatable, translatableFlat, getLocale} from '../utils/locale';
import {style, script, playSound} from '../utils/dom';
import {resourceResolver} from '../utils/desktop';
import * as dnd from '../utils/dnd';
import {BasicApplication} from '../basic-application.js';
import {ServiceProvider} from '@osjs/common';
import {EventEmitter} from '@osjs/event-emitter';
import logger from '../logger';
import merge from 'deepmerge';

/**
 * Core Provider Locale Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderLocaleContract
 * @property {Function} format
 * @property {Function} translate
 * @property {Function} translatable
 * @property {Function} translatableFlat
 * @property {Function} getLocale
 * @property {Function} setLocale
 */

/**
 * Core Provider Window Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderWindowContract
 * @property {Function} create
 * @property {Function} list
 * @property {Function} last
 */

/**
 * Core Provider DnD Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderDnDContract
 * @property {Function} draggable
 * @property {Function} droppable
 */

/**
 * Core Provider Theme Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderDOMContract
 * @property {Function} script
 * @property {Function} style
 */

/**
 * Core Provider Theme Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderThemeContract
 * @property {Function} resource
 * @property {Function} icon
 */

/**
 * Core Provider Sound Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderSoundContract
 * @property {Function} resource
 * @property {Function} play
 */

/**
 * Core Provider Session Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderSessionContract
 * @property {Function} save
 * @property {Function} load
 */

/**
 * Core Provider Packages Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderPackagesContract
 * @property {Function} [launch]
 * @property {Function} [register]
 * @property {Function} [addPackages]
 * @property {Function} [getPackages]
 * @property {Function} [getCompatiblePackages]
 * @property {Function} [running]
 */

/**
 * Core Provider Clipboard Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderClipboardContract
 * @property {Function} [clear]
 * @property {Function} [set]
 * @property {Function} [has]
 * @property {Function} [get]
 */

/**
 * Core Provider Middleware Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderMiddlewareContract
 * @property {Function} [add]
 * @property {Function} [get]
 */

/**
 * Core Provider Tray Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderTrayContract
 * @property {Function} [create]
 * @property {Function} [remove]
 * @property {Function} [list]
 * @property {Function} [has]
 */

/**
 * Core Provider Options
 * @typedef {Object} CoreProviderOptions
 * @property {Function} [windowBehavior] Custom Window Behavior
 * @property {Object} [locales] Override locales
 */

/**
 * OS.js Core Service Provider
 */
export default class CoreServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {CoreProviderOptions} [options={}] Arguments
   */
  constructor(core, options = {}) {
    super(core, options);

    /**
     * @type {Session}
     * @readonly
     */
    this.session = new Session(core);

    /**
     * @type {Tray}
     * @readonly
     */
    this.tray = new Tray(core);

    /**
     * @type {Packages}
     * @readonly
     */
    this.pm = new Packages(core);

    /**
     * @type {Clipboard}
     * @readonly
     */
    this.clipboard = new Clipboard();

    /**
     * @type {Middleware}
     * @readonly
     */
    this.middleware = new Middleware();

    window.OSjs = this.createGlobalApi();
  }

  /**
   * Get a list of services this provider registers
   * @return {string}
   */
  provides() {
    return [
      'osjs/application',
      'osjs/basic-application',
      'osjs/window',
      'osjs/windows',
      'osjs/event-handler',
      'osjs/window-behaviour',
      'osjs/dnd',
      'osjs/dom',
      'osjs/clipboard',
      'osjs/middleware',
      'osjs/tray',
      'osjs/locale',
      'osjs/packages',
      'osjs/websocket',
      'osjs/session',
      'osjs/theme',
      'osjs/sounds'
    ];
  }

  /**
   * Destroys provider
   */
  destroy() {
    this.tray.destroy();
    this.pm.destroy();
    this.clipboard.destroy();
    this.middleware.destroy();
    this.session.destroy();

    super.destroy();
  }

  /**
   * Initializes provider
   * @return {Promise<undefined>}
   */
  init() {
    this.registerContracts();

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    return this.pm.init();
  }

  /**
   * Starts provider
   * @return {Promise<undefined>}
   */
  start() {
    if (this.core.config('development')) {
      this.core.on('osjs/dist:changed', filename => {
        this._onDistChanged(filename);
      });

      this.core.on('osjs/packages:package:changed', name => {
        this._onPackageChanged(name);
      });
    }

    this.core.on('osjs/packages:metadata:changed', () => {
      this.pm.init();
    });
  }

  /**
   * Registers contracts
   */
  registerContracts() {
    this.core.instance('osjs/window', (options = {}) => new Window(this.core, options));
    this.core.instance('osjs/application', (data = {}) => new Application(this.core, data));
    this.core.instance('osjs/basic-application', (proc, win, options = {}) => new BasicApplication(this.core, proc, win, options));
    this.core.instance('osjs/websocket', (name, uri, options = {}) => new Websocket(name, uri, options));
    this.core.instance('osjs/event-emitter', name => new EventEmitter(name));

    this.core.singleton('osjs/windows', () => this.createWindowContract());
    this.core.singleton('osjs/locale', () => this.createLocaleContract());
    this.core.singleton('osjs/dnd', () => this.createDnDContract());
    this.core.singleton('osjs/dom', () => this.createDOMContract());
    this.core.singleton('osjs/theme', () => this.createThemeContract());
    this.core.singleton('osjs/sounds', () => this.createSoundsContract());
    this.core.singleton('osjs/session', () => this.createSessionContract());
    this.core.singleton('osjs/packages', () => this.createPackagesContract());
    this.core.singleton('osjs/clipboard', () => this.createClipboardContract());
    this.core.singleton('osjs/middleware', () => this.createMiddlewareContract());

    this.core.instance('osjs/tray', (options, handler) => {
      if (typeof options !== 'undefined') {
        // FIXME: Use contract instead
        logger.warn('osjs/tray usage without .create() is deprecated');
        return this.tray.create(options, handler);
      }

      return this.createTrayContract();
    });

    // FIXME: Remove this from public usage
    this.core.singleton('osjs/window-behavior', () => typeof this.options.windowBehavior === 'function'
      ? this.options.windowBehavior(this.core)
      : new WindowBehavior(this.core));

    // FIXME: deprecated
    this.core.instance('osjs/event-handler', (...args) => {
      logger.warn('osjs/event-handler is deprecated, use osjs/event-emitter');
      return new EventEmitter(...args);
    });
  }

  /**
   * Expose some internals to global
   */
  createGlobalApi() {
    const globalBlacklist = this.core.config('providers.globalBlacklist', []);
    const globalWhitelist = this.core.config('providers.globalWhitelist', []);

    const make = (name, ...args) => {
      if (this.core.has(name)) {
        const blacklisted = globalBlacklist.length > 0 && globalBlacklist.indexOf(name) !== -1;
        const notWhitelisted = globalWhitelist.length > 0 && globalWhitelist.indexOf(name) === -1;

        if (blacklisted || notWhitelisted) {
          throw new Error(`The provider '${name}' cannot be used via global scope`);
        }
      }

      return this.core.make(name, ...args);
    };

    return Object.freeze({
      make,
      register: (name, callback) => this.pm.register(name, callback),
      url: (endpoint, options, metadata) => this.core.url(endpoint, options, metadata),
      run: (name, args = {}, options = {}) => this.core.run(name, args, options),
      open: (file, options = {}) => this.core.open(file, options),
      request: (url, options, type) => this.core.request(url, options, type),
      middleware: (group, callback) => this.middleware.add(group, callback)
    });
  }

  /**
   * Event when dist changes from a build or deployment
   * @private
   * @param {string} filename The resource filename
   */
  _onDistChanged(filename) {
    const url = this.core.url(filename).replace(/^\//, '');
    const found = this.core.$resourceRoot.querySelectorAll('link[rel=stylesheet]');
    const map = Array.from(found).reduce((result, item) => {
      const src = item.getAttribute('href').split('?')[0].replace(/^\//, '');
      return {
        [src]: item,
        ...result
      };
    }, {});

    if (map[url]) {
      logger.debug('Hot-reloading', url);

      setTimeout(() => {
        map[url].setAttribute('href', url);
      }, 100);
    }
  }

  /**
   * Event when package dist changes from a build or deployment
   * @private
   * @param {string} name The package name
   */
  _onPackageChanged(name) {
    // TODO: Reload themes as well
    Application.getApplications()
      .filter(proc => proc.metadata.name === name)
      .forEach(proc => proc.relaunch());
  }

  /**
   * Provides localization contract
   * @return {CoreProviderLocaleContract}
   */
  createLocaleContract() {
    const strs = merge(translations, this.options.locales || {});
    const translate = translatable(this.core)(strs);

    return {
      format: format(this.core),
      translate,
      translatable: translatable(this.core),
      translatableFlat: translatableFlat(this.core),
      getLocale: (key = 'language') => {
        const ref = getLocale(this.core, key);
        return ref.userLocale || ref.defaultLocale;
      },
      setLocale: name => name in strs
        ? this.core.make('osjs/settings')
          .set('osjs/locale', 'language', name)
          .save()
          .then(() => this.core.emit('osjs/locale:change', name))
        : Promise.reject(translate('ERR_INVALID_LOCALE', name))
    };
  }

  /**
   * Provides window contract
   * @return {CoreProviderWindowContract}
   */
  createWindowContract() {
    return {
      create: (options = {}) => new Window(this.core, options),
      list: () => Window.getWindows(),
      last: () => Window.lastWindow()
    };
  }

  /**
   * Provides DnD contract
   * @return {CoreProviderDnDContract}
   */
  createDnDContract() {
    return dnd;
  }

  /**
   * Provides DOM contract
   * @return {CoreProviderDOMContract}
   */
  createDOMContract() {
    return {
      script,
      style
    };
  }

  /**
   * Provides Theme contract
   * @return {CoreProviderThemeContract}
   */
  createThemeContract() {
    const {themeResource, icon} = resourceResolver(this.core);

    return {
      resource: themeResource,
      icon: name => icon(name.replace(/(\.png)?$/, '.png'))
    };
  }

  /**
   * Provides Sounds contract
   * @return {CoreProviderSoundContract}
   */
  createSoundsContract() {
    const {soundResource, soundsEnabled} = resourceResolver(this.core);

    return {
      resource: soundResource,
      play: (src, options = {}) => {
        if (soundsEnabled()) {
          const absoluteSrc = src.match(/^(\/|https?:)/)
            ? src
            : soundResource(src);

          if (absoluteSrc) {
            return playSound(absoluteSrc, options);
          }
        }

        return false;
      }
    };
  }

  /**
   * Provides Session contract
   * @return {CoreProviderSessionContract}
   */
  createSessionContract() {
    return {
      save: () => this.session.save(),
      load: (fresh = false) => this.session.load(fresh)
    };
  }

  /**
   * Provides Packages contract
   * @return {CoreProviderPackagesContract}
   */
  createPackagesContract() {
    return {
      launch: (name, args = {}, options = {}) => this.pm.launch(name, args, options),
      register: (name, callback) => this.pm.register(name, callback),
      addPackages: list => this.pm.addPackages(list),
      getPackages: filter => this.pm.getPackages(filter),
      getCompatiblePackages: mimeType => this.pm.getCompatiblePackages(mimeType),
      running: () => this.pm.running()
    };
  }

  /**
   * Provides Clipboard contract
   * @return {CoreProviderClipboardContract}
   */
  createClipboardContract() {
    return {
      clear: () => this.clipboard.clear(),
      set: (data, type) => this.clipboard.set(data, type),
      has: type => this.clipboard.has(type),
      get: (clear = false) => this.clipboard.get(clear)
    };
  }

  /**
   * Provides Middleware contract
   * @return {CoreProviderMiddlewareContract}
   */
  createMiddlewareContract() {
    return {
      add: (group, callback) => this.middleware.add(group, callback),
      get: group => this.middleware.get(group)
    };
  }

  /**
   * Provides Tray contract
   * @return {CoreProviderTrayContract}
   */
  createTrayContract() {
    return {
      create: (options, handler) => this.tray.create(options, handler),
      remove: entry => this.tray.remove(entry),
      list: () => this.tray.list(),
      has: key => this.tray.has(key)
    };
  }
}
