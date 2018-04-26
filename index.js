/*!
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
import Core from './src/core';
import Auth from './src/auth';
import Settings from './src/settings';
import Window from './src/window';
import Desktop from './src/desktop';
import Application from './src/application';
import Notification from './src/notification';
import WindowBehavior from './src/window-behavior';
import Transport from './src/vfs/transport';

import LocalStorageSettings from './src/settings/localStorage';
import ServerSettings from './src/settings/server';
import LocalStorageAuth from './src/auth/localStorage';
import ServerAuth from './src/auth/server';

import DesktopServiceProvider from './src/providers/desktop';
import NotificationServiceProvider from './src/providers/notifications';
import VFSServiceProvider from './src/providers/vfs';
import ThemeServiceProvider from './src/providers/theme';
import AuthServiceProvider from './src/providers/auth';
import SettingsServiceProvider from './src/providers/settings';

export {
  Core,
  Auth,
  Settings,
  Window,
  Desktop,
  Application,
  Notification,
  WindowBehavior,
  Transport,

  LocalStorageSettings,
  ServerSettings,
  LocalStorageAuth,
  ServerAuth,

  DesktopServiceProvider,
  NotificationServiceProvider,
  VFSServiceProvider,
  ThemeServiceProvider,
  AuthServiceProvider,
  SettingsServiceProvider
};
