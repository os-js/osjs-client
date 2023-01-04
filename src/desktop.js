/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
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

import {EventEmitter} from '@osjs/event-emitter';
import Application from './application';
import {handleTabOnTextarea} from './utils/dom';
import {matchKeyCombo} from './utils/input';
import {DesktopIconView} from './adapters/ui/iconview';
import {
  isDroppingImage,
  applyBackgroundStyles,
  createPanelSubtraction,
  isVisible
} from './utils/desktop';
import Window from './window';
import Search from './search';
import merge from 'deepmerge';
import logger from './logger';

/**
 * TODO: typedef
 * @typedef {Object} DesktopContextMenuEntry
 */

/**
 * @typedef {Object} DesktopIconViewSettings
 */

/**
 * TODO: typedef
 * @typedef {Object} DesktopSettings
 * @property {DesktopIconViewSettings} [iconview]
 */

/**
 * Desktop Options
 *
 * @typedef {Object} DeskopOptions
 * @property {object[]} [contextmenu={}] Default Context menu items
 */

/**
 * Desktop Viewport Rectangle
 *
 * @typedef {Object} DesktopViewportRectangle
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * Desktop Class
 */
export default class Desktop extends EventEmitter {

  /**
   * Create Desktop
   *
   * @param {Core} core Core reference
   * @param {DesktopOptions} [options={}] Options
   */
  constructor(core, options = {}) {
    super('Desktop');

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Desktop Options
     * @type {DeskopOptions}
     * @readonly
     */
    this.options = {
      contextmenu: [],
      ...options
    };

    /**
     * Theme DOM elements
     * @type {Element[]}
     */
    this.$theme = [];

    /**
     * Icon DOM elements
     * @type {Element[]}
     */
    this.$icons = [];

    /**
     * Default context menu entries
     * @type {DesktopContextMenuEntry[]}
     */
    this.contextmenuEntries = [];

    /**
     * Search instance
     * @type {Search|null}
     * @readonly
     */
    this.search = core.config('search.enabled') ? new Search(core, options.search || {}) : null;

    /**
     * Icon View instance
     * @type {DesktopIconView}
     * @readonly
     */
    this.iconview = new DesktopIconView(this.core);

    /**
     * Keyboard context dom element
     * @type {Element|null}
     */
    this.keyboardContext = null;

    /**
     * Desktop subtraction rectangle
     * TODO: typedef
     * @type {DesktopViewportRectangle}
     */
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

    if (this.iconview) {
      this.iconview.destroy();
    }

    this._removeIcons();
    this._removeTheme();

    super.destroy();
  }

  /**
   * Initializes Desktop
   */
  init() {
    this.initConnectionEvents();
    this.initUIEvents();
    this.initDragEvents();
    this.initKeyboardEvents();
    this.initGlobalKeyboardEvents();
    this.initMouseEvents();
    this.initBaseEvents();
    this.initLocales();
    this.initDeveloperTray();
  }

  /**
   * Initializes connection events
   */
  initConnectionEvents() {
    this.core.on('osjs/core:disconnect', ev => {
      logger.warn('Connection closed', ev);

      const _ = this.core.make('osjs/locale').translate;
      this.core.make('osjs/notification', {
        title: _('LBL_CONNECTION_LOST'),
        message: _('LBL_CONNECTION_LOST_MESSAGE')
      });
    });

    this.core.on('osjs/core:connect', (ev, reconnected) => {
      logger.debug('Connection opened');

      if (reconnected) {
        const _ = this.core.make('osjs/locale').translate;
        this.core.make('osjs/notification', {
          title: _('LBL_CONNECTION_RESTORED'),
          message: _('LBL_CONNECTION_RESTORED_MESSAGE')
        });
      }
    });

    this.core.on('osjs/core:connection-failed', (ev) => {
      logger.warn('Connection failed');

      const _ = this.core.make('osjs/locale').translate;
      this.core.make('osjs/notification', {
        title: _('LBL_CONNECTION_FAILED'),
        message: _('LBL_CONNECTION_FAILED_MESSAGE')
      });
    });
  }

