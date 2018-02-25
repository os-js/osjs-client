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

/**
 * Event Handler
 *
 * A standard event handling
 */
export default class EventHandler {

  /**
   * Create Event Handler
   * @param {String} [name] A name for logging
   */
  constructor(name = 'undefined') {
    this.name = name;
    this.events = {};
    this.intervals = [];
  }

  /**
   * Add an event handler
   * @param {String} name Event name
   * @param {Function} callback Callback function
   * @param {Object} [options] Options
   * @return {EventHandler} Returns current instance
   */
  on(name, callback, options = {}) {
    options = options || {};

    if (typeof callback !== 'function') {
      throw new TypeError('Invalid callback');
    }

    if (!this.events[name]) {
      this.events[name] = [];
    }

    this.events[name].push(callback);

    return this;
  }

  /**
   * Removes an event handler
   *
   * If no callback is provided, all events bound to given name will be removed.
   *
   * @param {String} name Event name
   * @param {Function} [callback] Callback function
   * @return {EventHandler} Returns current instance
   */
  off(name, callback = null) {
    if (!this.events[name]) {
      return this;
    }

    if (callback) {
      let i = this.events[name].length;
      while (i--) {
        if (this.events[name][i] === callback) {
          this.events[name].splice(i, 1);
        }
      }
    } else {
      this.events[name] = [];
    }

    return this;
  }

  /**
   * Emits an event
   *
   * @param {String} name Event name
   * @param {*} [args] Arguments
   * @return {EventHandler} Returns current instance
   */
  emit(name, ...args) {
    console.debug(`[${this.name}] emit(${name})`);

    if (!this.events[name]) {
      return this;
    }

    this.events[name].forEach(callback => callback(...args));

    return this;
  }

}
