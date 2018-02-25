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

import {h} from 'hyperapp';
import PanelItem from '../panel-item';
import Window from '../../window';

const mapWindow = win => {
  return {
    wid: win.wid,
    icon: win.state.icon,
    title: win.state.title,
    focused: win.state.focused,
    raise: () => {
      win.raise();
      win.focus();
    }
  };
};

export default class WindowsPanelItem extends PanelItem {

  init() {
    if (this.inited) {
      return;
    }

    const actions = super.init({
      windows: Window.getWindows().map(mapWindow)
    }, {
      add: win => state => {
        const found = state.windows.find(w => w.wid === win.wid);
        if (found) {
          return state;
        }

        const windows = state.windows.concat([win]);
        return {windows};
      },

      remove: win => state => {
        const windows = state.windows;
        const foundIndex = state.windows.findIndex(w => w.wid === win.wid);
        if (foundIndex !== -1) {
          windows.splice(foundIndex, 1);
        }

        return {windows};
      },

      change: win => state => {
        const windows = state.windows;
        const foundIndex = state.windows.findIndex(w => w.wid === win.wid);
        if (foundIndex !== -1) {
          windows[foundIndex] = win;
        }

        return {windows};
      }
    });

    this.core.on('osjs/window:destroy', (win) => actions.remove(mapWindow(win)));
    this.core.on('osjs/window:create', (win) => actions.add(mapWindow(win)));
    this.core.on('osjs/window:change', (win) => actions.change(mapWindow(win)));
  }

  render(state, actions) {
    return super.render('windows', state.windows.map(w => h('div', {
      'data-has-image': w.icon ? true : undefined,
      'data-focused': w.focused ? 'true' : 'false',
      onclick: () => w.raise()
    }, [
      h('span', {
        style: {
          backgroundImage: `url(${w.icon})`
        }
      }, w.title || '(window)')
    ])))
  }

}
