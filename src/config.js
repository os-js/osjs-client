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

import {clientLocale} from './utils/locale.js';

const {port, hostname, pathname, protocol} = window.location;
const path = pathname.substr(-1) !== '/' ? pathname + '/' : pathname;

export const defaultConfiguration = {
  development: !(process.env.NODE_ENV || '').match(/^prod/i),
  standalone: false,
  public: path,

  languages: {
    en_EN: 'English',
    nb_NO: 'Norwegian, Norsk (bokmål)',
    vi_VN: 'Vietnamese, Vietnamese'
  },

  application: {
    categories: {
      development: {
        label: 'LBL_APP_CAT_DEVELOPMENT',
        icon: 'applications-development'
      },
      science: {
        label: 'LBL_APP_CAT_SCIENCE',
        icon: 'applications-science'
      },
      games: {
        label: 'LBL_APP_CAT_GAMES',
        icon: 'applications-games'
      },
      graphics: {
        label: 'LBL_APP_CAT_GRAPHICS',
        icon: 'applications-graphics'
      },
      network: {
        label: 'LBL_APP_CAT_NETWORK',
        icon: 'applications-internet'
      },
      multimedia: {
        label: 'LBL_APP_CAT_MULTIMEDIA',
        icon: 'applications-multimedia'
      },
      office: {
        label: 'LBL_APP_CAT_OFFICE',
        icon: 'applications-office'
      },
      system: {
        label: 'LBL_APP_CAT_SYSTEM',
        icon: 'applications-system'
      },
      utilities: {
        label: 'LBL_APP_CAT_UTILITIES',
        icon: 'applications-utilities'
      },
      other: {
        label: 'LBL_APP_CAT_OTHER',
        icon: 'applications-other'
      }
    }
  },

  auth: {
    ui: {},
    login: {
      username: null,
      password: null
    },
  },

  settings: {
    lock: [],

    defaults: {
      'osjs/session': [],
      'osjs/desktop': {},
      'osjs/locale': {}
    }
  },

  search: {
    enabled: true
  },

  desktop: {
    lock: false,

    settings: {
      font: 'Roboto',
      theme: 'Standard',
      sounds: {
        enabled: true,
        name: 'FreedesktopSounds'
      },
      icons: 'Gnome',
      animations: false,
      panels: [{
        position: 'top',
        items: [
          {name: 'menu'},
          {name: 'windows'},
          {name: 'tray'},
          {name: 'clock'}
        ]
      }],
      widgets: [],
      keybindings: [],
      background: {
        src: require('./styles/wallpaper.png'),
        color: '#572a79',
        style: 'cover'
      },
      iconview: {
        enabled: false
      }
    }
  },

  http: {
    hostname,
    protocol,
    port,
    path
  },

  ws: {
    protocol: protocol === 'https:' ? 'wss' : 'ws',
    port,
    hostname,
    path
  },

  locale: {
    language: clientLocale('en_EN'),
    format: {
      shortDate: 'yyyy-mm-dd',
      mediumDate: 'dS mmm yyyy',
      longDate: 'dS mmmm yyyy',
      fullDate: 'dddd dS mmmm yyyy',
      shortTime: 'HH:mm',
      longTime: 'HH:mm:ss'
    }
  },

  vfs: {
    defaultPath: 'osjs:/',
    defaultAdapter: 'system',
    adapters: {},
    mountpoints: [{
      name: 'apps',
      label: 'Applications',
      adapter: 'apps',
      icon: require('./styles/logo-blue-32x32.png'),
      attributes: {
        visibility: 'restricted',
        readOnly: true
      }
    }, {
      name: 'osjs',
      label: 'OS.js',
      adapter: 'system',
      icon: {name: 'folder-publicshare'}
    }, {
      name: 'home',
      label: 'Home',
      adapter: 'system',
      icon: {name: 'user-home'}
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
