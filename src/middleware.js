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

/**
 * Middleware Data
 *
 * @typedef {Object} MiddlewareData
 * @property {string} [group] Middleware group
 */

/**
 * Middleware Manager
 */
export default class Middleware {

  /**
   * Create new middleware
   */
  constructor() {
    /**
     * @type {MiddlewareData}
     */
    this.middleware = {};
  }

  /**
   * Destroy middleware
   */
  destroy() {
    this.clear();
  }

  /**
   * Clear middleware
   */
  clear() {
    this.middleware = {};
  }

  /**
   * Add middleware function to a group
   * @param {string} group Middleware group
   * @param {Function} callback Middleware function to add
   */
  add(group, callback) {
    if (!this.middleware[group]) {
      this.middleware[group] = [];
    }

    this.middleware[group].push(callback);
  }

  /**
   * Remove middleware function from a group
   * @param {string} group Middleware group
   * @param {Function} callback Middleware function to remove
   */
  remove(group, callback) {
    if (this.middleware[group]) {
      this.middleware[group] =
        this.middleware[group].filter(cb => cb !== callback);
    }
  }

  /**
   * Gets middleware functions for a group
   * @param {string} group Middleware group
   * @return {Function[]}
   */
  get(group) {
    return this.middleware[group] || [];
  }
}
