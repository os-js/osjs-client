/**
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
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Simplified BSD License
 * @preserve Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
 */
import './index.scss';

export {default as Core} from './src/core';
export {default as Window} from './src/window';
export {default as Desktop} from './src/desktop';
export {default as Application} from './src/application';
export {default as Notification} from './src/notification';
export {default as Notifications} from './src/notifications';
export {default as WindowBehavior} from './src/window-behavior';
export {default as Auth} from './src/auth';
export {default as Login} from './src/login';
export {default as Websocket} from './src/websocket';
export {default as CoreServiceProvider} from './src/providers/core';
export {default as DesktopServiceProvider} from './src/providers/desktop';
export {default as NotificationServiceProvider} from './src/providers/notifications';
export {default as VFSServiceProvider} from './src/providers/vfs';
export {default as AuthServiceProvider} from './src/providers/auth';
export {default as SettingsServiceProvider} from './src/providers/settings';
export {default as logger} from './src/logger';
export {default as Splash} from './src/splash';
export {default as Settings} from './src/settings';
export {default as Tray} from './src/tray';
export {default as Search} from './src/search';
export {default as Packages} from './src/packages';
export {default as Filesystem} from './src/filesystem';
export {default as Clipboard} from './src/clipboard';
export {BasicApplication} from './src/basic-application';
