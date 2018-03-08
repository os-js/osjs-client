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

import Application from '../application';
import ServiceProvider from '../service-provider';

class Session {

  constructor(core) {
    this.core = core;
  }

  async saveData(session) {
    localStorage.setItem('osjs/session', JSON.stringify(session));
  }

  async loadData() {
    try {
      return JSON.parse(localStorage.getItem('osjs/session'));
    } catch (e) {
      console.warn(e);
    }

    return null;
  }

  async save() {
    const apps = Application.getApplications();
    const session = apps.map(app => app.session);

    await this.saveData(session);
  }

  async load(fresh = false) {
    if (fresh) {
      Application.getApplications().forEach(app => app.destroy());
    }

    const session = await this.loadData();
    if (session !== null) {
      session.forEach(app => {
        this.core.run(app.name, app.args, {
          restore: {
            windows: app.windows
          }
        });
      });
    }
  }
}

/**
 * OS.js Session Service Provider
 *
 * Provides wrapper services around Session features
 */
export default class SessionServiceProvider extends ServiceProvider {

  constructor(core) {
    super(core);
    this.session = new Session(core);
  }

  async init() {
    this.core.singleton('osjs/session', () => ({
      save: async () => this.session.save(),
      load: async (fresh = true) => this.session.load(fresh)
    }));
  }

  start() {
    this.session.load();
  }

}
