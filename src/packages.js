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

import Application from './application';
import {style, script} from './utils/dom';

/**
 * A registered package reference
 * @property {Object} metadata Package metadata
 * @property {Function} callback Callback to instanciate
 * @typedef PackageReference
 */

/**
 * A package metadata
 * @property {String} name The package name
 * @property {String} [category] Package category
 * @property {String} [icon] Package icon
 * @property {Boolean} [singleton] If only one instance allowed
 * @property {Boolean} [autostart] Autostart on boot
 * @property {Boolean} [hidden] Hide from launch menus etc.
 * @property {String} [server] Server script filename
 * @property {String[]} [groups] Only available for users in this group
 * @property {String[]} [files] Files to preload
 * @property {Map<String, String>} title A map of locales and titles
 * @property {Map<String, String>} description A map of locales and titles
 * @typedef PackageMetadata
 */

/*
 * Fetch package manifest
 */
const fetchManifest = core =>
  fetch(core.url('/metadata.json'))
    .then(response => response.json());

/**
 * Package Manager
 *
 * @desc Handles indexing, loading and launching of OS.js packages
 */
export default class Packages {

  /**
   * Create package manage
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * A list of registered packages
     * @type {PackageReference[]}
     */
    this.packages = [];

    /**
     * The lost of loaded package metadata
     * @type {PackageMetadata[]}
     */
    this.metadata = [];

    /**
     * A list of cached preloads
     * @type {String[]}
     */
    this.loaded = [];

