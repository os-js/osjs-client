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

import logger from '../logger';
import {supportedMedia} from './dom';

const imageDropMimes = [
  'image/png',
  'image/jpe?g',
  'image/webp',
  'image/gif',
  'image/svg(\\+xml)?'
];

/**
 * Check if droppable data is a VFS type
 * @return {boolean}
 */
export const validVfsDrop = data => data && data.path;

/**
 * Check if droppable data contains image
 * @return {boolean}
 */
export const isDroppingImage = data => validVfsDrop(data) &&
  imageDropMimes.some(re => !!data.mime.match(re));

/**
 * Creates a set of styles based on background settings
 */
export const applyBackgroundStyles = (core, background) => {
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
    if (background.src === undefined) {
      styles.backgroundImage = undefined;
    } else if (typeof background.src === 'string') {
      styles.backgroundImage = `url(${background.src})`;
    } else if (background.src) {
      core.make('osjs/vfs')
        .url(background.src)
        .then(src => {
          setTimeout(() => ($root.style.backgroundImage = `url(${src})`), 1);
        })
        .catch(error => logger.warn('Error while setting wallpaper from VFS', error));
    }
  }

  Object.keys(styles).forEach(k => ($root.style[k] = styles[k]));
};

/**
 * Creates a rectangle with the realestate panels takes up
 */
export const createPanelSubtraction = (panel, panels) => {
  const subtraction = {top: 0, left: 0, right: 0, bottom: 0};
  const set = p => (subtraction[p.options.position] = p.$element.offsetHeight);

  if (panels.length > 0) {
    panels.forEach(set);
  } else {
    // Backward compability
    set(panel);
  }

  return subtraction;
};

export const isVisible = w => w &&
  !w.getState('minimized') &&
  w.getState('focused');

/*
 * Resolves various resources
 * TODO: Move all of this (and related) stuff to a Theme class
 */
export const resourceResolver = (core) => {
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

  const icon = (name) => {
    name = name.replace(/\.(png|svg|gif)$/, '');
    const {getMetadataFromName} = core.make('osjs/packages');
    const theme = getThemeName('icons');
    const metadata = getMetadataFromName(theme) || {};
    const iconDefinitions = metadata.icons || {};
    const extension = iconDefinitions[name] || 'png';

    return core.url(`icons/${theme}/icons/${name}.${extension}`);
  };

  return {themeResource, soundResource, soundsEnabled, icon};
};
