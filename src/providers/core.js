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

/*
 * Gets the public facting API object
 */
const getPublicApi = core => {
  const globalBlacklist = core.config('providers.globalBlacklist', []);
  const globalWhitelist = core.config('providers.globalWhitelist', []);
  const register = (...args) => core.make('osjs/packages').register(...args);

  const make = (...args) => {
    const [name] = args;

    if (core.has(name)) {
      const blacklisted = globalBlacklist.length > 0 && globalBlacklist.indexOf(name) !== -1;
      const notWhitelisted = globalWhitelist.length > 0 && globalWhitelist.indexOf(name) === -1;

      if (blacklisted || notWhitelisted) {
        throw new Error(`The provider '${name}' cannot be used via global scope`);
      }
    }

    return core.make(...args);
  };

  return Object.freeze({
    make,
    register,
    url: (...args) => core.url(...args),
    run: (...args) => core.run(...args),
    open: (...args) => core.open(...args),
    request: (...args) => core.request(...args)
  });
};

/*
 * Resolves various resources
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

/**
 * OS.js Core Service Provider
 *
 * @desc Provides base services
 */
export default class CoreServiceProvider extends ServiceProvider {

  /**
   * @param {Object} core OS.js Core
   * @param {Object} [args] Arguments
   * @param {Function} [args.windowBehavior] Custom Window Behavior
   */
  constructor(core, args = {}) {
    super(core);

    window.OSjs = getPublicApi(core);

    this.session = new Session(core);
    this.tray = new Tray(core);
    this.pm = new Packages(core);
    this.clipboard = new Clipboard();
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

    super.destroy();
  }

  init() {
    this.initBaseProviders();
    this.initUtilProviders();
    this.initTrayProvider();
    this.initLocaleProvider();
    this.initResourceProviders();

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    return this.pm.init();
  }

  initBaseProviders() {
    const createWindow = (options = {}) => {
      return new Window(this.core, options);
    };

    this.core.instance('osjs/websocket', (...args) => {
      return new Websocket(...args);
    });

    this.core.instance('osjs/application', (data = {}) => {
      return new Application(this.core, data);
    });

    this.core.instance('osjs/basic-application', (proc, win, options = {}) => {
      return new BasicApplication(this.core, proc, win, options);
    });

    this.core.instance('osjs/window', createWindow);

    this.core.singleton('osjs/windows', () => ({
      create: createWindow,
      list: () => Window.getWindows(),
      last: () => Window.lastWindow()
    }));

    this.core.instance('osjs/event-handler', (...args) => {
      console.warn('osjs/event-handler is deprecated, use osjs/event-emitter');
      return new EventEmitter(...args);
    });

    this.core.instance('osjs/event-emitter', (...args) => {
      return new EventEmitter(...args);
    });

    this.core.singleton('osjs/window-behavior', () => {
      if (typeof this.options.windowBehavior === 'function') {
        return this.options.windowBehavior(this.core);
      }

      return new WindowBehavior(this.core);
    });

    this.core.singleton('osjs/session', () => ({
      save: () => this.session.save(),
      load: (fresh = true) => this.session.load(fresh)
    }));

    this.core.singleton('osjs/packages', () => ({
      getCompatiblePackages: (...args) => this.pm.getCompatiblePackages(...args),
      getPackages: (...args) => this.pm.getPackages(...args),
      register: (...args) => this.pm.register(...args),
      launch: (...args) => this.pm.launch(...args),
      running: () => this.pm.running
    }));

    this.core.instance('osjs/clipboard', () => this.clipboard);
  }

  initUtilProviders() {
    this.core.singleton('osjs/dnd', () => dnd);

    this.core.singleton('osjs/dom', () => ({
      script,
      style
    }));
  }

  initTrayProvider() {
    const trayApi = {
      create: (options, handler) => this.tray.create(options, handler),
      list: () => this.tray.entries.map(e => Object.assign({}, e))
    };

    this.core.instance('osjs/tray', (options) => {
      if (typeof options !== 'undefined') {
        return trayApi.create(options);
      }

      return trayApi;
    });
  }

  initLocaleProvider() {
    const localeApi = {
      format: format(this.core),
      translate: translatable(this.core)(translations),
      translatable: translatable(this.core),
      translatableFlat: translatableFlat(this.core),
      getLocale: (key = 'language') => {
        const ref = getLocale(this.core, key);
        return ref.userLocale || ref.defaultLocale;
      },
      setLocale: name => name in translations
        ? this.core.make('osjs/settings')
          .set('osjs/locale', 'language', name)
          .save()
          .then(() => this.core.emit('osjs/locale:change', name))
        : Promise.reject(localeApi.translate('ERR_INVALID_LOCALE', name))
    };

    this.core.singleton('osjs/locale', () => localeApi);
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

  start() {
    if (this.core.config('development')) {
      this.core.on('osjs/dist:changed', filename => {
        const url = this.core.url(filename).replace(/^\//, '');
        const found = this.core.$resourceRoot.querySelectorAll('link[rel=stylesheet]');
        const map = Array.from(found).reduce((result, item) => {
          const src = item.getAttribute('href').split('?')[0].replace(/^\//, '');
          return Object.assign({
            [src]: item
          }, result);
        }, {});

        if (map[url]) {
          console.debug('Hot-reloading', url);

          setTimeout(() => {
            map[url].setAttribute('href', url);
          }, 100);
        }
      });

      this.core.on('osjs/packages:package:changed', name => {
        // TODO: Reload themes as well
        Application.getApplications()
          .filter(proc => proc.metadata.name === name)
          .forEach(proc => proc.relaunch());
      });
    }

    this.core.on('osjs/packages:metadata:changed', () => {
      this.pm.init();
    });
  }

}