    /**
     * A list of running application names
     * @desc Mainly used for singleton awareness
     * @type {String[]}
     */
    this.running = [];
  }

  /**
   * Destroy package manager
   */
  destroy() {
    this.packages = [];
    this.metadata = [];
  }

  /**
   * Initializes package manager
   */
  init() {
    console.debug('Packages::init()');

    this.core.on('osjs/core:started', () => {
      this.metadata
        .filter(pkg => pkg.autostart === true)
        .forEach(pkg => this.launch(pkg.name));
    });

    return fetchManifest(this.core)
      .then(metadata => {
        this.metadata = metadata;
      });
  }

  /**
   * Loads all resources required for a package
   * @param {Array} list A list of resources
   * @param {Boolean} [force=false] Force loading even though previously cached
   * @return {String[]} A list of failed resources
   */
  preload(list, force = false) {
    const root = this.core.$resourceRoot;

    console.debug('Packages::preload()');

    const getSource = entry => this.core.config('development')
      ? entry + '?_time=' + (new Date()).getTime()
      : entry;

    const cached = entry => force ? false : this.loaded.find(src => src === entry);
    const entries = list.filter(entry => !cached(entry));
    const promises = entries.map(entry => {
      console.debug('Packages::preload()', entry);

      const p = entry.match(/\.js$/)
        ? script(root, getSource(entry))
        : style(root, getSource(entry));

      return p
        .then(() => ({success: true, entry}))
        .catch(error => ({success: false, entry, error}));
    });

    return Promise.all(promises)
      .then(results => {
        const successes = results.filter(res => res.success);
        successes.forEach(entry => {
          if (!cached(entry)) {
            this.loaded.push(entry);
          }
        });

        const failed = results.filter(res => !res.success);
        failed.forEach(failed => console.warn('Failed loading', failed.entry, failed.error));

        return failed.map(failed => failed.entry);
      });
  }

  /**
   * Launches a (application) package
   *
   * @param {String} name Package name
   * @param {Object} [args] Launch arguments
   * @param {Object} [options] Launch options
   * @param {Boolean} [options.forcePreload=false] Force preload reloading
   * @see PackageServiceProvider
   * @throws {Error}
   * @return {Promise<Application, Error>}
   */
  launch(name, args = {}, options = {}) {
    console.debug('Packages::launch()', name, args, options);

    let signaled = false;
    const _ = this.core.make('osjs/locale').translate;
    const metadata = this.metadata.find(pkg => pkg.name === name);
    if (!metadata) {
      throw new Error(_('ERR_PACKAGE_NOT_FOUND', name));
    }

    if (metadata.singleton) {
      const foundApp = Application.getApplications()
        .find(app => app.metadata.name === metadata.name);

      if (foundApp) {
        foundApp.emit('attention', args, options);
        signaled = true;

        return Promise.resolve(foundApp);
      }

      const found = this.running.filter(n => n === name);

      if (found.length > 0) {
        return new Promise((resolve, reject) => {
          this.core.on('osjs/application:launched', (n, a) => {
            if (signaled) {
              resolve(a);
            } else {
              if (n === name) {
                a.emit('attention', args, options);
                resolve(a);
              }
            }
          });
        });
      }
    } else if (metadata.type === 'theme') {
      throw new Error(_('ERR_PACKAGE_LAUNCH_THEME', name));
    }

    this.core.emit('osjs/application:launch', name, args, options);

    this.running.push(name);

    return this._launch(name, metadata, args, options);
  }

  /**
   * Wrapper for launching a (application) package
   *
   * @param {String} name Package name
   * @param {Object} args Launch arguments
   * @param {Object} options Launch options
   * @return {Application}
   */
  _launch(name, metadata, args, options) {
    const basePath = this.core.config('public');
    const _ = this.core.make('osjs/locale').translate;

    const dialog = e => {
      if (this.core.has('osjs/dialog')) {
        this.core.make('osjs/dialog', 'confirm', {
          title: _('ERR_PACKAGE_EXCEPTION', name),
          message: e.toString() + '\n\n' + (e.stack || 'no stack trace'),
          buttons: ['ok']
        }, () => { /* noop */});
      }
    };

    const fail = err => {
      this.core.emit('osjs/application:launched', name, false);

      dialog(err);

      throw new Error(err);
    };

    const preloads = metadata.files
      .map(f => this.core.url(`${basePath}apps/${metadata._path}/${f}`));

    const create = found => {
      let app;

      try {
        console.group('Packages::_launch()');
        app = found.callback(this.core, args, options, found.metadata);

        if (app instanceof Application) {
          app.on('destroy', () => {
            const foundIndex = this.running.findIndex(n => n === name);
            if (foundIndex !== -1) {
              this.running.splice(foundIndex, 1);
            }
          });
        } else {
          console.warn('The application', name, 'did not return an Application instance from registration');
        }
      } catch (e) {
        dialog(e);

        console.warn(e);
      } finally {
        this.core.emit('osjs/application:launched', name, app);
        console.groupEnd();
      }

      return app;
    };

    return this.preload(preloads, options.forcePreload === true)
      .then(errors => {
        if (errors.length) {
          fail(_('ERR_PACKAGE_LOAD', name, errors.join(', ')));
        }

        const found = this.packages.find(pkg => pkg.metadata.name === name);
        if (!found) {
          fail(_('ERR_PACKAGE_NO_RUNTIME', name));
        }

        return create(found);
      });
  }

  /**
   * Registers a package
   *
   * @param {String} name Package name
   * @param {Function} callback Callback function to construct application instance
   * @throws {Error}
   */
  register(name, callback) {
    console.debug('Packages::register()', name);

    const _ = this.core.make('osjs/locale').translate;
    const metadata = this.metadata.find(pkg => pkg.name === name);
    if (!metadata) {
      throw new Error(_('ERR_PACKAGE_NO_METADATA', name));
    }

    const foundIndex = this.packages.findIndex(pkg => pkg.metadata.name === name);
    if (foundIndex !== -1) {
      this.packages.splice(foundIndex, 1);
    }

    this.packages.push({
      metadata,
      callback
    });
  }

  /**
   * Gets a list of packages (metadata)
   * @param {Function} [filter] A filter function
   * @return {PackageMetadata[]}
   */
  getPackages(filter) {
    filter = filter || (() => true);

    const user = this.core.getUser();
    const metadata = this.metadata.map(m => Object.assign({}, m));

    const filterGroups = iter => iter.groups instanceof Array
      ? iter.groups.every(g => user.groups.indexOf(g) !== -1)
      : true;

    const filterBlacklist = iter => user.blacklist instanceof Array
      ? user.blacklist.indexOf(iter.name) === -1
      : true;

    return metadata
      .filter(filterGroups)
      .filter(filterBlacklist)
      .filter(filter);
  }

  /**
   * Gets a list of packages compatible with the given mime type
   * @param {string} mimeType MIME Type
   * @see PackageManager#getPackages
   * @return {PackageMetadata[]}
   */
  getCompatiblePackages(mimeType) {
    return this.getPackages(meta => {
      if (meta.mimes) {
        return !!meta.mimes.find(mime => {
          try {
            const re = new RegExp(mime);
            return re.test(mimeType);
          } catch (e) {
            console.warn(e);
          }

          return mime === mimeType;
        });
      }

      return false;
    });
  }
}
