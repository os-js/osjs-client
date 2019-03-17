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

import * as mediaQuery from 'css-mediaquery';
import defaultIcon from '../styles/logo-blue-32x32.png';

const CASCADE_DISTANCE = 10;
const MINIMUM_WIDTH = 100;
const MINIMUM_HEIGHT = 100;

/*
 * Creates window attributes from an object
 */
export const createAttributes = (attrs) => Object.assign({
  classNames: [],
  modal: false,
  ontop: false,
  gravity: false,
  moveable: true,
  resizable: true,
  focusable: true,
  maximizable: true,
  minimizable: true,
  sessionable: true,
  closeable: true,
  header: true,
  controls: true,
  visibility: 'global',
  shadowDOM: false,
  clamp: true,
  mediaQueries: {
    small: 'screen and (max-width: 640px)',
    medium: 'screen and (min-width: 640px) and (max-width: 1024px)',
    big: 'screen and (min-width: 1024px)'
  },
  minDimension: {
    width: MINIMUM_WIDTH,
    height: MINIMUM_HEIGHT
  },
  maxDimension: {
    width: -1,
    height: -1
  }
}, attrs);

/*
 * Creates window state from an object
 */
export const createState = (state, options, attrs) => Object.assign({
  title: options.title || options.id,
  icon: options.icon || defaultIcon,
  media: null,
  moving: false,
  resizing: false,
  loading: false,
  focused: false,
  maximized: false,
  minimized: false,
  zIndex: 1,
  styles: {},
  position: Object.assign({}, {
    left: null,
    top: null
  }, options.position),
  dimension: Object.assign({}, {
    width: Math.max(attrs.minDimension.width, MINIMUM_WIDTH),
    height: Math.max(attrs.minDimension.height, MINIMUM_HEIGHT)
  }, options.dimension)
}, state);

/*
 * Clamps position to viewport
 */
export const clampPosition = (rect, {dimension, position}) => {
  const maxLeft = rect.width - dimension.width;
  const maxTop = rect.height - dimension.height + rect.top;

  return {
    left: Math.min(maxLeft, position.left),
    top: Math.max(rect.top, Math.min(maxTop, position.top))
  };
};

/*
 * Window rendering callback function
 */
export const renderCallback = (win, callback) => {
  if (typeof callback === 'function') {
    if (win.attributes.shadowDOM) {
      try {
        const mode = typeof win.attributes.shadowDOM === 'string'
          ? win.attributes.shadowDOM
          : 'open';

        const shadow = win.$content.attachShadow({mode});

        callback(shadow, win);

        return;
      } catch (e) {
        console.warn('Shadow DOM not supported?', e);
      }
    }

    callback(win.$content, win);
  }
};

/*
 * Gets new position based on "gravity"
 */
export const positionFromGravity = (win, rect, gravity) => {
  let {left, top} = win.state.position;

  if (gravity === 'center') {
    left = (rect.width / 2) - (win.state.dimension.width / 2);
    top = (rect.height / 2) - (win.state.dimension.height / 2);
  } else if (gravity) {
    let hasVertical =  gravity.match(/top|bottom/);
    let hasHorizontal = gravity.match(/left|rigth/);

    if (gravity.match(/top/)) {
      top = rect.top;
    } else if (gravity.match(/bottom/)) {
      top = rect.height - (win.state.dimension.height) + rect.top;
    }

    if (gravity.match(/left/)) {
      left = rect.left;
    } else if (gravity.match(/right/)) {
      left = rect.width - (win.state.dimension.width);
    }

    if (!hasVertical && gravity.match(/center/)) {
      top = (rect.height / 2) - (win.state.dimension.height / 2);
    } else if (!hasHorizontal && gravity.match(/center/)) {
      left = (rect.width / 2) - (win.state.dimension.width / 2);
    }
  }

  return {left, top};
};

/*
 * Gets new dimension based on container
 */
export const dimensionFromElement = (win, rect, container) => {
  const innerBox = (container.parentNode.classList.contains('osjs-gui')
    ? container.parentNode
    : container).getBoundingClientRect();

  const outerBox = win.$content.getBoundingClientRect();
  const diffY = Math.ceil(outerBox.height - innerBox.height);
  const diffX = Math.ceil(outerBox.width - innerBox.width);
  const topHeight = win.$header.offsetHeight;

  const {left, top} = win.state.position;
  const min = win.attributes.minDimension;
  const max = win.attributes.maxDimension;

  let width = Math.max(container.offsetWidth + diffX, min.width);
  let height = Math.max(container.offsetHeight + diffY + topHeight, min.height);

  if (max.width > 0) {
    width = Math.min(width, max.width);
  }

  if (max.height > 0) {
    height = Math.min(height, max.height);
  }

  width = Math.max(width, container.offsetWidth);
  height = Math.max(height, container.offsetHeight);

  if (rect) {
    width = Math.min(width, rect.width - left);
    height = Math.min(height, rect.height - top);
  }

  return {width, height};
};

