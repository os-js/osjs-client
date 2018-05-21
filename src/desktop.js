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
      this.subtract.top += panel.$element.offsetHeight;
      this._updateCSS();
    });

    this.core.on('osjs/panel:destroy', panel => {
      this.subtract.top -= panel.$element.offsetHeight;
      this._updateCSS();
    });

    this.core.on('osjs/desktop:apply', (settings) => this.applySettings(settings));

    // Prevents background scrolling on iOS
    this.core.$root.addEventListener('touchmove', e => e.preventDefault());

    // Handles dnd
    this.core.$root.addEventListener('dragover', e => {
      e.preventDefault();
    });
    this.core.$root.addEventListener('drop', e => {
      e.preventDefault();
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
  applySettings(settings = {}) {
    const userSettings = this.core.make('osjs/settings')
      .get('osjs/settings', {});

    const newSettings = merge(userSettings, settings, {
      arrayMerge: (dest, source) => source
    });

    const {font, background} = newSettings;

    this.core.$root.style.fontFamily = `${font}, sans-serif`;

    this.core.$root.style.backgroundSize = background.style === 'color'
      ? 0
      : background.style;

    this.core.$root.style.backgroundColor = background.color;

    this.core.$root.style.backgroundImage = background.style === 'color'
      ? undefined
      : `url(${background.src})`;

    this.applyTheme(newSettings.theme.name);

    const pp = this.core.make('osjs/panels');
    pp.removeAll();
    newSettings.panels.forEach(item => pp.create(item));
  }

  /**
   * Sets the current theme from settings
   */
  applyTheme() {
    if (this.$theme && this.$theme.parentNode) {
      this.$theme.remove();
    }

    const basePath = this.core.config('public');
    const name = this.core.config('theme');
    const src = `${basePath}themes/${name}/index.css`; // FIXME
    this.$theme = style(this.core.$resourceRoot, src);
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
