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
import {EventEmitter} from '@osjs/event-emitter';
import createUI from './adapters/ui/login';


/**
 * OS.js Login UI
 *
 * @desc Handles the Login UI and its events
 */
export default class Login extends EventEmitter {

  /**
   * Create authentication handler
   *
   * @param {Core} core Core reference
   * @param {object} [options] Options
   * @param {string} [options.title] Title
   * @param {object[]} [options.fields] Fields
   */
  constructor(core, options) {
    super('Login');

    this.$container = null;
    this.core = core;
    this.options = Object.assign({
      id: 'osjs-login',
      title: 'Welcome to OS.js',
      stamp: core.config('version'),
      logo: {
        position: 'top',
        src: null
      },
      fields: [{
        tagName: 'input',
        attributes: {
          name: 'username',
          type: 'text',
          placeholder: 'Username'
        }
      }, {
        tagName: 'input',
        attributes: {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      }, {
        tagName: 'input',
        attributes: {
          type: 'submit',
          value: 'Login'
        }
      }]
    }, options);
  }

  /**
   * Initializes the UI
   */
  init(startHidden) {
    this.$container = document.createElement('div');
    this.$container.id = this.options.id;
    this.$container.className = 'osjs-login-base';
    this.core.$root.classList.add('login');
    this.core.$root.appendChild(this.$container);

    this.render(startHidden);
  }

  /**
   * Destroys the UI
   */
  destroy() {
    this.core.$root.classList.remove('login');

    if (this.$container) {
      this.$container.remove();
    }
  }

  /**
   * Renders the UI
   */
  render(startHidden) {
    const login = this.core.config('auth.login', {});
    const ui = createUI(this.options, login, startHidden, this.$container);

    ui.on('login:post', values => this.emit('login:post', values));
    this.on('login:start', () => ui.emit('login:start'));
    this.on('login:stop', () => ui.emit('login:stop'));
    this.on('login:error', err => ui.emit('login:error', err));
  }

}
