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

import Application from './application';

/**
 * Session Handler
 *
 * @desc Handles Sessions
 */
export default class Session {

  /**
   * Creates the Session Handler
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;
  }

  /**
   * Saves session
   */
  save() {
    const apps = Application.getApplications()
      .filter(a => a.options.sessionable !== false);

    const session = apps.map(app => app.getSession());

    return this.core.make('osjs/settings')
      .set('osjs/session', null, session)
      .save();
  }

  /**
   * Loads session
   * @param {boolean} [fresh=false] Kill all current applications first
   */
  load(fresh = false) {
    if (fresh) {
      Application.destroyAll();
    }

    let session = this.core.make('osjs/settings')
      .get('osjs/session');

    if (session && !(session instanceof Array)) {
      session = Object.values(session);
    }

    if (session) {
      console.group('Session::load()');

      session.forEach(app => {
        try {
          this.core.run(app.name, app.args, {
            restore: {
              windows: app.windows
            }
          });
        } catch (e) {
          console.warn('Error while loading session entry', e);
        }
      });

      console.groupEnd();
    }

    return Promise.resolve(true);
  }
}
