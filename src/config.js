/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2020, Anders Evenrud <andersevenrud@gmail.com>
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
import defaultWallpaper from './styles/wallpaper.png';
import defaultIcon from './styles/logo-blue-32x32.png';

const createUri = str => str
  .replace(/(index\.(html?|php))$/, '')
  .replace(/\/?$/, '/');

const pathname = createUri(window.location.pathname);

const href = createUri(window.location.href);

export const defaultConfiguration = {
  development: !(process.env.NODE_ENV || '').match(/^prod/i),
  standalone: false,

  http: {
    ping: true, // By default maxAge / 2
    public: pathname,
    uri: href
  },

  ws: {
    connectInterval: 5000,
    uri: href.replace(/^http/, 'ws'),
    disabled: false
  },

  languages: {
    en_EN: 'English',
    nb_NO: 'Norwegian, Norsk (bokmål)',
    vi_VN: 'Vietnamese, Vietnamese',
    fr_FR: 'French',
    de_DE: 'German',
    sl_SI: 'Slovenian, Slovenščina',
    zh_CN: 'Chinese (simplified)',
    fa_FA: 'Persian'
  },

  packages: {
    manifest: '/metadata.json',
    metadata: []
  },

  // FIXME: Move into packages above ?!
  application: {
    pinned: [],
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
      'osjs/default-application': {},
      'osjs/session': [],
      'osjs/desktop': {},
      'osjs/locale': {}
    }
  },

  search: {
    enabled: true
  },

  notifications: {
    native: false
  },

  desktop: {
    lock: false,
    contextmenu: {
      enabled: true,
      defaults: true
    },

    settings: {
      font: 'Roboto',
      theme: 'StandardTheme',
      sounds: 'FreedesktopSounds',
      icons: 'GnomeIcons',
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
      keybindings: {
        'open-application-menu': 'alt+a'
      },
      notifications: {
        position: 'top-right'
      },
      background: {
        src: defaultWallpaper,
        color: '#572a79',
        style: 'cover'
      },
      iconview: {
        enabled: false,
        path: 'home:/.desktop'
      }
    }
  },

  locale: {
    language: clientLocale('en_EN'),
    rtl: ['az', 'fa', 'he', 'uz', 'ar'],
    format: {
      shortDate: 'yyyy-mm-dd',
      mediumDate: 'dS mmm yyyy',
      longDate: 'dS mmmm yyyy',
      fullDate: 'dddd dS mmmm yyyy',
      shortTime: 'HH:MM',
      longTime: 'HH:MM:ss'
    }
  },

  windows: {
    lofi: false,
    mobile: false, // Trigger for setting mobile UI
    template: null, // A string. See 'window.js' for example
    moveKeybinding: 'ctrl'
  },

  vfs: {
    watch: false,
    defaultPath: 'home:/',
    defaultAdapter: 'system',
    adapters: {},
    mountpoints: [{
      name: 'apps',
      label: 'Applications',
      adapter: 'apps',
      icon: defaultIcon,
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
      '^application/rtf': {name: 'x-office-document'},
      '^application/msword': {name: 'x-office-document'},
      '^application/(xz|tar|gzip)': {name: 'package-x-generic'},
      '^text/css': {name: 'text-x-script'},
      '^text/html': {name: 'text-html'},
      '^(application|text)/xml': {name: 'text-html'},
      '^application': {name: 'application-x-executable'},
      '^text': {name: 'text-x-generic'},
      '^audio': {name: 'audio-x-generic'},
      '^video': {name: 'video-x-generic'},
      '^image': {name: 'image-x-generic'}
    }
  },

  providers: {
    globalBlacklist: [
      'osjs/websocket',
      'osjs/clipboard',
      'osjs/gapi'
    ],
    globalWhitelist: []
  }
};
