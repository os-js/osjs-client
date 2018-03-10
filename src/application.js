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
import Window from './window';

const applications = [];
let applicationCount = 0;

/**
 * OS.js Application WebSocket Wrapper
 */
class ApplicationSocket extends EventHandler {

  /**
   * Create a new WebSocket
   * @param {String} uri Connection URI
   * @param {Object} options Websocket options
   */
  constructor(name, uri, options = {}) {
    console.debug('ApplicationSocket::constructor()', name, uri);

    super('ApplicationSocket@' + name);

    this.connection = new WebSocket(uri);
    this.connection.onopen = (...args) => this.emit('open', ...args);
    this.connection.onclose = (...args) => this.emit('close', ...args);
    this.connection.onmessage = (...args) => this.emit('message', ...args);
  }

  /**
   * Wrapper for sending data
   */
  send(...args) {
    return this.connection.send(...args);
  }

  /**
   * Wrapper for closing
   */
  close(...args) {
    return this.connection.close(...args);
  }

}

/**
 * OS.js Application
 */
export default class Application extends EventHandler {

  /**
   * Create application
   *
   * @param {Core} core Core reference
   * @param {Object} data Application data
   */
  constructor(core, data = {}) {
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
     * @type {Object}
     */
    this.args = data.args || {};

    /**
     * Application options
     * @type {Object}
     */
    this.options = data.options || {};

    /**
     * Application metadata
     * @type {Object}
     */
    this.metadata = data.metadata || {};

    /**
     * Window list
     * @type {Window[]}
     */
    this.windows = [];

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
  }

  /**
   * Destroy application
   */
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    this.emit('destroy');
    this.core.emit('osjs/application:destroy', this);

    try {
      this.windows.forEach((window) => window.destroy());
      this.windows = [];
    } catch (e) {
      console.warn(e);
    }

    try {
      this.sockets.forEach((ws) => ws.close());
      this.sockets = [];
    } catch (e) {
      console.warn(e);
    }

    const foundIndex = applications.findIndex(a => a === this);
    if (foundIndex !== -1) {
      applications.splice(foundIndex, 1);
    }
  }

  /**
   * Gets a URI to a resource for this application
   * @param {String} path The path
   * @return {String} A complete URI
   */
  resource(path = '/') {
    const uri = `/packages/${this.metadata._path}${path}`;

    return uri;
  }

  /**
   * Performs a request to the OS.js server with the application
   * as the endpoint.
   * @param {String} [path=/] Append this to endpoint
   * @param {Object} [params] Parameters to pass on
   * @param {String} [method=post] HTTP Method
   * @param {Object} [options] HTTP Options
   * @return {*} ArrayBuffer or JSON
   */
  async request(path = '/', params = {}, method = 'post', options = {}) {
    const uri = this.resource(path);
    const body = method === 'get' ? null : params;

    const response = await fetch(uri, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.arrayBuffer();
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
    const uri = `${protocol}//${hostname}:${port}${resource}`;
    const ws = new ApplicationSocket(this.metadata.name, uri, options.socket);

    this.sockets.push(ws);
    /*
    const index = this.sockets.push(ws) - 1;
    ws.on('close', () => {
      if (!this.destroyed) {
        this.sockets.splice(index)
      }
    });
    */

    return ws;
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
    instance.on('destroy', win => this.emit('destroy-window', win));

    return instance;
  }

  /**
   * Gets a snapshot of the application session
   * @return {Object}
   */
  getSession() {
    const session = {
      args: Object.assign({}, this.state),
      name: this.metadata.name,
      windows: this.windows.map(w => w.getSession())
    };

    return session;
  }

  /**
   * Get a list of all running applications
   *
   * Does not return a reference, but rather a serialized list
   *
   * @return {Object[]}
   */
  static getApplications() {
    return applications.map(app => ({
      pid: app.pid,
      args: Object.assign({}, app.args),
      metadata: app.metadata,
      started: app.started,
      windows: app.windows.map(win => win.getSession()),
      destroy: () => app.destroy(),
      session: app.getSession()
    }));
  }

}
