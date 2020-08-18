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
 * @licence Simplified BSD License
 */

/**
 * Clipboard Data
 *
 * @typedef {Object} CliboardData
 * @property {string} [type] Optional data type
 * @property {*} data
 */

export default class Clipboard {

  /**
   * Create new clipboard
   */
  constructor() {
    /**
     * @type {CliboardData}
     */
    this.clipboard = undefined;

    this.clear();
  }

  /**
   * Destroy clipboard
   */
  destroy() {
    this.clear();
  }

  /**
   * Clear clipboard
   */
  clear() {
    this.clipboard = {data: undefined, type: undefined};
  }

  /**
   * Set clipboard data
   * @param {*} data Clipboard data. For async data, provide a function that returns a promise
   * @param {string} [type] Optional type used by applications for identifying content
   */
  set(data, type) {
    this.clipboard = {data, type};
  }

  /**
   * Checks if current clipboard data has this type
   * @param {string|RegExp} type Data type
   * @return {boolean}
   */
  has(type) {
    if (type instanceof RegExp) {
      return typeof this.clipboard.type === 'string' &&
        !!this.clipboard.type.match(type);
    }
    return this.clipboard.type === type;
  }

  /**
   * Gets clipboard data
   * @param {boolean} [clear=false] Clear clipboard
   * @return {Promise<*>}
   */
  get(clear = false) {
    const {data} = this.clipboard;
    const result = typeof data === 'function'
      ? data()
      : data;

    if (clear) {
      this.clear();
    }

    return Promise.resolve(result);
  }
}
