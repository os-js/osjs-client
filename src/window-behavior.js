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
const getNewPosition = (diffX, diffY, start) => {
  return {
    top: start.top + diffY,
    left: start.left + diffX
  };
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
   * @param {Window} window Window reference
   */
  constructor(core, win) {
    this.core = core;
    this.win = win;
    this.wasMoved = false;
    this.wasResized = false;
  }

  /**
   * Initializes window behavior
   */
  init() {
    this.win.$element.addEventListener('mousedown', (ev) => this.mousedown(ev));
    this.win.$element.addEventListener('click', (ev) => this.click(ev));
    this.win.$element.addEventListener('dblclick', (ev) => this.dblclick(ev));

    // FIXME
    let top = (30 + ((this.win.wid % 20) * 10));
    let left = (10 + ((this.win.wid % 20) * 10));

    if (this.win.state.position.top === 0) {
      this.win.state.position.top = top;
    }

    if (this.win.state.position.left === 0) {
      this.win.state.position.left = left;
    }
  }

  /**
   * Handles Mouse Click Event
   * @param {Event} ev Browser Event
   */
  click(ev) {
    if (this.wasMoved || this.wasResized) {
      return;
    }

    const target = ev.target;
    const hitButton = target.classList.contains('osjs-window-button');

    if (hitButton) {
      const action =  ev.target.getAttribute('data-action');
      actionMap[action](this.win);
    }
  }

  /**
   * Handles Mouse Double Click Event
   * @param {Event} ev Browser Event
   */
  dblclick(ev) {
    if (this.wasMoved || this.wasResized) {
      return;
    }

    const target = ev.target;
    const hitTitle = target.classList.contains('osjs-window-header');

    if (hitTitle) {
      if (this.win.state.maximized) {
        this.win.restore();
      } else if (this.win.state.minimized) {
        this.win.raise();
      } else {
        this.win.maximize();
      }
    }
  }

  /**
   * Handles Mouse Down Event
   * @param {Event} ev Browser Event
   */
  mousedown(ev) {
    const {clientX, clientY, target} = ev;
    const startPosition = Object.assign({}, this.win.state.position);
    const startDimension = Object.assign({}, this.win.state.dimension);
    const maxDimension = Object.assign({}, this.win.attributes.maxDimension);
    const minDimension = Object.assign({}, this.win.attributes.minDimension);
    const resize = target.classList.contains('osjs-window-resize');
    const move = target.classList.contains('osjs-window-header');

    const mousemove = (ev) => {
      const diffX = ev.clientX - clientX;
      const diffY = ev.clientY - clientY;

      if (resize) {
        this.wasResized = true;
        this.win.setState('resizing', true, false);
        this.win.setDimension(getNewDimensions(
          diffX,
          diffY,
          minDimension,
          maxDimension,
          startDimension
        ));
      } else if (move) {
        this.wasMoved = true;
        this.win.setState('moving', true, false);
        this.win.setPosition(getNewPosition(
          diffX,
          diffY,
          startPosition
        ));
      }
    };

    const mouseup = () => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);

      if (this.wasMoved) {
        this.win.emit('moved', this.win);
        this.win.setState('moving', false);
      } else if (this.wasResized) {
        this.win.emit('resized', this.win);
        this.win.setState('resizing', false);
      }

      this.core.$root.setAttribute('data-window-action', String(false));
    };


    if (!this.win.focus()) {
      this.win.setNextZindex();
    }

    if (move || resize) {
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);

      this.core.$root.setAttribute('data-window-action', String(true));
    }

    this.wasResized = false;
    this.wasMoved = false;
  }

}
