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

const eventNames = ['open', 'close', 'message', 'error'];

/**
 * Application Socket
 *
 * @desc This is just an abstraction above the standard browser provided `WebSocket` class.
 * Since this class implements the EventHandler, use the `.on('event')` pattern instead of `.onevent`.
 *
 */
export default class Websocket extends EventEmitter {

  /**
   * Create a new Websocket
   * @param {string} uri Connection URI
   * @param {object} options Websocket options
   */
  constructor(name, uri, options = {}) {
    console.debug('Websocket::constructor()', name, uri);

    super('Websocket@' + name);

    this.uri = uri;
    this.connected = false;
    this.connecting = false;
    this.reconnecting = false;
    this.connectfailed = false;
    this.options = Object.assign({
      interval: 1000,
      open: true
    }, options);

    /**
     * The Websocket
     * @type {WebSocket}
     */
    this.connection = null;

    this._attachEvents();

    if (this.options.open) {
      this.open();
    }
  }

  /**
   * Destroys the current connection
   */
  _destroyConnection() {
    if (!this.connection) {
      return;
    }

    eventNames.forEach(name => {
      this.connection[`on${name}`] = () => {};
    });

    this.reconnecting = clearInterval(this.reconnecting);
    this.connection = null;
  }

  /**
   * Attaches internal events
   */
  _attachEvents() {
    this.on('open', ev => {
      const reconnected = !!this.reconnecting;

      this.connected = true;
      this.reconnecting = false;
      this.connectfailed = false;
      this.reconnecting = clearInterval(this.reconnecting);

      this.emit('connected', ev, reconnected);
    });

    this.on('close', ev => {
      if (!this.connected && !this.connectfailed) {
        this.emit('failed', ev);

        this.connectfailed = true;
      }

      clearInterval(this.reconnecting);

      this._destroyConnection();

      this.connected = false;
      this.reconnecting = setInterval(() => {
        this.open();
      }, this.options.interval);

      this.emit('disconnected', ev);
    });
  }

  /**
   * Opens the connection
   * @param {boolean} [reconnect=false] Force reconnection
   */
  open(reconnect = false) {
    if (this.connection && !reconnect) {
      return;
    }

    this._destroyConnection();

    this.reconnecting = clearInterval(this.reconnecting);
    this.connection = new WebSocket(this.uri);

    eventNames.forEach(name => {
      this.connection[`on${name}`] = (...args) => this.emit(name, ...args);
    });
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
