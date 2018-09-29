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

import {ServiceProvider} from '@osjs/common';
import {supportedMedia, playSound} from '../utils/dom';
import Desktop from '../desktop';

/**
 * OS.js Desktop Service Provider
 *
 * @desc Provides desktop features
 */
export default class DesktopServiceProvider extends ServiceProvider {

  constructor(core) {
    super(core);

    this.desktop = new Desktop(core);
  }

  destroy() {
    this.desktop = this.desktop.destroy();
  }

  /**
   * Get a list of services this provider registers
   */
  provides() {
    return [
      'osjs/desktop',
      'osjs/theme',
      'osjs/sounds'
    ];
  }

  init() {
    this.desktop.init();

    const media = supportedMedia();

    this.core.singleton('osjs/desktop', () => ({
      addContextMenuEntries: entries => this.desktop.addContextMenu(entries),
      applySettings: settings => this.desktop.applySettings(settings),
      getRect: () => this.desktop.getRect()
    }));

    const basePath = this.core.config('public');

    const themeResource = path => {
      const defaultTheme = this.core.config('desktop.settings.theme');
      const theme = this.core.make('osjs/settings').get('osjs/desktop', 'theme', defaultTheme);
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

      const defaultTheme = this.core.config('desktop.settings.sounds.name');
      const theme = this.core.make('osjs/settings').get('osjs/desktop', 'sounds.name', defaultTheme);

      return `${basePath}sounds/${theme}/${path}`;
    };

    const soundsEnabled = () => {
      const defaultState = this.core.config('desktop.settings.sounds.enabled');

      return this.core.make('osjs/settings')
        .get('osjs/desktop', 'sounds.enabled', defaultState);
    };

    const icon = path => {
      const defaultTheme = this.core.config('desktop.settings.icons');
      const theme = this.core.make('osjs/settings').get('osjs/desktop', 'icons', defaultTheme);
      return `${basePath}icons/${theme}/icons/${path}`;
    };

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

    this.core.on('osjs/core:started', () => {
      this.desktop.applySettings();
    });
  }

  start() {
    this.desktop.start();
  }
}
