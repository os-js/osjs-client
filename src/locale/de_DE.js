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
 * @author  Julien Gomes Dias <abld@abld.info
 * @licence Simplified BSD License
 */

export const de_DE = {
  // Core
  ERR_REQUEST_STANDALONE: 'Cannot make requests in standalone mode.',
  ERR_REQUEST_NOT_OK: 'An error occured while performing a request: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filesystem \'{0}\' nicht gefunden',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filesystem für \'{0}\' nicht gefunden',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filesystem \'{0}\' nicht gemountet',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filesystem \'{0}\' schon gemountet',
  ERR_VFS_PATH_FORMAT_INVALID: 'Given path \'{0}\' does not match \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Paket-Metadaten  \'{0}\' nicht gefunden',
  ERR_PACKAGE_LOAD: 'Paket Laden \'{0}\' ist fehlgeschlagen: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Paketlaufzeit \'{0}\' nicht gefunden',
  ERR_PACKAGE_NO_METADATA: 'Metadaten für \'{0}\' nicht gefunden. Ist es in der Manifest?',
  ERR_PACKAGE_EXCEPTION: 'Eine Ausnahme trat in \'{0}\' auf.',
  ERR_WINDOW_ID_EXISTS: 'Window with ID \'{0}\' already exists',
  ERR_INVALID_LOCALE: 'Invalid locale \'{0}\'',
  LBL_CONNECTION_LOST: 'Verbindung unterbrochen',
  LBL_CONNECTION_LOST_MESSAGE: 'The connection to the OS.js was lost. Reconnecting....',
  LBL_CONNECTION_RESTORED: 'Verbindung wiederhergestellt',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Die Verbindung OS.js server was restored.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'IT-Entwicklung',
  LBL_APP_CAT_SCIENCE: 'Wissenschaft',
  LBL_APP_CAT_GAMES: 'Spiels',
  LBL_APP_CAT_GRAPHICS: 'Grafiken',
  LBL_APP_CAT_NETWORK: 'Netzwerk',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Office',
  LBL_APP_CAT_SYSTEM: 'System',
  LBL_APP_CAT_UTILITIES: 'Dienstprogramme',
  LBL_APP_CAT_OTHER: 'Andere',

  // UI
  LBL_LAUNCH_SELECT: 'Applikation auswählen',
  LBL_LAUNCH_SELECT_MESSAGE: 'Applikation für \'{0}\' auswählen',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Wallpaper auswählen',
  LBL_DESKTOP_SELECT_THEME: 'Theme auswählen',
  LBL_SEARCH_TOOLTOP: 'Filesystem ({0}) finden',
  LBL_SEARCH_PLACEHOLDER: 'Filesystems finden...',
  LBL_SEARCH_WAIT: 'Suche...',
  LBL_SEARCH_RESULT: 'Showing {0} results',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Oben',
  LBL_LEFT: 'Links',
  LBL_RIGHT: 'Rechts',
  LBL_BOTTOM: 'Unten',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Error',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Message',
  LBL_WARNINIG: 'Warning',
  LBL_SUCCESS: 'Success',
  LBL_FAILURE: 'Failure',
  LBL_WINDOW: 'Window',
  LBL_WINDOWS: 'Windows',
  LBL_NOTIFICATION: 'Notification',
  LBL_NOTIFICATIONS: 'Notifications',
  LBL_TRAY: 'Tray Entry',
  LBL_NAME: 'Name',
  LBL_TYPE: 'Type',
  LBL_SIZE: 'Size',
  LBL_FILE: 'File',
  LBL_NEW: 'New',
  LBL_OPEN: 'Open',
  LBL_SAVE: 'Save',
  LBL_SAVEAS: 'Save As',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abort',
  LBL_CANCEL: 'Cancel',
  LBL_CLOSE: 'Close',
  LBL_QUIT: 'Quit',
  LBL_YES: 'Ja',
  LBL_NO: 'Nein',
  LBL_GO: 'Go',
  LBL_MKDIR: 'Create new directory',
  LBL_MKFILE: 'Create new file',
  LBL_COPY: 'Copy',
  LBL_PASTE: 'Paste',
  LBL_CUT: 'Cut',
  LBL_MOVE: 'Move',
  LBL_RENAME: 'Rename',
  LBL_DELETE: 'Delete',
  LBL_DOWNLOAD: 'Download',
  LBL_REFRESH: 'Refresh',
  LBL_RELOAD: 'Reload',
  LBL_HOME: 'Home',
  LBL_VIEW: 'View',
  LBL_HELP: 'Hilfe',
  LBL_ABOUT: 'Über',
  LBL_APPLICATION: 'Application',
  LBL_APPLICATIONS: 'Applications',
  LBL_KILL: 'Beenden',
  LBL_KILL_ALL: 'Beenden alle'
};
