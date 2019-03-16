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
import {EventEmitter} from '@osjs/event-emitter';
import Websocket from './websocket';
import Window from './window';

const applications = [];
let applicationCount = 0;

const getSettingsKey = metadata =>
  'osjs/application/' + metadata.name;

/**
 * Application
 *
 * @desc Base class for an Application
 */
export default class Application extends EventEmitter {

  /**
   * Create application
   *
   * @param {Core} core Core reference
   * @param {object} data Application data
   * @param {Map<string, *>} data.args Launch arguments
   * @param {object} [data.options] Options
   * @param {object} [data.options.settings] Initial settings
   * @param {object} [data.options.restore] Restore data
   * @param {boolean} [data.options.windowAutoFocus=true] Auto-focus first created window
   * @param {boolean} [data.options.sessionable=true] Allow session storage
   * @param {PackageMetadata} [data.metadata] Package Metadata
   */
  constructor(core, data) {
    data = Object.assign({}, {
      args: {},
      options: {},
      metadata: {}
    }, data);

    console.debug('Application::constructor()', data);

    const defaultSettings = data.options.settings
      ? Object.assign({}, data.options.settings)
      : {};

    const name = data.metadata && data.metadata.name
      ? 'Application@' + data.metadata.name
      : 'Application' + String(applicationCount);

    super(name);

    /**
     * The Application ID
     * @type {Number}
     */
    this.pid = applicationCount;

    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * Application arguments
     * @type {Map<string, *>}
     */
    this.args = data.args;

    /**
     * Application options
     * @type {object}
     */
    this.options = Object.assign({
      sessionable: true,
      windowAutoFocus: true
    }, data.options);

    /**
     * Application metadata
     * @type {PackageMetadata}
     */
    this.metadata = data.metadata;

    /**
     * Window list
     * @type {Window[]}
     */
    this.windows = [];

    /**
     * Worker instances
     * @type {Worker[]}
     */
    this.workers = [];

    /**
     * Options for internal fetch/requests
     * @type {object}
     */
    this.requestOptions = {};

    /**
     * The application destruction state
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * Application settings
     * @type {object}
     */
    this.settings = core.make('osjs/settings')
      .get(getSettingsKey(this.metadata), null, defaultSettings);

    /**
     * Application started time
     * @type {Date}
     */
    this.started = new Date();

    /**
     * Application WebSockets
     * @type {Websocket[]}
     */
    this.sockets = [];

    applications.push(this);
    applicationCount++;

    this.core.emit('osjs/application:create', this);
  }

  /**
   * Destroy application
   */
  destroy(remove = true) {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    this.emit('destroy');
    this.core.emit('osjs/application:destroy', this);

    const destroy = (list, fn) => {
      try {
        list.forEach(fn);
      } catch (e) {
        console.warn('Exception on application destruction', e);
      }

      return [];
    };

    this.windows = destroy(this.windows, window => window.destroy());
    this.sockets = destroy(this.sockets, ws => ws.close());
    this.workers = destroy(this.workers, worker => worker.terminate());

    if (remove) {
      const foundIndex = applications.findIndex(a => a === this);
      if (foundIndex !== -1) {
        applications.splice(foundIndex, 1);
      }
    }
  }

  /**
   * Re-launch this application
   */
  relaunch() {
    const windows = this.windows.map(w => w.getSession());

    this.destroy();

    setTimeout(() => {
      this.core.run(this.metadata.name, Object.assign({}, this.args), Object.assign({}, this.options, {
        forcePreload: this.core.config('development'),
        restore: {windows}
      }));
    }, 1);
  }

  /**
   * Gets a URI to a resource for this application
   *
   * @desc If given path is an URI it will just return itself.
   *
   * @param {string} path The path
   * @param {object} [options] Options for url() in core
   * @return {string} A complete URI
   */
  resource(path = '/', options = {}) {
    return this.core.url(path, options, this.metadata);
  }

  /**
   * Performs a request to the OS.js server with the application
   * as the endpoint.
   * @param {string} [path=/] Append this to endpoint
   * @param {Options} [options] fetch options
   * @param {string} [type='json'] Request / Response type
   * @return {Promise<*, Error>} ArrayBuffer or JSON
   */
  request(path = '/', options = {}, type = 'json') {
    const uri = this.resource(path);

    return this.core.request(uri, options, type);
  }

