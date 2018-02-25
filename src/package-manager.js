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

/*
 * Creates a new CSS DOM element
 */
const style = (root, src) => new Promise((resolve, reject) => {
  const el = document.createElement('link');
  el.setAttribute('rel', 'stylesheet');
  el.setAttribute('type', 'text/css');
  el.onload = () => resolve(el);
  el.onerror = (err) => reject(err);
  el.setAttribute('href', src);

  root.appendChild(el);
});

/*
 * Creates a new Script DOM element
 */
const script = (root, src) => new Promise((resolve, reject) => {
  const el = document.createElement('script');
  el.onreadystatechange = function() {
    if ((this.readyState === 'complete' || this.readyState === 'loaded')) {
      resolve(el);
    }
  };
  el.onerror = (err) => reject(err);
  el.onload = () => resolve(el);
  el.src = src;

  root.appendChild(el);
});

/*
 * Fetch package manifest
 */
const fetchManifest = async () => {
  const response = await fetch('metadata.json')
  const metadata = await response.json();

  return metadata;
};

/*
 * OS.js Package Manager
 */
export default class PackageManager {

  /**
   * Create package manage
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    this.core = core;
    this.packages = [];
    this.metadata = [];
  }

  /**
   * Destroy package manager
   */
  destroy() {

  }

  /**
   * Initializes package manager
   */
  async init() {
    console.debug('PackageManager::init()');

    this.metadata = await fetchManifest();
  }

  /**
   * Loads all resources required for a package
   * @param {Array} list A list of resources
   * @return {String[]} A list of failed resources
   */
  async preload(list) {
    const root = this.core.$root;

    console.group('PackageManager::preload()');

    let failed = [];
    for (let i = 0; i < list.length; i++) {
      const entry = list[i];
      console.debug('PackageManager::preload()', entry);

      try {
        const el = entry.match(/\.js$/)
          ? await script(root, entry)
          : await style(root, entry);

        console.debug('=>', el);
      } catch (e) {
        failed.push(entry);
        console.warn(e);
      }
    }

    console.groupEnd();

    return failed;
  }

  /**
   * Launches a package
   *
   * @param {String} name Package name
   * @param {Object} [args] Launch arguments
   * @param {Object} [options] Launch options
   * @return {Application}
   */
  async launch(name, args = {}, options = {}) {
    const metadata = this.metadata.find(pkg => pkg.name === name);
    if (!metadata) {
      throw new Error(`Package Metadata ${name} not found`);
    }

    const errors = await this.preload(metadata.files.map(f => `packages/${name}/${f}`));
    if (errors.length) {
      console.warn(errors);
      throw new Error(`Package Loading ${name} failed`);
    }

    const found = this.packages.find(pkg => pkg.metadata.name === name);
    if (!found) {
      throw new Error(`Package Runtime ${name} not found`);
    }


    let app;
    console.group('PackageManager::launch()');

    try {
      app = found.callback(this.core, args, options);
    } catch (e) {
      console.warn(e);
    } finally {
      console.groupEnd()
      return app;
    }
  }

  /**
   * Registers a package
   *
   * @param {Object} metadata Package metadata
   * @param {Function} callback Callback function to construct application instance
   */
  register(metadata, callback) {
    console.log('PackageManager::register()', metadata);

    this.packages.push({
      metadata,
      callback
    });
  }
}
