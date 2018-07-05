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
import merge from 'deepmerge';
import {style} from './utils/dom';

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

const handleTabOnTextarea = ev => {
  const input = ev.target;
  let {selectionStart, selectionEnd, value} = input;

  input.value = value.substring(0, selectionStart)
    + '\t'
    + value.substring(selectionEnd, value.length);

  selectionStart++;

  input.selectionStart = selectionStart;
  input.selectionEnd = selectionStart;
};

/**
 * Desktop Class
 *
 * @desc Handles the Desktop
 */
export default class Desktop {

  /**
   * Create Desktop
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    this.core = core;
    this.$theme = null;
    this.$styles = document.createElement('style');
    this.$styles.setAttribute('type', 'text/css');
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
    if (this.$styles && this.$styles.parentNode) {
      this.$styles.remove();
    }
    this.$styles = null;

    if (this.$theme && this.$theme.parentNode) {
      this.$theme.remove();
    }
    this.$theme = null;
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

    // Handles tab-ing
    // TODO: Handle this better
    this.core.$root.addEventListener('keydown', e => {
      if (!e.target) {
        return;
      }

      const {type, tagName} = e.target;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(tagName) !== -1;

      if (isInput && e.keyCode === 9) {
        e.preventDefault();

        const isTextfield = ['text', 'password', 'number', 'email'].indexOf(type) !== -1 ||
          tagName === 'TEXTAREA';

        if (isTextfield) {
          handleTabOnTextarea(e);
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

  /**
   * Update CSS
   */
  _updateCSS() {
    if (!this.$styles) {
      return;
    }

    this.$styles.innerHTML = TEMPLATE(this.subtract);
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

      this.core.$root.style.backgroundColor = background.color;

      this.core.$root.style.backgroundSize = background.style === 'color'
        ? 0
        : background.style;

      this.core.$root.style.backgroundImage = background.style === 'color'
        ? undefined
        : `url(${background.src})`;
    };

    applyCss(newSettings);
    applyOverlays('osjs/panels', newSettings.panels);
    applyOverlays('osjs/widgets', newSettings.widgets);

    this.applyTheme(newSettings.theme);
  }

  /**
   * Sets the current theme from settings
   */
  applyTheme(name) {
    name = name || this.core.config('desktop.theme');

    if (this.$theme && this.$theme.parentNode) {
      this.$theme.remove();
    }

    const basePath = this.core.config('public');
    const src = `${basePath}themes/${name}/index.css`;

    this.$theme = style(this.core.$resourceRoot, src)
      .then(el => (this.$theme = el));
  }

  onDeveloperMenu(ev) {
    this.core.make('osjs/contextmenu').show({
      position: ev,
      menu: [
        {
          label: 'Kill All',
          onclick: () => Application.destroyAll()
        },
        {
          label: 'Applications',
          items: Application.getApplications().map(proc => ({
            label: `${proc.metadata.name} (${proc.pid})`,
            items: [
              {
                label: 'Kill',
                onclick: () => proc.destroy()
              },
              {
                label: 'Reload',
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

    const setWallpaper = f => this.core.make('osjs/vfs')
      .url(f.path)
      .then(src => applySettings('background.src', src));

    const setTheme = t => applySettings('theme', t.name);

    const openWallpaperDialog = () => this.core.make('osjs/dialog', 'file', {
      mime: ['^image']
    }, (btn, filename) => {
      if (btn === 'ok') {
        setWallpaper(filename);
      }
    });

    const themes = this.core.make('osjs/packages')
      .getPackages(p => p.type === 'theme');

    const _ = this.core.make('osjs/locale').translate;

    this.core.make('osjs/contextmenu').show({
      position: ev,
      menu: [
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
        }
      ]
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