  /**
   * Initializes user interface events
   */
  initUIEvents() {
    this.core.on(['osjs/panel:create', 'osjs/panel:destroy'], (panel, panels = []) => {
      this.subtract = createPanelSubtraction(panel, panels);

      try {
        this._updateCSS();
        this._clampWindows();
      } catch (e) {
        logger.warn('Panel event error', e);
      }

      this.core.emit('osjs/desktop:transform', this.getRect());
    });

    this.core.on('osjs/window:transitionend', (...args) => {
      this.emit('theme:window:transitionend', ...args);
    });

    this.core.on('osjs/window:change', (...args) => {
      this.emit('theme:window:change', ...args);
    });
  }

  /**
   * Initializes development tray icons
   */
  initDeveloperTray() {
    if (!this.core.config('development')) {
      return;
    }

    // Creates tray
    const tray = this.core.make('osjs/tray').create({
      title: 'OS.js developer tools'
    }, (ev) => this.onDeveloperMenu(ev));

    this.core.on('destroy', () => tray.destroy());
  }

  /**
   * Initializes drag-and-drop events
   */
  initDragEvents() {
    const {droppable} = this.core.make('osjs/dnd');

    droppable(this.core.$contents, {
      strict: true,
      ondrop: (ev, data, files) => {
        const droppedImage = isDroppingImage(data);
        if (droppedImage) {
          this.onDropContextMenu(ev, data);
        }
      }
    });
  }

