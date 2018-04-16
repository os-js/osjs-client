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
import Window from '../window';
import WindowBehavior from '../window-behavior';
import ServiceProvider from '../service-provider';
import EventHandler from '../event-handler';
import Session from '../session';
import Settings from '../settings';
import Packages from '../packages';
import Tray from '../tray';

/**
 * OS.js Core Service Provider
 *
 * @desc Provides base services
 */
export default class CoreServiceProvider extends ServiceProvider {

  constructor(core) {
    super(core);

    window.OSjs = Object.freeze({
      url: (...args) => this.core.url(...args),
      run: (...args) => this.core.run(...args),
      open: (...args) => this.core.open(...args),
      make: (...args) => this.core.make(...args),
      request: (...args) => this.core.request(...args),
      getWindows: () => Window.getWindows(),
      getApplications: () => Application.getApplications()
    });

    this.session = new Session(core);
    this.settings = new Settings(core);
    this.tray = new Tray(core);
    this.pm = new Packages(core);
  }

  async init() {
    this.core.instance('osjs/application', (data = {}) => {
      return new Application(this.core, data);
    });

    this.core.instance('osjs/window', (options = {}) => {
      return new Window(this.core, options);
    });

    this.core.instance('osjs/event-handler', (...args) => {
      return new EventHandler(...args);
    });

    this.core.singleton('osjs/window-behavior', () => {
      return new WindowBehavior(this.core);
    });

    this.core.instance('osjs/request', async (...args) => {
      return this.core.request(...args);
    });

    this.core.singleton('osjs/session', () => ({
      save: async () => this.session.save(),
      load: async (fresh = true) => this.session.load(fresh)
    }));

    this.core.singleton('osjs/core', () => ({
      url: (...args) => this.core.url(...args),
      run: (...args) => this.core.run(...args),
      open: (...args) => this.core.open(...args),
      config: (...args) => this.core.config(...args)
    }));

    this.core.singleton('osjs/settings', () => {
      return this.settings;
    });

    this.core.singleton('osjs/tray', () => ({
      create: (options, handler) => this.tray.create(options, handler),
      list: () => this.tray.entries.map(e => Object.assign({}, e))
    }));

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    this.core.singleton('osjs/packages', () => this.pm);
    this.core.instance('osjs/package', (...args) => this.pm.launch(...args));

    window.addEventListener('message', ev => {
      const message = ev.data || {};
      if (message) {
        if (message.pid) {
          const proc = Application.getApplications().find(p => p.pid === message.pid);
          if (proc) {
            console.debug('Routing message', message);
            proc.emit('message', message.args);
            return;
          }
        }

        console.warn('Message with unknown reciever', message);
      }
    });

    await this.pm.init();
    await this.settings.load();
  }

  start() {
    if (!this.core.config('development')) {
      return;
    }

    const tray = this.tray.create({
      title: 'OS.js developer tools'
    }, (ev) => {
      this.core.make('osjs/contextmenu').show({
        position: ev,
        menu: [
          {
            label: 'Applications',
            items: Application.getApplications().map(proc => ({
              label: `${proc.metadata.name} (${proc.pid})`,
              items: [
                {
                  label: 'Kill',
                  onclick: () => proc.destroy()
                },
                {
                  label: 'Reload',
                  onclick: () => proc.relaunch()
                }
              ]
            }))
          }
        ]
      });
    });

    this.core.on('destroy', () => tray.destroy());
  }

}
