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

import Application from '../application';
import Window from '../window';
import WindowBehavior from '../window-behavior';
import Session from '../session';
import Packages from '../packages';
import Tray from '../tray';
import Websocket from '../websocket';
import Clipboard from '../clipboard';
import * as translations from '../locale';
import {format, translatable, translatableFlat} from '../utils/locale';
import {style, script, supportedMedia, playSound} from '../utils/dom';
import * as dnd from '../utils/dnd';
import {EventHandler, ServiceProvider} from '@osjs/common';

/*
 * Returns an immutable window object
 */
const getWindow = win => ({
  id: win.id,
  wid: win.wid,
  attributes: Object.assign({}, win.attributes),
  state: Object.assign({}, win.state),
  focus: () => win.focus(),
  blur: () => win.blur(),
  maximize: () => win.maximize(),
  raise: () => win.raise(),
  restore: () => win.restore(),
  close: () => win.close()
});

/*
 * Gets an immutable list of windows
 */
const getWindows = () => Window.getWindows().map(getWindow);

/*
 * Gets an immutable list of applications
 */
const getApplications = () => Application.getApplications().map(app => ({
  pid: app.pid,
  args: Object.assign({}, app.args),
  metadata: Object.assign({}, app.metadata),
  started: app.started,
  windows: app.windows.map(getWindow),
  emit: (...args) => app.emit(...args),
  destroy: () => app.destroy(),
  relaunch: () => app.relaunch(),
  session: app.getSession()
}));

/*
 * Gets the public facting API object
 */
const getPublicApi = core => {
  const allowed = ['osjs/packages', 'osjs/package', 'osjs/themes', 'osjs/theme', 'osjs/sounds', 'osjs/dialog'];
  const register = (...args) => core.make('osjs/packages').register(...args);

  const make = (...args) => {
    if (!core.config('development')) {
      if (core.has(args[0])) {
        if (allowed.indexOf(args[0]) === -1) {
          throw new Error(`You cannot use ${args[0]} via global API in production mode`);
        }
      }
    }

    return core.make(...args);
  };

  return Object.freeze({
    make,
    register,
    getWindows,
    getApplications,
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
  const basePath = core.config('public');

  const themeResource = path => {
    const defaultTheme = core.config('desktop.settings.theme');
    const theme = core.make('osjs/settings').get('osjs/desktop', 'theme', defaultTheme);
    return `${basePath}themes/${theme}/${path}`;
  };

  const soundResource = path => {
    if (!path.match(/\.([a-z]+)$/)) {
      const defaultExtension = 'mp3';
      const checkExtensions = ['oga', 'mp3'];
      const found = checkExtensions.find(str => media.audio[str] === true);
      const use = found || defaultExtension;

      path += '.' + use;
    }

    const defaultTheme = core.config('desktop.settings.sounds.name');
    const theme = core.make('osjs/settings').get('osjs/desktop', 'sounds.name', defaultTheme);

    return `${basePath}sounds/${theme}/${path}`;
  };

  const soundsEnabled = () => {
    const defaultState = core.config('desktop.settings.sounds.enabled');

    return core.make('osjs/settings')
      .get('osjs/desktop', 'sounds.enabled', defaultState);
  };

  const icon = path => {
    const defaultTheme = core.config('desktop.settings.icons');
    const theme = core.make('osjs/settings').get('osjs/desktop', 'icons', defaultTheme);
    return `${basePath}icons/${theme}/icons/${path}`;
  };

  return {themeResource, soundResource, soundsEnabled, icon};
};

/**
 * OS.js Core Service Provider
 *
 * @desc Provides base services
 */
export default class CoreServiceProvider extends ServiceProvider {

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
      'osjs/window',
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

  init() {
    const {themeResource, soundResource, soundsEnabled, icon} = resourceResolver(this.core);

    this.core.instance('osjs/websocket', (...args) => {
      return new Websocket(...args);
    });

    this.core.instance('osjs/application', (data = {}) => {
      return new Application(this.core, data);
    });

    this.core.instance('osjs/window', (options = {}) => {
      return new Window(this.core, options);
    });

    this.core.instance('osjs/event-handler', (...args) => {
      return new EventHandler(...args);
    });

    this.core.singleton('osjs/window-behavior', () => {
      return new WindowBehavior(this.core);
    });

    this.core.singleton('osjs/session', () => ({
      save: () => this.session.save(),
      load: (fresh = true) => this.session.load(fresh)
    }));

    this.core.singleton('osjs/dnd', () => dnd);

    this.core.singleton('osjs/dom', () => ({
      script,
      style
    }));

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

    const localeApi = {
      format: format(this.core),
      translate: translatable(this.core)(translations),
      translatable: translatable(this.core),
      translatableFlat: translatableFlat(this.core),
      setLocale: name => name in translations
        ? this.core.make('osjs/settings')
          .set('osjs/locale', 'language', name)
          .save()
          .then(() => this.core.emit('osjs/locale:change', name))
        : Promise.reject(localeApi.translate('ERR_INVALID_LOCALE', name))
    };

    this.core.singleton('osjs/locale', () => localeApi);

    this.core.singleton('osjs/packages', () => ({
      getCompatiblePackages: (...args) => this.pm.getCompatiblePackages(...args),
      getPackages: (...args) => this.pm.getPackages(...args),
      register: (...args) => this.pm.register(...args),
      launch: (...args) => this.pm.launch(...args),
      preload: (...args) => this.pm.preload(...args)
    }));

    this.core.instance('osjs/clipboard', () => ({
      set: v => this.clipboard.set(v),
      get: clear => this.clipboard.get(clear),
      clear: () => this.clipboard.clear()
    }));

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    this.core.singleton('osjs/theme', () => ({
      resource: themeResource,
      icon: name => icon(name.replace(/(\.png)?$/, '.png'))
    }));

    this.core.singleton('osjs/sounds', () => ({
      resource: soundResource,
      play: (src, options = {}) => {
        if (soundsEnabled) {
          const absoluteSrc = src.match(/^(\/|https?:)/)
            ? src
            : soundResource(src);

          return playSound(absoluteSrc, options);
        }

        return false;
      }
    }));

    return this.pm.init();
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
          console.info('Hot-reloading', url);

          setTimeout(() => {
            map[url].setAttribute('href', url);
          }, 100);
        }
      });

      this.core.on('osjs/packages:metadata:changed', () => {
        this.pm.init();
      });

      this.core.on('osjs/packages:package:changed', name => {
        // TODO: Reload themes as well
        Application.getApplications()
          .filter(proc => proc.metadata.name === name)
          .forEach(proc => proc.relaunch());
      });
    }
  }

}
