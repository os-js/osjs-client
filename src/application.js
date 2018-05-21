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
import {EventHandler} from '@osjs/common';
import ApplicationSocket from './application-socket';
import Window from './window';

const applications = [];
let applicationCount = 0;

/**
 * Application
 *
 * @desc Base class for an Application
 */
export default class Application extends EventHandler {

  /**
   * Create application
   *
   * @param {Core} core Core reference
   * @param {Object} data Application data
   * @param {Map<String, *>} data.args Launch arguments
   * @param {Object} [data.options] Options
   * @param {Object} [data.options.restore] Restore data
   * @param {PackageMetadata} [data.metadata] Package Metadata
   */
  constructor(core, data) {
    data = Object.assign({}, {
      args: {},
      options: {},
      metadata: {}
    }, data);

    console.log('Application::constructor()', data);

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
     * @type {Map<String, *>}
     */
    this.args = data.args;

    /**
     * Application options
     * @type {Object}
     */
    this.options = data.options;

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
     * The application destruction state
     * @type {Boolean}
     */
    this.destroyed = false;

    /**
     * Application settings
     * @type {Object}
     */
    this.settings = {};

    /**
     * Application started time
     * @type {Date}
     */
    this.started = new Date();

    /**
     * Application WebSockets
     * @type {ApplicationSocket[]}
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
        console.warn(e);
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
    this.core.run(this.metadata.name, Object.assign({}, this.args), Object.assign({}, this.options, {
      restore: {
        windows: this.windows.map(w => w.getSession())
      },
      forcePreload: this.core.config('development')
    }));

    this.destroy();
  }

  /**
   * Gets a URI to a resource for this application
   *
   * @desc If given path is an URI it will just return itself.
   *
   * @param {String} path The path
   * @return {String} A complete URI
   */
  resource(path = '/') {
    if (path.match(/^(http|ws|ftp)s?:/i)) {
      return path;
    }

    if (path.substr(0, 1) !== '/') {
      path = '/' + path;
    }

    const basePath = this.core.config('public');
    return `${basePath}apps/${this.metadata._path}${path}`;
  }

  /**
   * Performs a request to the OS.js server with the application
   * as the endpoint.
   * @param {String} [path=/] Append this to endpoint
   * @param {Object} [params] Parameters to pass on
   * @param {String} [method=post] HTTP Method
   * @param {Object} [options] HTTP Options
   * @return {Promise<*, Error>} ArrayBuffer or JSON
   */
  request(path = '/', params = {}, method = 'post', options = {}) {
    const uri = this.resource(path);
    const body = method === 'get' ? null : params;

    return fetch(uri, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    }).then(response => {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response.arrayBuffer();
    });
  }

  /**
   * Creates a new WebSocket
   * @param {String} [path=/socket] Append this to endpoint
   * @param {Object} [options] Connection options
   * @return {ApplicationSocket}
   */
  socket(path = '/socket', options = {}) {
    options = Object.assign({}, {
      hostname: window.location.hostname,
      protocol: window.location.protocol.replace('http', 'ws'),
      port: window.location.port,
      socket: {}
    }, options);

    const resource = this.resource(path);
    const {hostname, port, protocol} = options;
    const uri = resource.match(/^wss?:/)
      ? resource
      : `${protocol}//${hostname}:${port}${resource}`;

    const ws = new ApplicationSocket(this.metadata.name, uri, options.socket);

    this.sockets.push(ws);

    return ws;
  }

  /**
   * Creates a new Worker
   * @param {String} filename Worker filename
   * @param {Object} [options] Worker options
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
   * @param {Object} options Window options
   * @see {Window}
   * @return {Window}
   */
  createWindow(options = {}) {
    const found = this.windows.find(w => w.id === options.id);
    if (found) {
      throw new Error(`Window with id '${options.id}' already exists`);
    }

    options.attributes = options.attributes || {
      classNames: [`Window_${this.metadata.name}`]
    };

    const instance = new Window(this.core, options);
    instance.init();

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

    this.windows.push(instance);

    this.emit('create-window', instance);
    instance.on('destroy', () => {
      const foundIndex = this.windows.findIndex(w => w === instance);
      if (foundIndex !== -1) {
        this.windows.splice(foundIndex, 1);
      }

      this.emit('destroy-window', instance);
    });

    return instance;
  }

  /**
   * Removes window(s) based on given filter
   * @param {Function} filter Filter function
   */
  removeWindow(filter) {
    let i = this.windows.length;
    while (i--) {
      if (filter(this.windows[i], i)) {
        this.windows.splice(i, 1);
      }
    }
  }

  /**
   * Gets a snapshot of the application session
   * @return {Object}
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
   * Emits an event across all applications
   *
   * @desc The signature of this method differs from the regular emit,
   * as you have to pass the arguments as an array. By default the filter is set
   * to emit to everything except this instance. If you pass a string as a filter it
   * will also check the application metadata name.
   *
   * @param {String} name Event name
   * @param {Array} args Arguments to pass on
   * @param {Function} [filter] A method to filter what applications to send to
   */
  emitAll(name, args, filter) {
    const defaultFilter = proc => proc.pid !== this.pid;
    const filterFn = typeof filter === 'function'
      ? filter
      : typeof filter === 'string'
        ? proc => defaultFilter(proc) && proc.name === filter
        : defaultFilter;

    applications.filter(filterFn)
      .forEach(proc => proc.emit(name, ...args));
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
        console.warn(e);
      }
    });

    applications.splice(0, applications.length);
  }

}
