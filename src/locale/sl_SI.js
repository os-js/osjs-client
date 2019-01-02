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
 * @author  Filip Š <projects@filips.com>
 * @licence Simplified BSD License
 */

export const sl_SI = {
  // Core
  ERR_REQUEST_STANDALONE: 'Zahteve v samostojnem načinu niso mogoče.',
  ERR_REQUEST_NOT_OK: 'Pri zahtevi je prišlo do napake: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Datotečni sistem \'{0}\' ni najden',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Datotečni sistem ni najden \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Datotečni sistem \'{0}\' ni nameščen',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Datotečni sistem \'{0}\' že nameščen',
  ERR_VFS_PATH_FORMAT_INVALID: 'Podana pot \'{0}\' se ne ujema z \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Metapodatki paketa \'{0}\' niso najdeni',
  ERR_PACKAGE_LOAD: 'Pri nalaganju pageta \'{0}\' je prišlo do napake: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Koda paketa \'{0}\' ni najdena',
  ERR_PACKAGE_NO_METADATA: 'Metapodatki \'{0}\' niso najdeni. Ali so v datoteki manifest?',
  ERR_PACKAGE_EXCEPTION: 'Sprožena je bila izjema v \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Okno z ID-jem \'{0}\' že obstaja',
  ERR_INVALID_LOCALE: 'Neveljaven prevod \'{0}\'',
  LBL_CONNECTION_LOST: 'Izguba povezave',
  LBL_CONNECTION_LOST_MESSAGE: 'Povezava do strežnika je bila izgubljena. Ponovno povezovanje ...',
  LBL_CONNECTION_RESTORED: 'Vzpostavitev povezave',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Povezava do strežnika je bila ponovno vzpostavljena.',
  LBL_CONNECTION_FAILED: 'Povezava ni uspela',
  LBL_CONNECTION_FAILED_MESSAGE: 'Povezave z OS.js ni bilo mogoče vzpostaviti. Nekatere funkcije morda ne bodo delovale pravilno.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Razvoj',
  LBL_APP_CAT_SCIENCE: 'Znanost',
  LBL_APP_CAT_GAMES: 'Igre',
  LBL_APP_CAT_GRAPHICS: 'Grafika',
  LBL_APP_CAT_NETWORK: 'Omrežje',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedija',
  LBL_APP_CAT_OFFICE: 'Pisarna',
  LBL_APP_CAT_SYSTEM: 'Sistem',
  LBL_APP_CAT_UTILITIES: 'Orodja',
  LBL_APP_CAT_OTHER: 'Drugo',

  // UI
  LBL_LAUNCH_SELECT: 'Izberite aplikacijo',
  LBL_LAUNCH_SELECT_MESSAGE: 'Izberite aplikacijo za \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Izberite ozadje',
  LBL_DESKTOP_SELECT_THEME: 'Izberite temo',
  LBL_SEARCH_TOOLTOP: 'Išči datotečni sistem ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Iskanje po datotečnih sistemih ...',
  LBL_SEARCH_WAIT: 'Iskanje ...',
  LBL_SEARCH_RESULT: 'Prikaz {0} rezultatov',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Zgoraj',
  LBL_LEFT: 'Levo',
  LBL_RIGHT: 'Desno',
  LBL_BOTTOM: 'Spodaj',
  LBL_MENU: 'Meni',
  LBL_ERROR: 'Napaka',
  LBL_INFO: 'Informacije',
  LBL_MESSAGE: 'Sporočilo',
  LBL_WARNINIG: 'Opozorilo',
  LBL_SUCCESS: 'Uspeh',
  LBL_FAILURE: 'Neuspeh',
  LBL_WINDOW: 'Okno',
  LBL_WINDOWS: 'Okna',
  LBL_NOTIFICATION: 'Obvestilo',
  LBL_NOTIFICATIONS: 'Obvestila',
  LBL_TRAY: 'Element vrstice',
  LBL_NAME: 'Ime',
  LBL_TYPE: 'Vrsta',
  LBL_SIZE: 'Velikost',
  LBL_FILE: 'Datoteka',
  LBL_NEW: 'Novo',
  LBL_OPEN: 'Odpri',
  LBL_SAVE: 'Shrani',
  LBL_SAVEAS: 'Shrani kot',
  LBL_OK: 'V redu',
  LBL_ABORT: 'Prekini',
  LBL_CANCEL: 'Prekliči',
  LBL_CLOSE: 'Zapri',
  LBL_QUIT: 'Izklopi',
  LBL_YES: 'Da',
  LBL_NO: 'Ne',
  LBL_GO: 'Pojdi',
  LBL_MKDIR: 'Ustvari novo mapo',
  LBL_MKFILE: 'Ustvari novo datoteko',
  LBL_COPY: 'Kopiraj',
  LBL_PASTE: 'Prilepi',
  LBL_CUT: 'Izreži',
  LBL_MOVE: 'Premakni',
  LBL_RENAME: 'Preimenuj',
  LBL_DELETE: 'Izbriši',
  LBL_DOWNLOAD: 'Prenesi',
  LBL_REFRESH: 'Osveži',
  LBL_RELOAD: 'Osveži',
  LBL_HOME: 'Domov',
  LBL_VIEW: 'Pogled',
  LBL_HELP: 'Pomoč',
  LBL_ABOUT: 'O programu',
  LBL_APPLICATION: 'Aplikacija',
  LBL_APPLICATIONS: 'Aplikacije',
  LBL_KILL: 'Končaj',
  LBL_KILL_ALL: 'Končaj vse',
  LBL_MINIMIZE: 'Pomanjšaj',
  LBL_MAXIMIZE: 'Povečaj',
  LBL_RESTORE: 'Obnovi',
  LBL_RAISE: 'Dvigni',
  LBL_SHADE: 'Zasenči',
  LBL_UNSHADE: 'Odsenči',
  LBL_ONTOP: 'Na vrhu',
  LBL_RESIZE: 'Spremeni velikost',
  LBL_BACK: 'Nazaj',
  LBL_FORWARD: 'Naprej',
  LBL_UPLOAD: 'Naloži',
  LBL_IMAGE: 'Slika'
};