/*
 * Transforms vector values (ex float to integer)
 */
export const transformVectors = (rect, {width, height}, {top, left}) => {
  const transform = (val, attr) => {
    if (!isNaN(val)) {
      return Number.isInteger(val)
        ? val
        : Math.round(rect[attr] * parseFloat(val));
    }

    return val;
  };

  return {
    dimension: {
      width: transform(width, 'width'),
      height: transform(height, 'height')
    },
    position: {
      top: transform(top, 'height'),
      left: transform(left, 'width')
    }
  };
};

/*
 * Creates a clamper for resize/move
 */
const clamper = win => {
  const {maxDimension, minDimension} = win.attributes;
  const {position, dimension} = win.state;

  const maxPosition = {
    left: position.left + dimension.width - minDimension.width,
    top: position.top + dimension.height - minDimension.height
  };

  const clamp = (min, max, current) => {
    const value = min === -1 ? current : Math.max(min, current);
    return max === -1 ? value : Math.min(max, value);
  };

  return (width, height, top, left) => ({
    width: clamp(minDimension.width, maxDimension.width, width),
    height: clamp(minDimension.height, maxDimension.height, height),
    top: clamp(-1, maxPosition.top, top),
    left: clamp(-1, maxPosition.left, left)
  });
};

/*
 * Creates a resize handler
 */
export const resizer = (win, handle) => {
  const clamp = clamper(win);
  const {position, dimension} = win.state;
  const directions = handle.getAttribute('data-direction').split('');
  const going = dir => directions.indexOf(dir) !== -1;
  const xDir = going('e') ? 1 : (going('w') ? -1 : 0);
  const yDir = going('s') ? 1 : (going('n') ? -1 : 0);

  return (diffX, diffY) => {
    const width = dimension.width + (diffX * xDir);
    const height = dimension.height + (diffY * yDir);
    const top = yDir === -1 ? position.top + diffY : position.top;
    const left = xDir === -1 ? position.left + diffX : position.left;

    return clamp(width, height, top, left);
  };
};

/*
 * Creates a movement handler
 */
export const mover = (win, rect) => {
  const {position} = win.state;

  return (diffX, diffY) => {
    const top = Math.max(position.top + diffY, rect.top);
    const left = position.left + diffX;

    return {top, left};
  };
};

/*
 * Calculates a new initial position for window
 */
export const getCascadePosition = (win, rect, pos) => {
  const startX = CASCADE_DISTANCE + rect.left;
  const startY = CASCADE_DISTANCE + rect.top;
  const distance = CASCADE_DISTANCE;
  const wrap = CASCADE_DISTANCE * 2;

  const newX = startX + ((win.wid % wrap) * distance);
  const newY = startY + ((win.wid % wrap) * distance);
  const position = (key, value) => typeof pos[key] === 'number' && Number.isInteger(pos[key])
    ? Math.max(rect[key], pos[key])
    : value;

  return {top: position('top', newY), left: position('left', newX)};
};

/*
 * Normalizes event input (position)
 */
export const getEvent = (ev) => {
  let {clientX, clientY, target} = ev;
  const touch = ev.touches || ev.changedTouches || [];

  if (touch.length) {
    clientX = touch[0].clientX;
    clientY = touch[0].clientY;
  }

  return {clientX, clientY, touch: touch.length > 0, target};
};

const getScreenOrientation = screen => screen && screen.orientation
  ? screen.orientation.type
  : window.matchMedia('(orientation: portrait)') ? 'portrait' : 'landscape';

/*
 * Gets a media query name from a map
 */
export const getMediaQueryName = (win) => Object.keys(win.attributes.mediaQueries)
  .filter(name => mediaQuery.match(win.attributes.mediaQueries[name], {
    type: 'screen',
    orientation: getScreenOrientation(window.screen),
    width: win.$element.offsetWidth || win.state.dimension.width,
    height: win.$element.offsetHeight || win.state.dimension.height
  }))
  .pop();
