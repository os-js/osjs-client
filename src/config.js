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

import CoreServiceProvider from './providers/core';
import DesktopServiceProvider from './providers/desktop';
import NotificationServiceProvider from './providers/notifications';
import VFSServiceProvider from './providers/vfs';
import AuthServiceProvider from './providers/auth';
import SettingsServiceProvider from './providers/settings';

const {port, hostname, pathname, protocol} = window.location;
const path = pathname.substr(-1) !== '/' ? pathname + '/' : pathname;

export const defaultConfiguration = {
  development: !(process.env.NODE_ENV || '').match(/^prod/i),
  standalone: false,
  public: path,
  theme: 'Standard',

  application: {
    categories: {
      development: {
        label: 'Development',
        icon: 'applications-development'
      },
      science: {
        label: 'Science',
        icon: 'applications-science'
      },
      games: {
        label: 'Games',
        icon: 'applications-games'
      },
      graphics: {
        label: 'Graphics',
        icon: 'applications-graphics'
      },
      network: {
        label: 'Network',
        icon: 'applications-internet'
      },
      multimedia: {
        label: 'Multimedia',
        icon: 'applications-multimedia'
      },
      office: {
        label: 'Office',
        icon: 'applications-office'
      },
      system: {
        label: 'System',
        icon: 'applications-system'
      },
      utilities: {
        label: 'Utilities',
        icon: 'applications-utilities'
      },
      other: {
        label: 'Other',
        icon: 'applications-other'
      }
    }
  },

  auth: {
    login: {
      ui: {},
      username: null,
      password: null
    },
  },

  settings: {
    defaults: {
      'osjs/session': [
        // Don't use this to launch applications on startup
        // instead look at the launch method
      ],
      'osjs/settings': {
        __revision__: 0,
        panels: [],
        widgets: [],
        keybindings: [],
        theme: {
          name: 'Standard',
          animations: false
        },
        font: 'Roboto',
        locale: {
          language: 'en'
        },
        background: {
          src: require('./styles/wallpaper.png'),
          color: '#572a79',
          style: 'cover'
        },
        desktop: {
          iconView: false
        }
      }
    }
  },

  ws: {
    protocol: protocol === 'https:' ? 'wss' : 'ws',
    port,
    hostname,
    path
  },

  vfs: {
    defaultPath: 'osjs:/',
    adapters: {},
    mountpoints: [{
      name: 'osjs',
      label: 'OS.js',
      adapter: 'system'
    }, {
      name: 'home',
      label: 'Home',
      adapter: 'system'
    }],
    icons: {
      '^application/zip': {name: 'package-x-generic'},
      '^application/javascript': {name: 'text-x-script'},
      '^application/json': {name: 'text-x-script'},
      '^application/x-python': {name: 'text-x-script'},
      '^application/php': {name: 'text-x-script'},
      '^application/pdf': {name: 'x-office-document'},
      '^text/css': {name: 'text-x-script'},
      '^text/html': {name: 'text-html'},
      '^text/xml': {name: 'text-html'},
      '^application': {name: 'application-x-executable'},
      '^text': {name: 'text-x-generic'},
      '^audio': {name: 'audio-x-generic'},
      '^video': {name: 'video-x-generic'},
      '^image': {name: 'image-x-generic'}
    }
  }
};

export const defaultProviders = [{
  class: CoreServiceProvider,
  name: 'core'
}, {
  class: DesktopServiceProvider,
  name: 'desktop'
}, {
  class: VFSServiceProvider,
  name: 'vfs'
}, {
  class: NotificationServiceProvider,
  name: 'notifications'
}, {
  class: SettingsServiceProvider,
  name: 'settings',
  options: {
    before: true
  }
}, {
  class: AuthServiceProvider,
  name: 'auth',
  options: {
    before: true
  }
}];

