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
const getCascadePosition = (win, rect) => {
  const startX = 10 + (rect ? rect.left : 0);
  const startY = 10 + (rect ? rect.top : 0);
  const distance = 10;
  const wrap = 20;

  const top = startY + ((win.wid % wrap) * distance);
  const left = startX + ((win.wid % wrap) * distance);

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

/*
 * OS.js Default Window Behavior
 *
 * Controls certain events and their interaction with a window
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
    win.$element.addEventListener('touchstart', (ev) => this.mousedown(ev, win));
    win.$element.addEventListener('mousedown', (ev) => this.mousedown(ev, win));
    win.$element.addEventListener('click', (ev) => this.click(ev, win));
    win.$element.addEventListener('dblclick', (ev) => this.dblclick(ev, win));

    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : null;

    const {top, left} = getCascadePosition(win, rect);
    if (win.state.position.top === 0) {
      win.state.position.top = top;
    }

    if (win.state.position.left === 0) {
      win.state.position.left = left;
    }
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
    const move = target.classList.contains('osjs-window-header');
    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : null;

    let attributeSet = false;

    const mousemove = (ev) => {
      const transformedEvent = getEvent(ev);
      const diffX = transformedEvent.clientX - clientX;
      const diffY = transformedEvent.clientY - clientY;

      if (resize) {
        this.wasResized = true;
        win.setState('resizing', true, false);
        win.setDimension(getNewDimensions(
          diffX,
          diffY,
          minDimension,
          maxDimension,
          startDimension
        ));
      } else if (move) {
        this.wasMoved = true;
        win.setState('moving', true, false);
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
        document.removeEventListener('touchmove', mousemove);
        document.removeEventListener('touchend', mouseup);
      } else {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
      }

      if (this.wasMoved) {
        win.emit('moved', win);
        win.setState('moving', false);
      } else if (this.wasResized) {
        win.emit('resized', win);
        win.setState('resizing', false);
      }

      this.core.$root.setAttribute('data-window-action', String(false));
    };


    if (!win.focus()) {
      win.setNextZindex();
    }

    if (move || resize) {
      if (touch) {
        document.addEventListener('touchmove', mousemove);
        document.addEventListener('touchend', mouseup);
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
