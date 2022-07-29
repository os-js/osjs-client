/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
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
 * @license Simplified BSD License
 */

export const en_EN = {
  // Core
  ERR_REQUEST_STANDALONE: 'Cannot make requests in standalone mode.',
  ERR_REQUEST_NOT_OK: 'An error occured while performing a request: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filesystem \'{0}\' not found',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filesystem not found for \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filesystem \'{0}\' not mounted',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filesystem \'{0}\' already mounted',
  ERR_VFS_PATH_FORMAT_INVALID: 'Given path \'{0}\' does not match \'name:/path\'',
  ERR_PACKAGE_PERMISSION_DENIED: 'You are not permitted to run \'{0}\'',
  ERR_PACKAGE_NOT_FOUND: 'Package Metadata \'{0}\' not found',
  ERR_PACKAGE_LOAD: 'Package Loading \'{0}\' failed: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Package Runtime \'{0}\' not found',
  ERR_PACKAGE_NO_METADATA: 'Metadata not found for \'{0}\'. Is it in the manifest?',
  ERR_PACKAGE_EXCEPTION: 'An exception occured in \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Window with ID \'{0}\' already exists',
  ERR_INVALID_LOCALE: 'Invalid locale \'{0}\'',
  LBL_CONNECTION_LOST: 'Connection Lost',
  LBL_CONNECTION_LOST_MESSAGE: 'The connection to the OS.js was lost. Reconnecting....',
  LBL_CONNECTION_RESTORED: 'Connection Restored',
  LBL_CONNECTION_RESTORED_MESSAGE: 'The connection to the OS.js server was restored.',
  LBL_CONNECTION_FAILED: 'Connection Failed',
  LBL_CONNECTION_FAILED_MESSAGE: 'The connection to the OS.js could not be established. Some features might not work properly.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Development',
  LBL_APP_CAT_SCIENCE: 'Science',
  LBL_APP_CAT_GAMES: 'Games',
  LBL_APP_CAT_GRAPHICS: 'Graphics',
  LBL_APP_CAT_NETWORK: 'Network',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Office',
  LBL_APP_CAT_SYSTEM: 'System',
  LBL_APP_CAT_UTILITIES: 'Utilities',
  LBL_APP_CAT_OTHER: 'Other',

  // UI
  LBL_LAUNCH_SELECT: 'Select application',
  LBL_LAUNCH_SELECT_MESSAGE: 'Select application for \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Select wallpaper',
  LBL_DESKTOP_SELECT_THEME: 'Select theme',
  LBL_SEARCH_TOOLTOP: 'Search Filesystem ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Search filesystems...',
  LBL_SEARCH_WAIT: 'Searching...',
  LBL_SEARCH_RESULT: 'Showing {0} results',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Set as wallpaper',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Top',
  LBL_LEFT: 'Left',
  LBL_RIGHT: 'Right',
  LBL_BOTTOM: 'Bottom',
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
  LBL_OPEN_WITH: 'Open with...',
  LBL_SAVE: 'Save',
  LBL_SAVEAS: 'Save As',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abort',
  LBL_CANCEL: 'Cancel',
  LBL_CLOSE: 'Close',
  LBL_QUIT: 'Quit',
  LBL_YES: 'Yes',
  LBL_NO: 'No',
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
  LBL_HELP: 'Help',
  LBL_ABOUT: 'About',
  LBL_APPLICATION: 'Application',
  LBL_APPLICATIONS: 'Applications',
  LBL_KILL: 'Kill',
  LBL_KILL_ALL: 'Kill all',
  LBL_MINIMIZE: 'Minimize',
  LBL_MAXIMIZE: 'Maximize',
  LBL_RESTORE: 'Restore',
  LBL_RAISE: 'Raise',
  LBL_SHADE: 'Shade',
  LBL_UNSHADE: 'Unshade',
  LBL_ONTOP: 'On top',
  LBL_RESIZE: 'Resize',
  LBL_BACK: 'Back',
  LBL_FORWARD: 'Forward',
  LBL_UPLOAD: 'Upload',
  LBL_IMAGE: 'Image',
  LBL_CREATE_SHORTCUT: 'Create shortcut',
  LBL_REMOVE_SHORTCUT: 'Remove shortcut',
  LBL_EDIT: 'Edit'
};
