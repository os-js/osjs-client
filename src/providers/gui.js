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

import {h, app} from 'hyperapp';
import {Menu} from '@osjs/gui';

/*
 * Context Menu view
 */
const view = callback => (state, actions) => h(Menu, {
  position: state.position,
  visible: state.visible,
  menu: state.menu,
  onclick: callback
})

/**
 * OS.js GUI Service Provider
 *
 * Provides wrapper services around GUI features
 */
export default class GUIServiceProvider {

  constructor(core) {
    this.core = core;

    this.contextmenu = {
      callback: function() {},
      actions: {},
      instance: null,
      state: {
        visible: false,
        menu: [],
        position: {
          top: 0,
          left: 0
        }
      }
    };
  }

  destroy() {
    const menu = document.getElementById('osjs-context-menu');
    if (menu) {
      menu.remove();
    }

    this.contextmenu = null;
  }

  async init() {
    this.core.singleton('osjs/contextmenu', () => {
      return this.contextmenu.actions;
    });
  }

  start() {
    this.contextmenu.actions = app(this.contextmenu.state, {
      show: (options) => state => {
        let {menu, position} = options;
        if (position instanceof Event) {
          position = {left: position.clientX, top: position.clientY};
        }

        this.contextmenu.callback = (...args) => {
          if (args[0] !== false) {
            (options.callback ||  function() {})(...args);
          }

          if (this.contextmenu) {
            this.contextmenu.actions.hide();
          }
        };

        return {visible: true, menu, position};
      },
      hide: () => state => {
        this.contextmenu.callback = function() {};

        return {visible: false};
      }
    }, view((...args) => {
      if (!this.core.destroyed) {
        this.contextmenu.callback(...args);
      }
    }), this.core.$root)
  }

}
