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

import ServiceProvider from '../service-provider';

const TEMPLATE = `
  <form method="post" action="#" autocomplete="off">
    <div>
      <span>Welcome to OS.js</span>
    </div>
    <div>
      <input type="text" name="username" placeholder="Username" autocapitalize="off" autocomplete="off" />
    </div>
    <div>
      <input type="password" name="password" placeholder="Password" />
    </div>
    <div>
      <input type="submit" />
    </div>
  </form>
`;

class Auth {

  constructor(core) {
    this.core = core;
  }

  init() {
    const container = document.createElement('div');
    container.className = 'osjs-login';
    container.innerHTML = TEMPLATE;

    const post = async (values) => {
      if (this.login(values)) {
        container.remove();
      }
    };

    const form = container.querySelector('form');
    form.onsubmit = (ev) => {
      ev.preventDefault();

      const values = Array.from(form.elements)
        .filter(el => el.type !== 'submit')
        .reduce((o, el) => Object.assign(o, {[el.name] : el.value}), {});

      post(values);
    };

    this.core.$root.appendChild(container);

    const login = this.core.configuration.login || {};
    if (login.username) {
      Object.keys(login).forEach((k) => {
        const el = form.querySelector(`input[name="${k}"]`);
        if (el) {
          el.value = login[k];
        }
      });

      post(login);
    }
  }

  async request(endpoint, values = {}) {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    });

    return response.ok ? response.json() : false;
  }

  async login(values) {
    const endpoint = this.core.url('/login');
    const response = await this.request(endpoint, values);

    if (!response) {
      alert('Login failed');
      return false;
    }

    this.core.user = response.user;

    await this.core.make('osjs/settings').load();

    this.core.start();

    return true;
  }

  async logout(reload = true) {
    const endpoint = this.core.url('/logout');
    const response = await this.request(endpoint);
    if (!response) {
      return;
    }

    this.core.destroy();

    // FIXME
    if (reload) {
      setTimeout(() => window.location.reload(), 1);
    }
  }

}

/**
 * Default OS.js Auth Service Provider
 *
 * Creates the login prompt and handles authentication flow
 */
export default class AuthServiceProvider extends ServiceProvider {

  constructor(core) {
    super(core);

    this.auth = new Auth(core);
  }

  async init() {
    this.core.singleton('osjs/auth', () => ({
      login: () => this.auth.login(),
      logout: () => this.auth.logout()
    }));
  }

  start() {
    this.auth.init();
  }

}
