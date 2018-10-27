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

import {EventEmitter} from '@osjs/event-emitter';
import Application from './application';
import {handleTabOnTextarea} from './utils/dom';
import Window from './window';
import Search from './search';
import merge from 'deepmerge';

const TEMPLATE = subtract => `
  .osjs-window[data-maximized=true] {
    top: ${subtract.top}px !important;
    left: ${subtract.left}px !important;
    right: ${subtract.right}px !important;
    bottom: ${subtract.bottom}px !important;
    width: calc(100% -  ${subtract.left + subtract.right}px) !important;
    height: calc(100% - ${subtract.top + subtract.bottom}px) !important;
  }
`;

/*
 * Creates a set of styles based on background settings
 */
const applyBackgroundStyles = (core, background) => {
  const {$root} = core;

  const styles = {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50% 50%',
    backgroundSize: 'auto',
    backgroundColor: background.color,
    backgroundImage: 'none'
  };

  if (background.style === 'cover' || background.style === 'contain') {
    styles.backgroundSize = background.style;
  } else if (background.style === 'repeat') {
    styles.backgroundRepeat = 'repeat';
  }

  if (background.style !== 'color') {
    if (typeof background.src === 'string') {
      styles.backgroundImage = `url(${background.src})`;
    } else {
      core.make('osjs/vfs')
        .url(background.src)
        .then(src => {
          setTimeout(() => ($root.style.backgroundImage = `url(${src})`), 1);
        })
        .catch(error => console.warn(error));
    }
  }

  Object.keys(styles).forEach(k => ($root.style[k] = styles[k]));
};

/**
 * Desktop Class
 *
 * @desc Handles the Desktop
 */
export default class Desktop extends EventEmitter {

  /**
   * Create Desktop
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    super('Desktop');

    this.core = core;
    this.$theme = [];
    this.$icons = [];
    this.$styles = document.createElement('style');
    this.$styles.setAttribute('type', 'text/css');
    this.contextmenuEntries = [];
    this.search = core.config('search.enabled') ? new Search(core) : null;
    this.subtract = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
  }

  /**
   * Destroy Desktop
   */
  destroy() {
    if (this.search) {
      this.search = this.search.destroy();
    }

    if (this.$styles && this.$styles.parentNode) {
      this.$styles.remove();
    }
    this.$styles = null;

    this._removeIcons();
    this._removeTheme();
  }

  /**
   * Initializes Desktop
   */
  init() {
    this.core.on('osjs/panel:create', panel => {
      this.subtract[panel.options.position] += panel.$element.offsetHeight;
      this._updateCSS();
      this.core.emit('osjs/desktop:transform', this.getRect());
    });

    this.core.on('osjs/panel:destroy', panel => {
      this.subtract[panel.options.position] -= panel.$element.offsetHeight;
      this._updateCSS();
      this.core.emit('osjs/desktop:transform', this.getRect());
    });

    this.core.on('osjs/core:disconnect', ev => {
      console.warn('Connection closed', ev);

      const _ = this.core.make('osjs/locale').translate;
      this.core.make('osjs/notification', {
        title: _('LBL_CONNECTION_LOST'),
        message: _('LBL_CONNECTION_LOST_MESSAGE')
      });
    });

    this.core.on('osjs/core:connect', (ev, reconnected) => {
      console.info('Connection opened');

      if (reconnected) {
        const _ = this.core.make('osjs/locale').translate;
        this.core.make('osjs/notification', {
          title: _('LBL_CONNECTION_RESTORED'),
          message: _('LBL_CONNECTION_RESTORED_MESSAGE')
        });
      }
    });

    this.core.on('osjs/window:transitionend', (...args) => {
      this.emit('theme:window:transitionend', ...args);
    });

    this.core.on('osjs/window:change', (...args) => {
      this.emit('theme:window:change', ...args);
    });

    // Creates tray
    const tray = this.core.make('osjs/tray').create({
      title: 'OS.js developer tools'
    }, (ev) => this.onDeveloperMenu(ev));

    this.core.on('destroy', () => tray.destroy());

    // Prevents background scrolling on iOS
    this.core.$root.addEventListener('touchmove', e => e.preventDefault());

    // Handles dnd
    this.core.$root.addEventListener('dragover', e => {
      e.preventDefault();
    });
    this.core.$root.addEventListener('drop', e => {
      e.preventDefault();
    });

    // Forward keypress events
    const isVisible = w => w &&
      !w.getState('minimized') &&
      w.getState('focused');

    const forwardKeyEvent = (n, e) => {
      const w = Window.lastWindow();
      if (isVisible(w)) {
        w.emit(n, e, w);
      }
    };

    const isWithinWindow = (w, target) => {
      return w && w.$element.contains(target);
    };

    ['keydown', 'keyup', 'keypress'].forEach(n => {
      this.core.$root.addEventListener(n, e => forwardKeyEvent(n, e));
    });

    this.core.$root.addEventListener('keydown', e => {
      if (!e.target) {
        return;
      }

      if (e.keyCode === 114) { // F3
        e.preventDefault();

        if (this.search) {
          this.search.show();
        }
      } else if (e.keyCode === 9) { // Tab
        const {tagName} = e.target;
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].indexOf(tagName) !== -1;
        const w = Window.lastWindow();

        if (isWithinWindow(w, e.target)) {
          if (isInput) {
            if (tagName === 'TEXTAREA') {
              handleTabOnTextarea(e);
            }
          } else {
            e.preventDefault();
          }
        } else {
          e.preventDefault();
        }
      }
    });

    this.core.$root.addEventListener('contextmenu', ev => {
      if (ev.target === this.core.$root) {
        this.onContextMenu(ev);
      }
    });

