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

export const nb_NO = {
  // Core
  ERR_REQUEST_STANDALONE: 'Kan ikke gjøre spørringer i standalone modus.',
  ERR_REQUEST_NOT_OK: 'En feil oppstod under spørring: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filsystem \'{0}\' ikke funnet',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filsystem ikke funnet for \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filsystem \'{0}\' ikke montert',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filesystem \'{0}\' allerede montert',
  ERR_VFS_PATH_FORMAT_INVALID: 'Angitt sti \'{0}\' tilfredstiller ikke format \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Pakke Metadata \'{0}\' ikke funnet',
  ERR_PACKAGE_LOAD: 'Pakke Lasting \'{0}\' feilet: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Pakke Runtime \'{0}\' ikke funnet',
  ERR_PACKAGE_NO_METADATA: 'Metadata ikke funnet for \'{0}\'. Er den i manifestet?',
  ERR_PACKAGE_EXCEPTION: 'En unntaksfeil oppstod i \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Vindu med ID \'{0}\' eksisterer allerede',
  ERR_INVALID_LOCALE: 'Ugyldig lokalisering \'{0}\'',
  LBL_CONNECTION_LOST: 'Tilkobling tapt',
  LBL_CONNECTION_LOST_MESSAGE: 'Tilkobling til OS.js var tapt. Kobler til på nytt....',
  LBL_CONNECTION_RESTORED: 'Tilkobling gjenopprettet',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Tilkobling til OS.js var gjenopprettet.',
  LBL_CONNECTION_FAILED: 'Tilkobling feilet',
  LBL_CONNECTION_FAILED_MESSAGE: 'Tilkobling til OS.js var ikke vellykket. Noen egenskaper er utilgjenglig.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Utvikling',
  LBL_APP_CAT_SCIENCE: 'Vitenskap',
  LBL_APP_CAT_GAMES: 'Spill',
  LBL_APP_CAT_GRAPHICS: 'Grafikk',
  LBL_APP_CAT_NETWORK: 'Nettverk',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Kontor',
  LBL_APP_CAT_SYSTEM: 'System',
  LBL_APP_CAT_UTILITIES: 'Verktøy',
  LBL_APP_CAT_OTHER: 'Andre',

  // UI
  LBL_LAUNCH_SELECT: 'Velg applikasjon',
  LBL_LAUNCH_SELECT_MESSAGE: 'Velg applikasjon for \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Velg bakgrunnsbilde',
  LBL_DESKTOP_SELECT_THEME: 'Velg tema',
  LBL_SEARCH_TOOLTOP: 'Søk i filsystemer ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Søker filsystemer...',
  LBL_SEARCH_WAIT: 'Søker...',
  LBL_SEARCH_RESULT: 'Viser {0} resultater',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Topp',
  LBL_LEFT: 'Venstre',
  LBL_RIGHT: 'Høyre',
  LBL_BOTTOM: 'Bunn',
  LBL_MENU: 'Meny',
  LBL_ERROR: 'Feil',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Melding',
  LBL_WARNINIG: 'Advarsel',
  LBL_SUCCESS: 'Velykket',
  LBL_FAILURE: 'Svikt',
  LBL_WINDOW: 'Vindu',
  LBL_WINDOWS: 'Vinduer',
  LBL_NOTIFICATION: 'Notifikasjon',
  LBL_NOTIFICATIONS: 'Notifikasjoner',
  LBL_TRAY: 'Tray Oppføring',
  LBL_NAME: 'Navn',
  LBL_TYPE: 'Type',
  LBL_SIZE: 'Størrelse',
  LBL_FILE: 'Fil',
  LBL_NEW: 'Ny',
  LBL_OPEN: 'Åpne',
  LBL_SAVE: 'Lagre',
  LBL_SAVEAS: 'Lagre Som',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abort',
  LBL_CANCEL: 'Avbryt',
  LBL_CLOSE: 'Lukk',
  LBL_QUIT: 'Slutt',
  LBL_YES: 'Ja',
  LBL_NO: 'Nei',
  LBL_GO: 'Gå',
  LBL_MKDIR: 'Lag ny mappe',
  LBL_MKFILE: 'Lag ny fil',
  LBL_COPY: 'Kopier',
  LBL_PASTE: 'Lim inn',
  LBL_CUT: 'Kutt',
  LBL_MOVE: 'Flytt',
  LBL_RENAME: 'Navngi',
  LBL_DELETE: 'Slett',
  LBL_DOWNLOAD: 'Last ned',
  LBL_REFRESH: 'Gjenoppfrisk',
  LBL_RELOAD: 'Last på nytt',
  LBL_HOME: 'Hjem',
  LBL_VIEW: 'Visning',
  LBL_HELP: 'Hjelp',
  LBL_ABOUT: 'Om',
  LBL_APPLICATION: 'Applikasjon',
  LBL_APPLICATIONS: 'Applikasjoner',
  LBL_KILL: 'Drep',
  LBL_KILL_ALL: 'Drep alle',
  LBL_MINIMIZE: 'Minimisèr',
  LBL_MAXIMIZE: 'Maksimisèr',
  LBL_RESTORE: 'Gjenopprett',
  LBL_RAISE: 'Løft',
  LBL_SHADE: 'Rull opp',
  LBL_UNSHADE: 'Rull ned',
  LBL_ONTOP: 'Alltid øverst',
  LBL_RESIZE: 'Endre størrelse',
  LBL_BACK: 'Tilbake',
  LBL_FORWARD: 'Frem',
  LBL_UPLOAD: 'Last opp',
  LBL_IMAGE: 'Bilde'
};
