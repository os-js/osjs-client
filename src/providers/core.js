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

import Application from '../application';
import Window from '../window';
import WindowBehavior from '../window-behavior';
import Session from '../session';
import Packages from '../packages';
import Tray from '../tray';
import Websocket from '../websocket';
import Clipboard from '../clipboard';
import * as translations from '../locale';
import {format, translatable, translatableFlat, getLocale} from '../utils/locale';
import {style, script, supportedMedia, playSound} from '../utils/dom';
import * as dnd from '../utils/dnd';
import {BasicApplication} from '../basic-application.js';
import {ServiceProvider} from '@osjs/common';
import {EventEmitter} from '@osjs/event-emitter';
import logger from '../logger';
import merge from 'deepmerge';


/*
 * Resolves various resources
 * TODO: Move all of this (and related) stuff to a Theme class
 */
const resourceResolver = (core) => {
  const media = supportedMedia();

  const getThemeName = (type) => {
    const defaultTheme = core.config('desktop.settings.' + type);
    return core.make('osjs/settings').get('osjs/desktop', type, defaultTheme);
  };

  const themeResource = path => {
    const theme = getThemeName('theme');

    return core.url(`themes/${theme}/${path}`); // FIXME: Use metadata ?
  };

  const getSoundThemeName = () => getThemeName('sounds');

  const soundResource = path => {
    if (!path.match(/\.([a-z]+)$/)) {
      const defaultExtension = 'mp3';
      const checkExtensions = ['oga', 'mp3'];
      const found = checkExtensions.find(str => media.audio[str] === true);
      const use = found || defaultExtension;

      path += '.' + use;
    }

    const theme = getSoundThemeName();

    return theme ? core.url(`sounds/${theme}/${path}`) : null; // FIXME: Use metadata ?
  };

  const soundsEnabled = () => !!getSoundThemeName();

  const icon = path => {
    const theme = getThemeName('icons');
    return core.url(`icons/${theme}/icons/${path}`); // FIXME: Use metadata ?
  };

  return {themeResource, soundResource, soundsEnabled, icon};
};

/*
 * Provides localization
 * TODO: Move to a Locale class
 */
const localeContract = (core, strs) => {
  const translate = translatable(core)(strs);

  return {
    format: format(core),
    translate,
    translatable: translatable(core),
    translatableFlat: translatableFlat(core),
    getLocale: (key = 'language') => {
      const ref = getLocale(core, key);
      return ref.userLocale || ref.defaultLocale;
    },
    setLocale: name => name in strs
      ? core.make('osjs/settings')
        .set('osjs/locale', 'language', name)
        .save()
        .then(() => core.emit('osjs/locale:change', name))
      : Promise.reject(translate('ERR_INVALID_LOCALE', name))
  };
};

/*
 * Provides window contract
 */
const windowContract = core => ({
  create: (options = {}) => new Window(core, options),
  list: () => Window.getWindows(),
  last: () => Window.lastWindow()
});

/**
 * OS.js Core Service Provider
 *
 * @desc Provides base services
 */
export default class CoreServiceProvider extends ServiceProvider {

  /**
   * @param {Object} core OS.js Core
   * @param {Object} [options] Arguments
   * @param {Function} [options.windowBehavior] Custom Window Behavior
   */
  constructor(core, options = {}) {
    super(core, options);

    this.session = new Session(core);
    this.tray = new Tray(core);
    this.pm = new Packages(core);
    this.clipboard = new Clipboard();

    window.OSjs = this.createGlobalApi();
  }

  /**
   * Get a list of services this provider registers
   */
  provides() {
    return [
      'osjs/application',
      'osjs/basic-application',
      'osjs/window',
      'osjs/windows',
      'osjs/event-handler',
      'osjs/window-behaviour',
      'osjs/dnd',
      'osjs/dom',
      'osjs/clipboard',
      'osjs/tray',
      'osjs/locale',
      'osjs/packages',
      'osjs/websocket',
      'osjs/session',
      'osjs/theme',
      'osjs/sounds'
    ];
  }

  destroy() {
    this.tray.destroy();
    this.pm.destroy();
    this.clipboard.destroy();
    this.session.destroy();

    super.destroy();
  }