    this.core.$resourceRoot.appendChild(this.$styles);
  }

  start() {
    if (this.search) {
      this.search.init();
    }
  }

  /**
   * Update CSS
   */
  _updateCSS() {
    if (!this.$styles) {
      return;
    }

    this.$styles.innerHTML = TEMPLATE(this.subtract);
  }

  addContextMenu(entries) {
    this.contextmenuEntries = this.contextmenuEntries.concat(entries);
  }

  /**
   * Applies settings and updates desktop
   * @param {Object} [settings] Use this set instead of loading from settings
   */
  applySettings(settings) {
    const lockSettings = this.core.config('desktop.lock');
    const defaultSettings = this.core.config('desktop.settings');
    let newSettings;

    if (lockSettings) {
      newSettings = defaultSettings;
    } else {
      const userSettings = settings
        ? settings
        : this.core.make('osjs/settings').get('osjs/desktop');

      newSettings = merge(defaultSettings, userSettings, {
        arrayMerge: (dest, source) => source
      });
    }

    const applyOverlays = (test, list) => {
      if (this.core.has(test)) {
        const instance = this.core.make(test);
        instance.removeAll();
        list.forEach(item => instance.create(item));
      }
    };

    const applyCss = ({font, background}) => {
      this.core.$root.style.fontFamily = `${font}, sans-serif`;

      applyBackgroundStyles(this.core, background);
    };

    applyCss(newSettings);
    applyOverlays('osjs/panels', newSettings.panels);
    applyOverlays('osjs/widgets', newSettings.widgets);

    this.applyTheme(newSettings.theme);
    this.applyIcons(newSettings.icons);

    return Object.assign({}, newSettings);
  }

  /**
   * Removes current style theme from DOM
   */
  _removeTheme() {
    this.emit('theme:destroy');

    this.off([
      'theme:init',
      'theme:destroy',
      'theme:window:change',
      'theme:window:transitionend'
    ]);

    this.$theme.forEach(el => {
      if (el && el.parentNode) {
        el.remove();
      }
    });

    this.$theme = [];
  }

  /**
   * Removes current icon theme from DOM
   */
  _removeIcons() {
    this.$icons.forEach(el => {
      if (el && el.parentNode) {
        el.remove();
      }
    });

    this.$icons = [];
  }

  /**
   * Sets the current icon theme from settings
   */
  applyIcons(name) {
    name = name || this.core.config('desktop.icons');

    return this._applyTheme(name)
      .then(({elements, errors, callback, metadata}) => {
        this._removeIcons();

        this.$icons = Object.values(elements);

        this.emit('icons:init');
      });
  }

  /**
   * Sets the current style theme from settings
   */
  applyTheme(name) {
    name = name || this.core.config('desktop.theme');

    return this._applyTheme(name)
      .then(({elements, errors, callback, metadata}) => {
        this._removeTheme();

        if (callback && metadata) {
          try {
            callback(this.core, this, {}, metadata);
          } catch (e) {
            console.warn(e);
          }
        }

        this.$theme = Object.values(elements);

        this.emit('theme:init');
      });
  }

  _applyTheme(name, cb) {
    return this.core.make('osjs/packages')
      .launch(name)
      .then(result => {
        if (result.errors.length) {
          console.error(result.errors);
        }

        return result;
      });
  }

  onDeveloperMenu(ev) {
    const _ = this.core.make('osjs/locale').translate;
    this.core.make('osjs/contextmenu').show({
      position: ev,
      menu: [
        {
          label: _('LBL_KILL_ALL'),
          onclick: () => Application.destroyAll()
        },
        {
          label: _('LBL_APPLICATIONS'),
          items: Application.getApplications().map(proc => ({
            label: `${proc.metadata.name} (${proc.pid})`,
            items: [
              {
                label: _('LBL_KILL'),
                onclick: () => proc.destroy()
              },
              {
                label: _('LBL_RELOAD'),
                onclick: () => proc.relaunch()
              }
            ]
          }))
        }
      ]
    });
  }

  onContextMenu(ev) {
    const lockSettings = this.core.config('desktop.lock');
    if (lockSettings) {
      return;
    }

    const applySettings = (k, v) => this.core.make('osjs/settings')
      .set('osjs/desktop', k, v)
      .save()
      .then(() => this.applySettings());

    const setTheme = t => applySettings('theme', t.name);

    const openWallpaperDialog = () => this.core.make('osjs/dialog', 'file', {
      mime: ['^image']
    }, (btn, file) => {
      if (btn === 'ok') {
        applySettings('background.src', file);
      }
    });

    const themes = this.core.make('osjs/packages')
      .getPackages(p => p.type === 'theme');

    const _ = this.core.make('osjs/locale').translate;

    const extras = [].concat(...this.contextmenuEntries.map(e => typeof e === 'function' ? e() : e));

    const menu = [
      {
        label: _('LBL_DESKTOP_SELECT_WALLPAPER'),
        onclick: () => openWallpaperDialog()
      },
      {
        label: _('LBL_DESKTOP_SELECT_THEME'),
        items: themes.map(t => ({
          label: t.name,
          onclick: () => setTheme(t)
        }))
      },

      ...extras
    ];

    this.core.make('osjs/contextmenu').show({
      menu,
      position: ev
    });
  }

  /**
   * Gets the rectangle of available space
   *
   * @desc This is based on any panels etc taking up space
   * @return {Object}
   */
  getRect() {
    const root = this.core.$root;
    const {left, top, right, bottom} = this.subtract;
    const width = root.offsetWidth - left - right;
    const height = root.offsetHeight - top - bottom;

    return {width, height, top, bottom, left, right};
  }
}
