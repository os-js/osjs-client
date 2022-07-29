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

export const tr_TR = {
  // Core
  ERR_REQUEST_STANDALONE: 'Bağımsız modda talepde bulunulamaz.',
  ERR_REQUEST_NOT_OK: 'Talep gerçekleştirilirken bir hata oluştu: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: '\'{0}\' isimli dosya sistemi bulunamadı',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: '\'{0}\' için dosya sistemi bulunamadı',
  ERR_VFS_MOUNT_NOT_MOUNTED: '\'{0}\' isimli dosya sistemi çıkarılmadı',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: '\'{0}\' isimli dosya sistemi zaten çıkarıldı',
  ERR_VFS_PATH_FORMAT_INVALID: '\'{0}\' olarak verilen yol, \'name:/path\' ile eşleşmiyor',
  ERR_PACKAGE_PERMISSION_DENIED: '\'{0}\' dosyasını çalıştırmaya iznin yok',
  ERR_PACKAGE_NOT_FOUND: '\'{0}\' isimli paket meta verisi bulunamadı',
  ERR_PACKAGE_LOAD: '\'{0}\' paketinin yüklenmesi başarısız: {1}',
  ERR_PACKAGE_NO_RUNTIME: '\'{0}\' paketinin runtime verisi bulunamadı',
  ERR_PACKAGE_NO_METADATA: '\'{0}\' için meta verisi bulunamadı. Manifest\'de olabilir mi?',
  ERR_PACKAGE_EXCEPTION: '\'{0}\' konumunda beklenmeyen bir durum gerçekleşti',
  ERR_WINDOW_ID_EXISTS: '\'{0}\' ID\'sine sahip olan bir pencere zaten var',
  ERR_INVALID_LOCALE: 'Geçersiz yer \'{0}\'',
  LBL_CONNECTION_LOST: 'Bağlantı Koptu',
  LBL_CONNECTION_LOST_MESSAGE: 'OS.js\'ye olan bağlantı koptu. Yeniden bağlanılıyor....',
  LBL_CONNECTION_RESTORED: 'Bağlantı Yenilendi',
  LBL_CONNECTION_RESTORED_MESSAGE: 'OS.js\'ye olan bağlantı yenilendi.',
  LBL_CONNECTION_FAILED: 'Bağlantı Başarısız',
  LBL_CONNECTION_FAILED_MESSAGE: 'OS.js\'ye bağlanılamıyor. Çeşitli özellikler doğru çalışmayabilir.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Geliştirme',
  LBL_APP_CAT_SCIENCE: 'Bilim',
  LBL_APP_CAT_GAMES: 'Oyun',
  LBL_APP_CAT_GRAPHICS: 'Grafik',
  LBL_APP_CAT_NETWORK: 'Ağ',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedya',
  LBL_APP_CAT_OFFICE: 'Ofis',
  LBL_APP_CAT_SYSTEM: 'Sistem',
  LBL_APP_CAT_UTILITIES: 'Araçlar',
  LBL_APP_CAT_OTHER: 'Diğer',

  // UI
  LBL_LAUNCH_SELECT: 'Uygulama seç',
  LBL_LAUNCH_SELECT_MESSAGE: '\'{0}\' için uygulama seç',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Arkaplan seç',
  LBL_DESKTOP_SELECT_THEME: 'Tema seç',
  LBL_SEARCH_TOOLTOP: 'Dosya sistemi ({0}) ara',
  LBL_SEARCH_PLACEHOLDER: 'Dosya sistemlerini ara...',
  LBL_SEARCH_WAIT: 'Aranıyor...',
  LBL_SEARCH_RESULT: '{0} kadar sonuç gösteriliyor',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Arkaplan olarak ayarla',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Üst',
  LBL_LEFT: 'Sol',
  LBL_RIGHT: 'Sağ',
  LBL_BOTTOM: 'Alt',
  LBL_MENU: 'Menü',
  LBL_ERROR: 'Hata',
  LBL_INFO: 'Bilgi',
  LBL_MESSAGE: 'Mesaj',
  LBL_WARNINIG: 'Uyarı',
  LBL_SUCCESS: 'Başarı',
  LBL_FAILURE: 'Kusur',
  LBL_WINDOW: 'Pencere',
  LBL_WINDOWS: 'Pencereler',
  LBL_NOTIFICATION: 'Bildiri',
  LBL_NOTIFICATIONS: 'Bildiriler',
  LBL_TRAY: 'Tray Girişi',
  LBL_NAME: 'İsim',
  LBL_TYPE: 'Tür',
  LBL_SIZE: 'Boyut',
  LBL_FILE: 'Dosya',
  LBL_NEW: 'Yeni',
  LBL_OPEN: 'Aç',
  LBL_OPEN_WITH: 'Şununla aç:',
  LBL_SAVE: 'Kaydet',
  LBL_SAVEAS: 'Farklı Kaydet',
  LBL_OK: 'Tamam',
  LBL_ABORT: 'Durdur',
  LBL_CANCEL: 'İptal',
  LBL_CLOSE: 'Kapat',
  LBL_QUIT: 'Çık',
  LBL_YES: 'Evet',
  LBL_NO: 'Hayır',
  LBL_GO: 'Git',
  LBL_MKDIR: 'Yeni dizin oluştur',
  LBL_MKFILE: 'Yeni dosya oluştur',
  LBL_COPY: 'Kopyala',
  LBL_PASTE: 'Yapıştır',
  LBL_CUT: 'Kes',
  LBL_MOVE: 'Taşı',
  LBL_RENAME: 'Yeniden Adlandır',
  LBL_DELETE: 'Sil',
  LBL_DOWNLOAD: 'İndir',
  LBL_REFRESH: 'Yenile',
  LBL_RELOAD: 'Yeniden Yükle',
  LBL_HOME: 'Ev',
  LBL_VIEW: 'Göster',
  LBL_HELP: 'Yardım',
  LBL_ABOUT: 'Hakkında',
  LBL_APPLICATION: 'Uygulama',
  LBL_APPLICATIONS: 'Uygulamalar',
  LBL_KILL: 'Öldür',
  LBL_KILL_ALL: 'Hepsini öldür',
  LBL_MINIMIZE: 'Küçült',
  LBL_MAXIMIZE: 'Büyüt',
  LBL_RESTORE: 'Onar',
  LBL_RAISE: 'Yükselt',
  LBL_SHADE: 'Ört',
  LBL_UNSHADE: 'Örtme',
  LBL_ONTOP: 'Tepe',
  LBL_RESIZE: 'Yeniden boyutlandır',
  LBL_BACK: 'Geri',
  LBL_FORWARD: 'İleri',
  LBL_UPLOAD: 'Yükle',
  LBL_IMAGE: 'İmge',
  LBL_CREATE_SHORTCUT: 'Kısayol oluştur',
  LBL_REMOVE_SHORTCUT: 'Kısayolu sil',
  LBL_EDIT: 'Düzenle'
};