  init() {
    this.initBaseProviders();
    this.initResourceProviders();

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    // FIXME: deprecated
    this.core.instance('osjs/event-handler', (...args) => {
      logger.warn('osjs/event-handler is deprecated, use osjs/event-emitter');
      return new EventEmitter(...args);
    });

    return this.pm.init();
  }

  initBaseProviders() {
    const strs = merge(translations, this.core.options.locales || {});

    this.core.instance('osjs/window', (options = {}) => new Window(this.core, options));
    this.core.instance('osjs/application', (data = {}) => new Application(this.core, data));
    this.core.instance('osjs/basic-application', (...args) => new BasicApplication(this.core, ...args));
    this.core.instance('osjs/websocket', (...args) => new Websocket(...args));
    this.core.instance('osjs/event-emitter', (...args) => new EventEmitter(...args));

    this.core.instance('osjs/tray', (options) => typeof options !== 'undefined'
      ? this.tray.create(options)
      : this.tray);

    this.core.singleton('osjs/windows', () => windowContract(this.core));
    this.core.singleton('osjs/locale', () => localeContract(this.core, strs));
    this.core.singleton('osjs/session', () => this.session);
    this.core.singleton('osjs/packages', () => this.pm);
    this.core.singleton('osjs/clipboard', () => this.clipboard);
    this.core.singleton('osjs/dnd', () => dnd);
    this.core.singleton('osjs/dom', () => ({script, style}));

    this.core.singleton('osjs/window-behavior', () => typeof this.options.windowBehavior === 'function'
      ? this.options.windowBehavior(this.core)
      : new WindowBehavior(this.core));
  }

  initResourceProviders() {
    const {themeResource, soundResource, soundsEnabled, icon} = resourceResolver(this.core);

    this.core.singleton('osjs/theme', () => ({
      resource: themeResource,
      icon: name => icon(name.replace(/(\.png)?$/, '.png'))
    }));

    this.core.singleton('osjs/sounds', () => ({
      resource: soundResource,
      play: (src, options = {}) => {
        if (soundsEnabled()) {
          const absoluteSrc = src.match(/^(\/|https?:)/)
            ? src
            : soundResource(src);

          if (absoluteSrc) {
            return playSound(absoluteSrc, options);
          }
        }

        return false;
      }
    }));
  }

  createGlobalApi() {
    const globalBlacklist = this.core.config('providers.globalBlacklist', []);
    const globalWhitelist = this.core.config('providers.globalWhitelist', []);

    const make = (...args) => {
      const [name] = args;

      if (this.core.has(name)) {
        const blacklisted = globalBlacklist.length > 0 && globalBlacklist.indexOf(name) !== -1;
        const notWhitelisted = globalWhitelist.length > 0 && globalWhitelist.indexOf(name) === -1;

        if (blacklisted || notWhitelisted) {
          throw new Error(`The provider '${name}' cannot be used via global scope`);
        }
      }

      return this.core.make(...args);
    };

    return Object.freeze({
      make,
      register: (...args) => this.pm.register(...args),
      url: (...args) => this.core.url(...args),
      run: (...args) => this.core.run(...args),
      open: (...args) => this.core.open(...args),
      request: (...args) => this.core.request(...args)
    });
  }

  start() {
    if (this.core.config('development')) {
      this.core.on('osjs/dist:changed', filename => {
        this.onDistChanged(filename);
      });

      this.core.on('osjs/packages:package:changed', name => {
        this.onPackageChanged(name);
      });
    }

    this.core.on('osjs/packages:metadata:changed', () => {
      this.pm.init();
    });
  }

  onDistChanged(filename) {
    const url = this.core.url(filename).replace(/^\//, '');
    const found = this.core.$resourceRoot.querySelectorAll('link[rel=stylesheet]');
    const map = Array.from(found).reduce((result, item) => {
      const src = item.getAttribute('href').split('?')[0].replace(/^\//, '');
      return {
        [src]: item,
        ...result
      };
    }, {});

    if (map[url]) {
      logger.debug('Hot-reloading', url);

      setTimeout(() => {
        map[url].setAttribute('href', url);
      }, 100);
    }
  }

  onPackageChanged(name) {
    // TODO: Reload themes as well
    Application.getApplications()
      .filter(proc => proc.metadata.name === name)
      .forEach(proc => proc.relaunch());
  }
}
