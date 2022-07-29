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
import {EventEmitter} from '@osjs/event-emitter';
import createUI from './adapters/ui/login';

/**
 * Login Options
 *
 * @typedef {Object} LoginOptions
 * @property {string} [title] Title
 * @property {object[]} [fields] Fields
 */

/**
 * OS.js Login UI
 */
export default class Login extends EventEmitter {

  /**
   * Create authentication handler
   *
   * @param {Core} core Core reference
   * @param {LoginOptions} [options] Options
   */
  constructor(core, options) {
    super('Login');

    /**
     * Login root DOM element
     * @type {Element}
     */
    this.$container = null;

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Login options
     * TODO: typedef
     * @type {Object}
     * @readonly
     */
    this.options = {
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
      }],
      ...options
    };
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
      this.$container = null;
    }

    super.destroy();
  }

  /**
   * Renders the UI
   */
  render(startHidden) {
    const login = this.core.config('auth.login', {});
    const ui = createUI(this.options, login, startHidden, this.$container);

    ui.on('register:post', values => this.emit('register:post', values));
    ui.on('login:post', values => this.emit('login:post', values));
    this.on('login:start', () => ui.emit('login:start'));
    this.on('login:stop', () => ui.emit('login:stop'));
    this.on('login:error', err => ui.emit('login:error', err));
  }

}
