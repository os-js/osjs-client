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

export const sv_SE = {
  // Core
  ERR_REQUEST_STANDALONE: 'Det går inte att göra förfrågningar i fristående läge.',
  ERR_REQUEST_NOT_OK: 'Ett fel uppstod när en begäran utfördes: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filsystemet \'{0}\' hittades inte',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filsystemet hittades inte för \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filsystemet \'{0}\' inte monterat',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filsystemet \'{0}\' redan monterat',
  ERR_VFS_PATH_FORMAT_INVALID: 'Angiven väg \'{0}\' matchar inte \'name:/path\'',
  ERR_PACKAGE_PERMISSION_DENIED: 'Du har inte tillåtelse att starta \'{0}\'',
  ERR_PACKAGE_NOT_FOUND: 'Paketmetadata \'{0}\' hittades inte',
  ERR_PACKAGE_LOAD: 'Paketladdning \'{0}\' misslyckades: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Paketets körtid \'{0}\' hittades inte',
  ERR_PACKAGE_NO_METADATA: 'Metadata hittades inte för \'{0}\'. Är det i manifestet?',
  ERR_PACKAGE_EXCEPTION: 'Ett undantag inträffade i \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Fönster med ID \'{0}\' existerar redan',
  ERR_INVALID_LOCALE: 'Ogiltigt språk \'{0}\'',
  LBL_CONNECTION_LOST: 'Anslutning förlorad',
  LBL_CONNECTION_LOST_MESSAGE: 'Anslutningen till OS.js förlorades. Återansluter ....',
  LBL_CONNECTION_RESTORED: 'Anslutning återställd',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Anslutningen till OS.js-servern återställdes.',
  LBL_CONNECTION_FAILED: 'Anslutningen misslyckades',
  LBL_CONNECTION_FAILED_MESSAGE: 'Anslutningen till OS.js kunde inte upprättas. Vissa funktioner kanske inte fungerar ordentligt.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Utveckling',
  LBL_APP_CAT_SCIENCE: 'Vetenskap',
  LBL_APP_CAT_GAMES: 'Spel',
  LBL_APP_CAT_GRAPHICS: 'Grafik',
  LBL_APP_CAT_NETWORK: 'Nätverk',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Kontor',
  LBL_APP_CAT_SYSTEM: 'Systemet',
  LBL_APP_CAT_UTILITIES: 'Verktyg',
  LBL_APP_CAT_OTHER: 'Övrigt',

  // UI
  LBL_LAUNCH_SELECT: 'Välj applikation',
  LBL_LAUNCH_SELECT_MESSAGE: 'Välj applikation för \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Välj bakgrund',
  LBL_DESKTOP_SELECT_THEME: 'Välj tema',
  LBL_SEARCH_TOOLTOP: 'Sök filsystem ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Sök filsystemen...',
  LBL_SEARCH_WAIT: 'Söker...',
  LBL_SEARCH_RESULT: 'Visar {0} resultat',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Använd som bakgrund',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Topp',
  LBL_LEFT: 'Vänster',
  LBL_RIGHT: 'Höger',
  LBL_BOTTOM: 'Botten',
  LBL_MENU: 'Meny',
  LBL_ERROR: 'Fel',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Meddelande',
  LBL_WARNINIG: 'Varning',
  LBL_SUCCESS: 'Framgång',
  LBL_FAILURE: 'Fel',
  LBL_WINDOW: 'Fönster',
  LBL_WINDOWS: 'Fönster',
  LBL_NOTIFICATION: 'Meddelande',
  LBL_NOTIFICATIONS: 'Meddelanden',
  LBL_TRAY: 'Fackinmatning',
  LBL_NAME: 'Namn',
  LBL_TYPE: 'Typ',
  LBL_SIZE: 'Storlek',
  LBL_FILE: 'Fil',
  LBL_NEW: 'Ny',
  LBL_OPEN: 'Öppna',
  LBL_OPEN_WITH: 'Öppna med...',
  LBL_SAVE: 'Spara',
  LBL_SAVEAS: 'Spara som',
  LBL_OK: 'OK',
  LBL_ABORT: 'Avbryta',
  LBL_CANCEL: 'Avbryt',
  LBL_CLOSE: 'Stäng',
  LBL_QUIT: 'Sluta',
  LBL_YES: 'Ja',
  LBL_NO: 'Nej',
  LBL_GO: 'Gå',
  LBL_MKDIR: 'Skapa ny katalog',
  LBL_MKFILE: 'Skapa ny fil',
  LBL_COPY: 'Kopiera',
  LBL_PASTE: 'Klistra in',
  LBL_CUT: 'Klipp ut',
  LBL_MOVE: 'Flytta',
  LBL_RENAME: 'Döp om',
  LBL_DELETE: 'Radera',
  LBL_DOWNLOAD: 'Ladda ner',
  LBL_REFRESH: 'Uppdatera',
  LBL_RELOAD: 'Ladda om',
  LBL_HOME: 'Hem',
  LBL_VIEW: 'Se',
  LBL_HELP: 'Hjälp',
  LBL_ABOUT: 'Om',
  LBL_APPLICATION: 'Ansökan',
  LBL_APPLICATIONS: 'Applikationer',
  LBL_KILL: 'Döda',
  LBL_KILL_ALL: 'Döda alla',
  LBL_MINIMIZE: 'Minimera',
  LBL_MAXIMIZE: 'Maximera',
  LBL_RESTORE: 'Återställ',
  LBL_RAISE: 'Höj',
  LBL_SHADE: 'Skugga',
  LBL_UNSHADE: 'Avskugga',
  LBL_ONTOP: 'Överst',
  LBL_RESIZE: 'Ändra storlek',
  LBL_BACK: 'Back',
  LBL_FORWARD: 'Forward',
  LBL_UPLOAD: 'Ladda upp',
  LBL_IMAGE: 'Bild',
  LBL_CREATE_SHORTCUT: 'Skapa genväg',
  LBL_REMOVE_SHORTCUT: 'ta bort genväg',
  LBL_EDIT: 'Redigera'
};
