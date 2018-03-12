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

/**
 * Default OS.js Auth Service Provider
 *
 * Creates the login prompt and handles authentication flow
 */
export default class AuthServiceProvider extends ServiceProvider {

  async request(values) {
    const response = await fetch('/login', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    return response.json();
  }

  async init() {
    const container = document.createElement('div');
    container.className = 'osjs-login';
    container.innerHTML = TEMPLATE;

    const post = async (values) => {
      const response = await this.request(values);
      if (!response) {
        alert('Login failed');
        return;
      }

      container.remove();

      this.core.user = response.user;
      this.core.start();
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

    const login = this.core.configuration.login;
    if (login) {
      Object.keys(login).forEach((k) => {
        const el = form.querySelector(`input[name="${k}"]`);
        if (el) {
          el.value = login[k];
        }
      });

      post(login);
    }
  }

}
