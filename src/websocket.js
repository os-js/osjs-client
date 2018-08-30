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

/**
 * Application Socket
 *
 * @desc This is just an abstraction above the standard browser provided `WebSocket` class.
 * Since this class implements the EventHandler, use the `.on('event')` pattern instead of `.onevent`.
 *
 */
export default class Websocket extends EventHandler {

  /**
   * Create a new Websocket
   * @param {String} uri Connection URI
   * @param {Object} options Websocket options
   */
  constructor(name, uri, options = {}) {
    console.debug('Websocket::constructor()', name, uri);

    super('Websocket@' + name);

    /**
     * The Websocket
     * @type {WebSocket}
     */
    this.connection = new WebSocket(uri);

    this.connection.onopen = (...args) => this.emit('open', ...args);
    this.connection.onclose = (...args) => this.emit('close', ...args);
    this.connection.onmessage = (...args) => this.emit('message', ...args);
    this.connection.onerror = (...args) => this.emit('error', ...args);
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
