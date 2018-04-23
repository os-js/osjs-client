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

const createAttributes = (props, field) => {
  if (field.tagName === 'input') {
    if (field.attributes.type !== 'submit') {
      return Object.assign({}, {
        autocapitalize: 'off',
        autocomplete: 'off',
        oncreate: el => (el.value = props[field.attributes.name] || field.value || '')
      }, field.attributes);
    }
  }

  return field.attributes;
};

const createFields = (props, fields) => fields.map(f => h('div', {}, h(f.tagName, createAttributes(props, f))));


/**
 * Authentication Handler
 *
 * @desc Handles Authentication
 */
export default class Auth {

  /**
   * Create authentication handler
   *
   * @param {Core} core Core reference
   * @param {Object} [options] Options
   * @param {String} [options.ui] UI Options
   * @param {String} [options.title] Login box title
   * @param {Object[]} [options.fields] Login box fields
   */
  constructor(core, options = {}) {
    this.core = core;
    this.options = Object.assign({
      ui: {
        title: 'Welcome to OS.js',
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
      }
    }, options);

    this.$container = document.createElement('div');
    this.$container.className = 'osjs-login';
  }

  /**
   * Initializes authenication handler
   *
   * @desc Shows the login screen etc
   */
  init() {
    this.core.$root.appendChild(this.$container);

    this.render();

    const login = this.core.configuration.login || {};
    if (login.username && login.password) {
      this.login(login);
    }
  }

  render() {
    const login = this.core.configuration.login || {};
    const createView = (state, actions) => h('form', {
      method: 'post',
      action: '#',
      autocomplete: 'off',
      onsubmit: actions.submit
    }, [
      h('div', {}, h('span', {}, this.options.ui.title)),
      ...createFields(state, this.options.ui.fields)
    ]);

    app(Object.assign({}, login), {
      submit: ev => state => {
        ev.preventDefault();

        const values = Array.from(ev.target.elements)
          .filter(el => el.type !== 'submit')
          .reduce((o, el) => Object.assign(o, {[el.name] : el.value}), {});

        this.login(values);
      }
    }, createView, this.$container);
  }

  /**
   * Perform login
   * @param {Object} values Values from form
   * @return {Boolean}
   */
  async login(values) {
    const endpoint = this.core.url('/login');

    try {
      const response = await this.core.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(values)
      }, 'json');


      this.onLogin(response);

      return true;
    } catch (e) {
      if (this.core.config('development')) {
        console.warn(e);
      }

      alert('Login failed');

      return false;
    }
  }

  /**
   * Perform logout
   * @param {Boolean} [reload=true] Reload OS.js
   */
  async logout(reload = true) {
    const endpoint = this.core.url('/logout');
    const response = await this.core.request(endpoint, {
      method: 'POST'
    }, 'json');

    if (!response) {
      return;
    }

    this.onLogout(response, reload);
  }

  /**
   * Handle login request
   * @param {Object} response The response
   */
  onLogin(response) {
    if (this.$container) {
      this.$container.remove();
    }

    this.core.user = response.user;

    this.core.start();
  }

  /**
   * Handle logout request
   * @param {Object} response The response
   * @param {Boolean} reload Reload OS.js
   */
  onLogout(response, reload) {
    this.core.destroy();

    // FIXME
    if (reload) {
      setTimeout(() => window.location.reload(), 1);
    }
  }

}
