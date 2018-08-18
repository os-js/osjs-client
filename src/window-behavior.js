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

const isPassive = supportsPassive();
const touchArg = isPassive ? {passive: true} : false;

/*
 * Map of available "actions"
 */
const actionMap = {
  maximize(win) {
    if (!win.maximize()) {
      win.restore();
    }
  },
  minimize(win) {
    win.minimize();
  },
  close(win) {
    win.close();
  }
};

/**
 * Calculates both new dimensions and positions for a window resize
 */
const getNewPositionsAndDimensions = (targetClassList, diffX, diffY, min, max, startPosition, startDimension) => {
  var width, height, top, left;
  
  const getDimension = (diff, min, max, start) => {
    const newDimension = Math.max(min, start + diff);
    return max === -1
          ? newDimension
          : Math.min(max, newDimension);
  }

  const getPosition = (diff, startPosition, minDimension, maxDimension, startDimension) => {
    const newPosition = startPosition + Math.min(startDimension - minDimension, diff);
    return maxDimension === -1
            ? newPosition
            : Math.max(startPosition - (maxDimension - startDimension), newPosition);
  }

  if (targetClassList.contains('osjs-window-resize-se')) {
    width = getDimension(diffX, min.width, max.width, startDimension.width);
    height = getDimension(diffY, min.height, max.height, startDimension.height);
    top = startPosition.top;
    left = startPosition.left;
  } else if (targetClassList.contains('osjs-window-resize-sw')) {
    height = getDimension(diffY, min.height, max.height, startDimension.height);
    width = getDimension(-diffX, min.width, max.width, startDimension.width);
    left = getPosition(diffX, startPosition.left, min.width, max.width, startDimension.width);
    top = startPosition.top;
  } else if (targetClassList.contains('osjs-window-resize-ne')) {
    width = getDimension(diffX, min.width, max.width, startDimension.width);
    height = getDimension(-diffY, min.height, max.height, startDimension.height);
    top = getPosition(diffY, startPosition.top, min.height, max.height, startDimension.height);
    left = startPosition.left;

  } else if (targetClassList.contains('osjs-window-resize-nw')) {
    height = getDimension(-diffY, min.height, max.height, startDimension.height);
    width = getDimension(-diffX, min.width, max.width, startDimension.width);
    left = getPosition(diffX, startPosition.left, min.width, max.width, startDimension.width);
    top = getPosition(diffY, startPosition.top, min.height, max.height, startDimension.height);
  } else if (targetClassList.contains('osjs-window-resize-n')) {
    height = getDimension(-diffY, min.height, max.height, startDimension.height);
    width = startDimension.width;
    left = startPosition.left;
    top = getPosition(diffY, startPosition.top, min.height, max.height, startDimension.height);
  } else if (targetClassList.contains('osjs-window-resize-s')) {
    height = getDimension(diffY, min.height, max.height, startDimension.height);
    width = startDimension.width;
    left = startPosition.left;
    top = startPosition.top;
  } else if (targetClassList.contains('osjs-window-resize-e')) {
    height = startDimension.height;
    width = getDimension(diffX, min.width, max.width, startDimension.width);
    left = startPosition.left;
    top = startPosition.top;
  } else if (targetClassList.contains('osjs-window-resize-w')) {
    height = startDimension.height;
    width = getDimension(-diffX, min.width, max.width, startDimension.width);
    left = getPosition(diffX, startPosition.left, min.width, max.width, startDimension.width);
    top = startPosition.top;
  }

  return {
    dimension: {
      width: width,
      height: height,
    },
    position: {
      top: top,
      left: left
    }
  };
};


/*
 * Calculates new dimension for a window resize
 */
const getNewDimensions = (diffX, diffY, min, max, start) => {
  const newWidth = Math.max(min.width, start.width + diffX);
  const newHeight = Math.max(min.height, start.height + diffY);

  return {
    width: max.width === -1
      ? newWidth
      : Math.min(max.height, newWidth),

    height: max.height === -1
      ? newHeight
      : Math.min(max.height, newHeight)
  };
};

/*
 * Calculates new position for a window movement
 */
const getNewPosition = (diffX, diffY, start, rect) => {
  let top = start.top + diffY;
  let left = start.left + diffX;

  if (rect) {
    // In case we have panels etc around, we want to stop when we hit these areas
    top = Math.max(rect.top, top);
  }

  return {top, left};
};

/*
 * Calculates a new initial position for window
 */
const getCascadePosition = (win, rect, pos) => {
  const startX = 10 + (rect ? rect.left : 0);
  const startY = 10 + (rect ? rect.top : 0);
  const distance = 10;
  const wrap = 20;

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
    this.wasMoved = false;
    this.wasResized = false;
  }

  /**
   * Initializes window behavior
   * @param {Window} win Window reference
   */
  init(win) {
    win.$element.addEventListener('touchstart', (ev) => this.mousedown(ev, win), touchArg);
    win.$element.addEventListener('mousedown', (ev) => this.mousedown(ev, win));
    win.$element.addEventListener('click', (ev) => this.click(ev, win));
    win.$element.addEventListener('dblclick', (ev) => this.dblclick(ev, win));
    win.$element.addEventListener('transitionend', (ev) => {
      this.core.emit('osjs/window:transitionend', ev, win);
    });

    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : null;

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
    if (this.wasMoved || this.wasResized) {
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
    if (this.wasMoved || this.wasResized) {
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
    const {clientX, clientY, touch, target} = getEvent(ev);
    const startPosition = Object.assign({}, win.state.position);
    const startDimension = Object.assign({}, win.state.dimension);
    const maxDimension = Object.assign({}, win.attributes.maxDimension);
    const minDimension = Object.assign({}, win.attributes.minDimension);
    const resize = target.classList.contains('osjs-window-resize');
    const move = ev.ctrlKey
      ? win.$element.contains(target)
      : target.classList.contains('osjs-window-header');
    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : null;

    let attributeSet = false;

    const mousemove = (ev) => {
      if (!isPassive) {
        ev.preventDefault();
      }

      const transformedEvent = getEvent(ev);
      const diffX = transformedEvent.clientX - clientX;
      const diffY = transformedEvent.clientY - clientY;

      if (resize) {
        this.wasResized = true;
        win._setState('resizing', true, false);
        win.resizeWindow(getNewPositionsAndDimensions(
          target.classList,
          diffX,
          diffY,
          minDimension,
          maxDimension,
          startPosition,
          startDimension,
        ));
      } else if (move) {
        this.wasMoved = true;
        win._setState('moving', true, false);
        win.setPosition(getNewPosition(
          diffX,
          diffY,
          startPosition,
          rect
        ));

        /* TODO: Might give better performance, but need to set actual position
         * on mouseup. Also, need to clamp the diffX and diffY with respect of
         * rect.
        win.$element.style.transform = `translate(${diffX}px, ${diffY}px)`;
        */
      }

      if (resize || move) {
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

      if (this.wasMoved) {
        win.emit('moved', Object.assign({}, win.state.position), win);
        win._setState('moving', false);
      } else if (this.wasResized) {
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

    this.wasResized = false;
    this.wasMoved = false;

    if (this.core.has('osjs/contextmenu')) {
      this.core.make('osjs/contextmenu').hide();
    }
  }

}
