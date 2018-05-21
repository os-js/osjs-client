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
import Session from '../session';
import Packages from '../packages';
import Tray from '../tray';

import {EventHandler, ServiceProvider} from '@osjs/common';

/**
 * OS.js Core Service Provider
 *
 * @desc Provides base services
 */
export default class CoreServiceProvider extends ServiceProvider {

  constructor(core, args = {}) {
    super(core);

    const getWindow = win => ({
      id: win.id,
      state: Object.assign({}, win.state),
      maximize: () => win.maximize(),
      raise: () => win.raise(),
      restore: () => win.restore(),
      close: () => win.close()
    });

    const getApplications = () => Application.getApplications().map(app => ({
      pid: app.pid,
      args: Object.assign({}, app.args),
      metadata: Object.assign({}, app.metadata),
      started: app.started,
      windows: app.windows.map(getWindow),
      emit: (...args) => app.emit(...args),
      destroy: () => app.destroy(),
      relaunch: () => app.relaunch(),
      session: app.getSession()
    }));

    window.OSjs = Object.freeze({
      url: (...args) => this.core.url(...args),
      run: (...args) => this.core.run(...args),
      open: (...args) => this.core.open(...args),
      make: (...args) => this.core.make(...args),
      request: (...args) => this.core.request(...args),
      getApplications,
      getWindows: () => Window.getWindows().map(getWindow)
    });

    this.session = new Session(core);
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

    this.core.singleton('osjs/tray', () => ({
      create: (options, handler) => this.tray.create(options, handler),
      list: () => this.tray.entries.map(e => Object.assign({}, e))
    }));

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    this.core.singleton('osjs/packages', () => this.pm);
    this.core.instance('osjs/package', (...args) => this.pm.launch(...args));

    await this.pm.init();
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
            label: 'Kill All',
            onclick: () => Application.destroyAll()
          },
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

    this.core.on('osjs/core:disconnect', ev => {
      console.warn('Connection closed', ev);

      this.core.make('osjs/notification', {
        title: 'Connection lost',
        message: 'The websocket connection was lost. Reconnecting...'
      });
    });

    this.core.on('osjs/core:connect', (ev, reconnected) => {
      console.info('Connection opened');

      if (reconnected) {
        this.core.make('osjs/notification', {
          title: 'Connection restored',
          message: 'The websocket connection was restored.'
        });
      }
    });

    if (this.core.config('development')) {
      this.core.on('osjs/packages:metadata:changed', () => {
        this.pm.init();
      });

      this.core.on('osjs/packages:package:changed', name => {
        Application.getApplications()
          .filter(proc => proc.metadata.name === name)
          .forEach(proc => proc.relaunch());
      });
    }

    this.core.on('destroy', () => tray.destroy());
  }

}
