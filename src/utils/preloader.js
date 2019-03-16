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

import {style, script} from './dom';

/**
 * The Preloader loads styles and scripts
 */
export default class Preloader {

  constructor(root) {
    /**
     * A list of cached preloads
     * @type {String[]}
     */
    this.loaded = [];

    this.$root = root;
  }

  destroy() {
    this.loaded = [];
  }

  /**
   * Loads all resources required for a package
   * @param {string[]} list A list of resources
   * @param {boolean} [force=false] Force loading even though previously cached
   * @return {Promise<string[]>} A list of failed resources
   */
  load(list, force = false) {
    const cached = entry => force
      ? false
      : this.loaded.find(src => src === entry);

    const promises = list
      .filter(entry => !cached(entry))
      .map(entry => {
        console.debug('Packages::preload()', entry);

        const p = entry.match(/\.js$/)
          ? script(this.$root, entry)
          : style(this.$root, entry);

        return p
          .then(el => ({success: true, entry, el}))
          .catch(error => ({success: false, entry, error}));
      });

    return Promise.all(promises)
      .then(results => this._load(results, cached));
  }

  /**
   * Checks the loaded list
   * @param {Object[]} results Preload results
   * @param {string[]} cached Already cached preloads
   */
  _load(results, cached) {
    const successes = results.filter(res => res.success);
    successes.forEach(entry => {
      if (!cached(entry)) {
        this.loaded.push(entry);
      }
    });

    const failed = results.filter(res => !res.success);
    failed.forEach(failed => console.warn('Failed loading', failed.entry, failed.error));

    return {
      errors: failed.map(failed => failed.entry),
      elements: successes.reduce((result, iter) => {
        return Object.assign({}, result, {[iter.entry]: iter.el});
      }, {})
    };
  }
}
