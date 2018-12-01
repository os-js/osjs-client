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

import {supportsPassive} from './utils/dom.js';
import * as mediaQuery from 'css-mediaquery';

const CASCADE_DISTANCE = 10;

const isPassive = supportsPassive();
const touchArg = isPassive ? {passive: true} : false;

/*
 * Map of available "actions"
 */
const actionMap = {
  maximize: (win) => win.maximize() ? null : win.restore(),
  minimize: (win) => win.minimize(),
  close: (win) => win.close()
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
const resizer = (win, handle) => {
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
const mover = (win, rect) => {
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
const getCascadePosition = (win, rect, pos) => {
  const startX = CASCADE_DISTANCE + rect.left;
  const startY = CASCADE_DISTANCE + rect.top;
  const distance = CASCADE_DISTANCE;
  const wrap = CASCADE_DISTANCE * 2;

  const newX = startX + ((win.wid % wrap) * distance);
  const newY = startY + ((win.wid % wrap) * distance);

  const top = typeof pos.top === 'number'
    ? Math.max(rect.top, pos.top)
    : newY;

  const left = typeof pos.left === 'number'
    ? Math.max(rect.left, pos.left)
    : newX;

  return {top, left};
};

/*
 * Normalizes event input (position)
 */
const getEvent = (ev) => {
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
const getMediaQueryName = (win) => Object.keys(win.attributes.mediaQueries)
  .filter(name => mediaQuery.match(win.attributes.mediaQueries[name], {
    type: 'screen',
    orientation: getScreenOrientation(window.screen),
    width: win.state.dimension.width,
    height: win.state.dimension.height
  }))
  .pop();

/**
 * Default Window Behavior
 *
 * @desc Controls certain events and their interaction with a window
 */
export default class WindowBehavior {
  /**
   * Create window behavior
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    this.core = core;

    this.lastAction = null;
  }

  /**
   * Initializes window behavior
   * @param {Window} win Window reference
   */
  init(win) {
    const ontouchstart = ev => this.mousedown(ev, win);
    const onmousedown = ev => this.mousedown(ev, win);
    const onclick = ev => this.click(ev, win);
    const ondblclick = ev => this.dblclick(ev, win);
    const ontrasitionend = ev => {
      if (win) {
        win.emit('transitionend');
      }
      this.core.emit('osjs/window:transitionend', ev, win);
    };

    win.$element.addEventListener('touchstart', ontouchstart, touchArg);
    win.$element.addEventListener('mousedown', onmousedown);
    win.$element.addEventListener('click', onclick);
    win.$element.addEventListener('dblclick', ondblclick);
    win.$element.addEventListener('transitionend', ontrasitionend);

    win.on('destroy', () => {
      if (win.$element) {
        win.$element.removeEventListener('touchstart', ontouchstart, touchArg);
        win.$element.removeEventListener('mousedown', onmousedown);
        win.$element.removeEventListener('click', onclick);
        win.$element.removeEventListener('dblclick', ondblclick);
        win.$element.removeEventListener('transitionend', ontrasitionend);
      }
    });

    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : {top: 0, left: 0};

    const {top, left} = getCascadePosition(win, rect, win.state.position);
    win.state.position.top = top;
    win.state.position.left = left;

    win.state.media = getMediaQueryName(win);
  }

  /**
   * Handles Mouse Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  click(ev, win) {
    if (this.lastAction) {
      return;
    }

    const target = ev.target;
    const hitButton = target.classList.contains('osjs-window-button');

    if (hitButton) {
      const action =  ev.target.getAttribute('data-action');
      actionMap[action](win);
    }
  }

  /**
   * Handles Mouse Double Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  dblclick(ev, win) {
    if (this.lastAction) {
      return;
    }

    const target = ev.target;
    const hitTitle = target.classList.contains('osjs-window-header');

    if (hitTitle) {
      if (win.state.maximized) {
        win.restore();
      } else if (win.state.minimized) {
        win.raise();
      } else {
        win.maximize();
      }
    }
  }

  /**
   * Handles Mouse Down Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  mousedown(ev, win) {
    let attributeSet = false;

    const {clientX, clientY, touch, target} = getEvent(ev);

    const checkMove = ev.ctrlKey
      ? win.$element.contains(target)
      : target.classList.contains('osjs-window-header');

    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : {top: 0, left: 0};

    const resize = target.classList.contains('osjs-window-resize')
      ? resizer(win, target)
      : null;

    const move = checkMove
      ? mover(win, rect)
      : null;

    const mousemove = (ev) => {
      if (!isPassive) {
        ev.preventDefault();
      }

      const transformedEvent = getEvent(ev);
      const posX = resize ? Math.max(rect.left, transformedEvent.clientX) : transformedEvent.clientX;
      const posY = resize ? Math.max(rect.top, transformedEvent.clientY) : transformedEvent.clientY;
      const diffX = posX - clientX;
      const diffY = posY - clientY;

      if (resize) {
        const {width, height, top, left} = resize(diffX, diffY);

        win._setState('dimension', {width, height}, false);
        win._setState('position', {top, left}, false);

        this.lastAction = 'resize';
      } else if (move) {
        const position = move(diffX, diffY);

        win._setState('position', position, false);

        this.lastAction = 'move';
      }

      if (this.lastAction) {
        win._setState(this.lastAction === 'move' ? 'moving' : 'resizing', true); // NOTE: This also updates DOM!

        if (!attributeSet) {
          this.core.$root.setAttribute('data-window-action', String(true));
          attributeSet = true;
        }
      }
    };

    const mouseup = () => {
      if (touch) {
        document.removeEventListener('touchmove', mousemove, touchArg);
        document.removeEventListener('touchend', mouseup, touchArg);
      } else {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
      }

      win._setState('media', getMediaQueryName(win), false);

      if (this.lastAction === 'move') {
        win.emit('moved', Object.assign({}, win.state.position), win);
        win._setState('moving', false);
      } else if (this.lastAction === 'resize') {
        win.emit('resized', Object.assign({}, win.state.dimension), win);
        win._setState('resizing', false);
      }

      this.core.$root.setAttribute('data-window-action', String(false));
    };


    if (!win.focus()) {
      win.setNextZindex();
    }

    if (move || resize) {
      if (touch) {
        document.addEventListener('touchmove', mousemove, touchArg);
        document.addEventListener('touchend', mouseup, touchArg);
      } else {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
      }
    }

    this.lastAction = null;

    if (this.core.has('osjs/contextmenu')) {
      this.core.make('osjs/contextmenu').hide();
    }
  }

}