  /**
   * Creates a new Websocket
   * @param {string} [path=/socket] Append this to endpoint
   * @param {object} [options] Connection options
   * @return {Websocket}
   */
  socket(path = '/socket', options = {}) {
    options = Object.assign({}, {
      socket: {}
    }, options);

    const uri = this.resource(path, {type: 'websocket'});
    const ws = new Websocket(this.metadata.name, uri, options.socket);

    this.sockets.push(ws);

    return ws;
  }

  /**
   * Sends a message over websocket via the core connection.
   * @desc This does not create a new connection, but rather uses the core connection.
   * For subscribing to messages from the server use the 'ws:message' event
   */
  send(...args) {
    this.core.ws.send(JSON.stringify({
      name: 'osjs/application:socket:message',
      params: [{
        pid: this.pid,
        name: this.metadata.name,
        args
      }]
    }));
  }

  /**
   * Creates a new Worker
   * @param {string} filename Worker filename
   * @param {object} [options] Worker options
   * @return {Worker}
   */
  worker(filename, options = {}) {
    const uri = this.resource(filename);
    const worker =  new Worker(uri, Object.assign({
      credentials: 'same-origin'
    }, options));

    this.workers.push(worker);

    return worker;
  }

  /**
   * Create a new window belonging to this application
   * @param {object} options Window options
   * @see {Window}
   * @return {Window}
   */
  createWindow(options = {}) {
    const found = this.windows.find(w => w.id === options.id);
    if (found) {
      const msg = this.core.make('osjs/locale')
        .translate('ERR_WINDOW_ID_EXISTS', options.id);

      throw new Error(msg);
    }

    const instance = new Window(this.core, options);

    if (this.options.restore) {
      const windows = this.options.restore.windows || [];
      const found = windows.findIndex(r => r.id === instance.id);

      if (found !== -1) {
        const restore = windows[found];
        instance.setPosition(restore.position, true);
        instance.setDimension(restore.dimension);

        this.options.restore.windows.splice(found, 1);
      }
    }

    instance.init();

    this.windows.push(instance);

    this.emit('create-window', instance);
    instance.on('destroy', () => {
      if (!this.destroyed) {
        const foundIndex = this.windows.findIndex(w => w === instance);
        if (foundIndex !== -1) {
          this.windows.splice(foundIndex, 1);
        }
      }

      this.emit('destroy-window', instance);
    });

    if (this.options.windowAutoFocus) {
      instance.focus();
    }

    return instance;
  }

  /**
   * Removes window(s) based on given filter
   * @param {Function} filter Filter function
   */
  removeWindow(filter) {
    const found = this.windows.filter(filter);
    found.forEach(win => win.destroy());
  }

  /**
   * Gets a snapshot of the application session
   * @return {object}
   */
  getSession() {
    const session = {
      args: Object.assign({}, this.args),
      name: this.metadata.name,
      windows: this.windows
        .map(w => w.getSession())
        .filter(s => s !== null)
    };

    return session;
  }

  /**
   * Emits an event across all (or filtered) applications
   *
   * @deprecated
   * @param {Function} [filter] A method to filter what applications to send to
   * @return {Function} Function with 'emit()' signature
   */
  emitAll(filter) {
    console.warn('Application#emitAll is deprecated. Use Core#broadcast instead');

    const defaultFilter = proc => proc.pid !== this.pid;
    const filterFn = typeof filter === 'function'
      ? filter
      : typeof filter === 'string'
        ? proc => defaultFilter(proc) && proc.metadata.name === filter
        : defaultFilter;

    return (name, ...args) => applications.filter(filterFn)
      .map(proc => proc.emit(name, ...args));
  }

  /**
   * Saves settings
   * @return {Promise<Boolean, Error>}
   */
  saveSettings() {
    const service = this.core.make('osjs/settings');
    const name = getSettingsKey(this.metadata);

    service.set(name, null, this.settings);

    return service.save();
  }

  /**
   * Get a list of all running applications
   *
   * @return {Application[]}
   */
  static getApplications() {
    return applications;
  }

  /**
   * Kills all running applications
   */
  static destroyAll() {
    applications.forEach(proc => {
      try {
        proc.destroy(false);
      } catch (e) {
        console.warn('Exception on destroyAll', e);
      }
    });

    applications.splice(0, applications.length);
  }

}
