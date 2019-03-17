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

import {supportsPassive} from './utils/dom';
import {
  resizer,
  mover,
  getEvent,
  getMediaQueryName,
  getCascadePosition
} from './utils/windows';

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
    this.$lofi = document.createElement('div');
    this.$lofi.className = 'osjs-window-behavior-lofi';
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

    const onicondblclick = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      this.iconDblclick(ev, win);
    };

    const oniconclick = ev => {
      ev.stopPropagation();
      ev.preventDefault();

      this.iconClick(ev, win);
    };

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

    if (win.$icon) {
      win.$icon.addEventListener('dblclick', onicondblclick);
      win.$icon.addEventListener('click', oniconclick);
    }

    win.on('resized,rendered', () => {
      win.setState('media', getMediaQueryName(win));
    });

    win.on('destroy', () => {
      if (win.$element) {
        win.$element.removeEventListener('touchstart', ontouchstart, touchArg);
        win.$element.removeEventListener('mousedown', onmousedown);
        win.$element.removeEventListener('click', onclick);
        win.$element.removeEventListener('dblclick', ondblclick);
        win.$element.removeEventListener('transitionend', ontrasitionend);
      }

      if (win.$icon) {
        win.$icon.removeEventListener('dblclick', onicondblclick);
        win.$icon.removeEventListener('click', oniconclick);
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

    const {moveable, resizable} = win.attributes;
    const {lofi} = this.core.config('windows');
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

    let actionCallback;

    const mousemove = (ev) => {
      if (!isPassive) {
        ev.preventDefault();
      }

      if ((!moveable && move) || (!resizable && resize)) {
        return;
      }

      const transformedEvent = getEvent(ev);
      const posX = resize ? Math.max(rect.left, transformedEvent.clientX) : transformedEvent.clientX;
      const posY = resize ? Math.max(rect.top, transformedEvent.clientY) : transformedEvent.clientY;
      const diffX = posX - clientX;
      const diffY = posY - clientY;

      if (resize) {
        const {width, height, top, left} = resize(diffX, diffY);

        actionCallback = () => {
          win._setState('dimension', {width, height}, false);
          win._setState('position', {top, left}, false);
        };

        if (lofi) {
          this.$lofi.style.top = `${top}px`;
          this.$lofi.style.left = `${left}px`;
          this.$lofi.style.width = `${width}px`;
          this.$lofi.style.height = `${height}px`;
        } else {
          actionCallback();
        }

        this.lastAction = 'resize';
      } else if (move) {
        const position = move(diffX, diffY);

        actionCallback = () => {
          win._setState('position', position, false);
        };

        if (lofi) {
          this.$lofi.style.top = `${position.top}px`;
          this.$lofi.style.left = `${position.left}px`;
        } else {
          actionCallback();
        }

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

      if (lofi) {
        this.$lofi.remove();

        if (actionCallback) {
          actionCallback();
        }

        actionCallback = undefined;
      }

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

    if (lofi) {
      this.$lofi.style.zIndex = win.state.zIndex + 1;
      this.$lofi.style.top = `${win.state.position.top}px`;
      this.$lofi.style.left = `${win.state.position.left}px`;
      this.$lofi.style.width = `${win.state.dimension.width}px`;
      this.$lofi.style.height = `${win.state.dimension.height}px`;

      if (!this.$lofi.parentNode) {
        document.body.appendChild(this.$lofi);
      }
    }
  }

  /**
   * Handles Icon Double Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  iconDblclick(ev, win) {
    win.close();
  }

  /**
   * Handles Icon Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  iconClick(ev, win) {
    const {minimized, maximized} = win.state;
    const {minimizable, maximizable, closeable} = win.attributes;
    const _ = this.core.make('osjs/locale').translate;

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu: [{
        label: minimized ? _('LBL_RAISE') : _('LBL_MINIMIZE'),
        disabled: !minimizable,
        onclick: () => minimized ? win.raise() : win.minimize()
      }, {
        label: maximized ? _('LBL_RESTORE') : _('LBL_MAXIMIZE'),
        disabled: !maximizable,
        onclick: () => maximized ? win.restore() : win.maximize()
      }, {
        label: _('LBL_CLOSE'),
        disabled: !closeable,
        onclick: () => win.close()
      }]
    });
  }
}