  /**
   * Initializes keyboard events
   */
  initKeyboardEvents() {
    const forwardKeyEvent = (n, e) => {
      const w = Window.lastWindow();
      if (isVisible(w)) {
        w.emit(n, e, w);
      }
    };

    const isWithinContext = (target) => this.keyboardContext &&
      this.keyboardContext.contains(target);

    const isWithinWindow = (w, target) => w &&
      w.$element.contains(target);

    const isWithin = (w, target) => isWithinWindow(w, target) ||
      isWithinContext(target);

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

        if (isWithin(w, e.target)) {
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
  }

  /**
   * Initializes global keyboard events
   */
  initGlobalKeyboardEvents() {
    let keybindings = [];

    const defaults = this.core.config('desktop.settings.keybindings', {});

    const reload = () => {
      keybindings = this.core.make('osjs/settings')
        .get('osjs/desktop', 'keybindings', defaults);
    };

    window.addEventListener('keydown', ev => {
      Object.keys(keybindings).some(eventName => {
        const combo = keybindings[eventName];
        const result = matchKeyCombo(combo, ev);
        if (result) {
          this.core.emit('osjs/desktop:keybinding:' + eventName, ev);
        }
      });
    });

    this.core.on('osjs/settings:load', reload);
    this.core.on('osjs/settings:save', reload);
    this.core.on('osjs/core:started', reload);

    const closeBindingName = 'osjs/desktop:keybinding:close-window';
    const closeBindingCallback = () => {
      const w = Window.lastWindow();
      if (isVisible(w)) {
        w.close();
      }
    };
    this.core.on(closeBindingName, closeBindingCallback);
  }

  /**
   * Initializes mouse events
   */
  initMouseEvents() {
    // Custom context menu
    this.core.$contents.addEventListener('contextmenu', ev => {
      if (ev.target === this.core.$contents) {
        this.onContextMenu(ev);
      }
    });

    // A hook to prevent iframe events when dragging mouse
    window.addEventListener('mousedown', () => {
      let moved = false;

      const onmousemove = () => {
        if (!moved) {
          moved = true;

          this.core.$root.setAttribute('data-mousemove', String(true));
        }
      };

      const onmouseup = () => {
        moved = false;

        this.core.$root.setAttribute('data-mousemove', String(false));
        window.removeEventListener('mousemove', onmousemove);
        window.removeEventListener('mouseup', onmouseup);
      };

      window.addEventListener('mousemove', onmousemove);
      window.addEventListener('mouseup', onmouseup);
    });
  }

  /**
   * Initializes base events
   */
  initBaseEvents() {
    // Resize hook
    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        this._updateCSS();
        this._clampWindows(true);
      }, 200);
    });

    // Prevent navigation
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', () => {
      history.pushState(null, null, document.URL);
    });

    // Prevents background scrolling on iOS
    this.core.$root.addEventListener('touchmove', e => e.preventDefault());
  }

  /**
   * Initializes locales
   */
  initLocales() {
    // Right-to-left support triggers
    const rtls = this.core.config('locale.rtl');
    const checkRTL = () => {
      const locale = this.core.make('osjs/locale')
        .getLocale()
        .split('_')[0]
        .toLowerCase();

      const isRtl = rtls.indexOf(locale) !== -1;
      this.core.$root.setAttribute('data-dir', isRtl ? 'rtl' : 'ltr');
    };
    this.core.on('osjs/settings:load', checkRTL);
    this.core.on('osjs/settings:save', checkRTL);
    this.core.on('osjs/core:started', checkRTL);
  }

  /**
   * Starts desktop services
   */
  start() {
    if (this.search) {
      this.search.init();
    }

    this._updateCSS();
  }

  /**
   * Update CSS
   * @private
   */
  _updateCSS() {
    const mobile = this.core.config('windows.mobile');
    const isMobile = !mobile ? false : this.core.$root.offsetWidth <= mobile;
    this.core.$root.setAttribute('data-mobile', isMobile);

    if (this.core.$contents) {
      this.core.$contents.style.top = `${this.subtract.top}px`;
      this.core.$contents.style.left = `${this.subtract.left}px`;
      this.core.$contents.style.right = `${this.subtract.right}px`;
      this.core.$contents.style.bottom = `${this.subtract.bottom}px`;
    }
  }

  _clampWindows(resize) {
    if (resize && !this.core.config('windows.clampToViewport')) {
      return;
    }

    Window.getWindows().forEach(w => w.clampToViewport());
  }

  /**
   * Adds something to the default contextmenu entries
   * @param {DesktopContextMenuEntry[]} entries
   */
  addContextMenu(entries) {
    this.contextmenuEntries = this.contextmenuEntries.concat(entries);
  }

  /**
   * Applies settings and updates desktop
   * @param {DesktopSettings} [settings] Use this set instead of loading from settings
   * @return {DesktopSettings} New settings
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

    // TODO: Multiple panels
    applyOverlays('osjs/panels', (newSettings.panels || []).slice(-1));
    applyOverlays('osjs/widgets', newSettings.widgets);

    this.applyTheme(newSettings.theme);
    this.applyIcons(newSettings.icons);

    this.applyIconView(newSettings.iconview);

    this.core.emit('osjs/desktop:applySettings');

    return {...newSettings};
  }

  /**
   * Removes current style theme from DOM
   * @private
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
   * @private
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
   * Adds or removes the icon view
   * @param {DesktopIconViewSettings} settings
   */
  applyIconView(settings) {
    if (!this.iconview) {
      return;
    }

    if (settings.enabled) {
      this.iconview.render(settings.path);
    } else {
      this.iconview.destroy();
    }
  }

  /**
   * Sets the current icon theme from settings
   * @param {string} name Icon theme name
   * @return {Promise<undefined>}
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
   * @param {string} name Theme name
   * @return {Promise<undefined>}
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
            logger.warn('Exception while calling theme callback', e);
          }
        }

        this.$theme = Object.values(elements);

        this.emit('theme:init');
      });
  }

  /**
   * Apply theme wrapper
   * @private
   * @param {string} name Theme name
   * @return {Promise<undefined>}
   */
  _applyTheme(name) {
    return this.core.make('osjs/packages')
      .launch(name)
      .then(result => {
        if (result.errors.length) {
          logger.error(result.errors);
        }

        return result;
      });
  }

  /**
   * Apply settings by key
   * @private
   * @param {string} k Key
   * @param {*} v Value
   * @return {Promise<boolean>}
   */
  _applySettingsByKey(k, v) {
    return this.core.make('osjs/settings')
      .set('osjs/desktop', k, v)
      .save()
      .then(() => this.applySettings());
  }

  /**
   * Create drop context menu entries
   * @param {Object} data Drop data
   * @return {Object[]}
   */
  createDropContextMenu(data) {
    const _ = this.core.make('osjs/locale').translate;
    const settings = this.core.make('osjs/settings');
    const desktop = this.core.make('osjs/desktop');
    const droppedImage = isDroppingImage(data);
    const menu = [];

    const setWallpaper = () => settings
      .set('osjs/desktop', 'background.src', data)
      .save()
      .then(() => desktop.applySettings());

    if (droppedImage) {
      menu.push({
        label: _('LBL_DESKTOP_SET_AS_WALLPAPER'),
        onclick: setWallpaper
      });
    }

    return menu;
  }

  /**
   * When developer menu is shown
   * @param {Event} ev
   */
  onDeveloperMenu(ev) {
    const _ = this.core.make('osjs/locale').translate;
    const s = this.core.make('osjs/settings').get();

    const storageItems = Object.keys(s)
      .map(k => ({
        label: k,
        onclick: () => {
          this.core.make('osjs/settings')
            .clear(k)
            .then(() => this.applySettings());
        }
      }));

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
        },
        {
          label: 'Clear Storage',
          items: storageItems
        }
      ]
    });
  }

  /**
   * When drop menu is shown
   * @param {Event} ev
   * @param {Object} data
   */
  onDropContextMenu(ev, data) {
    const menu = this.createDropContextMenu(data);

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu
    });
  }

  /**
   * When context menu is shown
   * @param {Event} ev
   */
  onContextMenu(ev) {
    const lockSettings = this.core.config('desktop.lock');
    const extras = [].concat(...this.contextmenuEntries.map(e => typeof e === 'function' ? e() : e));
    const config = this.core.config('desktop.contextmenu');
    const hasIconview = this.core.make('osjs/settings').get('osjs/desktop', 'iconview.enabled');

    if (config === false || config.enabled === false) {
      return;
    }

    const useDefaults = config === true || config.defaults; // NOTE: Backward compability

    const _ = this.core.make('osjs/locale').translate;
    const __ = this.core.make('osjs/locale').translatableFlat;

    const themes = this.core.make('osjs/packages')
      .getPackages(p => p.type === 'theme');

    const defaultItems = lockSettings ? [] : [{
      label: _('LBL_DESKTOP_SELECT_WALLPAPER'),
      onclick: () => {
        this.core.make('osjs/dialog', 'file', {
          mime: ['^image']
        }, (btn, file) => {
          if (btn === 'ok') {
            this._applySettingsByKey('background.src', file);
          }
        });
      }
    }, {
      label: _('LBL_DESKTOP_SELECT_THEME'),
      items: themes.map(t => ({
        label: __(t.title, t.name),
        onclick: () => {
          this._applySettingsByKey('theme', t.name);
        }
      }))
    }];

    if (hasIconview && this.iconview) {
      defaultItems.push({
        label: _('LBL_REFRESH'),
        onclick: () => this.iconview.iconview.reload()
      });
    }

    const base = useDefaults === 'function'
      ? config.defaults(this, defaultItems)
      : (useDefaults ? defaultItems : []);

    const provided = typeof this.options.contextmenu === 'function'
      ? this.options.contextmenu(this, defaultItems)
      : this.options.contextmenu || [];

    const menu = [
      ...base,
      ...provided,
      ...extras
    ];

    if (menu.length) {
      this.core.make('osjs/contextmenu').show({
        menu,
        position: ev
      });
    }
  }

  /**
   * Sets the keyboard context.
   *
   * Used for tabbing and other special events
   *
   * @param {Element} [ctx]
   */
  setKeyboardContext(ctx) {
    this.keyboardContext = ctx;
  }

  /**
   * Gets the rectangle of available space
   *
   * This is based on any panels etc taking up space
   *
   * @return {DesktopViewportRectangle}
   */
  getRect() {
    const root = this.core.$root;
    // FIXME: Is this now wrong because panels are not on the root anymore ?!
    const {left, top, right, bottom} = this.subtract;
    const width = root.offsetWidth - left - right;
    const height = root.offsetHeight - top - bottom;

    return {width, height, top, bottom, left, right};
  }
}
