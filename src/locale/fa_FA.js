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
 * 
 * @author  Morteza Javan <javan.it@gmail.com>
 * @licence Simplified BSD License
 */

export const fa_FA = {
  // Core
  ERR_REQUEST_STANDALONE: 'امکان اجرای درخواست در حالت واحد وجود ندارد.',
  ERR_REQUEST_NOT_OK: 'خطایی در حال انجام این درخواست رخ داد: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'سیستم فایل \'{0}\' پیدا نشد',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'سیستم فایل برای \'{0}\' پیدا نشد',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'سیستم فایل \'{0}\' متصل نیست',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'سیستم فایل \'{0}\' از قبل متصل شده است',
  ERR_VFS_PATH_FORMAT_INVALID: 'آدرس \'{0}\' با الگو مطابقت ندارد \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'فراداده بسته \'{0}\' پیدا نشد',
  ERR_PACKAGE_LOAD: 'بارگزاری بسته \'{0}\' دچار خطا شد: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'فایل های اجرایی \'{0}\' پیدا نشد',
  ERR_PACKAGE_NO_METADATA: 'فراداده برای \'{0}\' پیدا نشد. ممکن است در مانیفست باشد؟?',
  ERR_PACKAGE_EXCEPTION: 'بروز شرایط استثنا \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'پنجره با شناسه \'{0}\' قبلا وجود دارد',
  ERR_INVALID_LOCALE: 'زبان نامعتبر \'{0}\'',
  LBL_CONNECTION_LOST: 'از دست رفتن ارتباط',
  LBL_CONNECTION_LOST_MESSAGE: 'ارتباط با سرور قطع شد. در حال تلاش ....',
  LBL_CONNECTION_RESTORED: 'ارتباط بازیابی شد',
  LBL_CONNECTION_RESTORED_MESSAGE: 'ارتباط با سرور مجدد برقرار شد.',
  LBL_CONNECTION_FAILED: 'ارتباط با خطا مواجه شد',
  LBL_CONNECTION_FAILED_MESSAGE: 'ارتباط نمیتواند با سرور برقرار شود.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'توسعه',
  LBL_APP_CAT_SCIENCE: 'علمی',
  LBL_APP_CAT_GAMES: 'بازی',
  LBL_APP_CAT_GRAPHICS: 'گرافیک',
  LBL_APP_CAT_NETWORK: 'شبکه',
  LBL_APP_CAT_MULTIMEDIA: 'چندرسانه ای',
  LBL_APP_CAT_OFFICE: 'اداری',
  LBL_APP_CAT_SYSTEM: 'سیستمی',
  LBL_APP_CAT_UTILITIES: 'ابزارها',
  LBL_APP_CAT_OTHER: 'سایر',

  // UI
  LBL_LAUNCH_SELECT: 'انتخاب برنامه کاربردی',
  LBL_LAUNCH_SELECT_MESSAGE: 'انتخاب برنامه کاربردی برای \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'انتخاب کاغذ دیواری',
  LBL_DESKTOP_SELECT_THEME: 'انتخاب الگو',
  LBL_SEARCH_TOOLTOP: 'جستجوی سیستم فایل ({0})',
  LBL_SEARCH_PLACEHOLDER: 'جستجوی سیستم فایل...',
  LBL_SEARCH_WAIT: 'در جال جستجو...',
  LBL_SEARCH_RESULT: 'نمایش {0} نتیجه',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'کیلوبایت',
  LBL_FS_MIB: 'مگابایت',
  LBL_FS_GIB: 'گیگابایت',

  // Generic
  LBL_TOP: 'بالا',
  LBL_LEFT: 'چپ',
  LBL_RIGHT: 'راست',
  LBL_BOTTOM: 'پایین',
  LBL_MENU: 'منوی اصلی',
  LBL_ERROR: 'خطا',
  LBL_INFO: 'نکته',
  LBL_MESSAGE: 'پیام',
  LBL_WARNINIG: 'هشدار',
  LBL_SUCCESS: 'موفق',
  LBL_FAILURE: 'شکست',
  LBL_WINDOW: 'پنجره',
  LBL_WINDOWS: 'پنجره ها',
  LBL_NOTIFICATION: 'اطلاعیه',
  LBL_NOTIFICATIONS: 'اطلاعیه ها',
  LBL_TRAY: 'سینی ابزار',
  LBL_NAME: 'نام',
  LBL_TYPE: 'نوع',
  LBL_SIZE: 'اندازه',
  LBL_FILE: 'فایل',
  LBL_NEW: 'جدید',
  LBL_OPEN: 'بازکردن',
  LBL_OPEN_WITH: 'باز کردن با...',
  LBL_SAVE: 'ذخیره',
  LBL_SAVEAS: 'ذخیره جدید',
  LBL_OK: 'تایید',
  LBL_ABORT: 'بیخیال',
  LBL_CANCEL: 'رد',
  LBL_CLOSE: 'بستن',
  LBL_QUIT: 'خروج',
  LBL_YES: 'بله',
  LBL_NO: 'خیر',
  LBL_GO: 'برو',
  LBL_MKDIR: 'ایجاد پوشه جدید',
  LBL_MKFILE: 'ایجاد فایل جدید',
  LBL_COPY: 'کپی',
  LBL_PASTE: 'الصاق',
  LBL_CUT: 'برداشتن',
  LBL_MOVE: 'انتقال',
  LBL_RENAME: 'تغییرنام',
  LBL_DELETE: 'حذف',
  LBL_DOWNLOAD: 'دانلود',
  LBL_REFRESH: 'نوسازی',
  LBL_RELOAD: 'بارگزاری مجدد',
  LBL_HOME: 'خانه',
  LBL_VIEW: 'نمایش',
  LBL_HELP: 'کمک',
  LBL_ABOUT: 'درباره',
  LBL_APPLICATION: 'برنامه کاربردی',
  LBL_APPLICATIONS: 'برنامه های کاربردی',
  LBL_KILL: 'از بین بردن',
  LBL_KILL_ALL: 'از بین بردن همه',
  LBL_MINIMIZE: 'کمینه',
  LBL_MAXIMIZE: 'بیشینه',
  LBL_RESTORE: 'عادی',
  LBL_RAISE: 'شناور',
  LBL_SHADE: 'بالا بردن',
  LBL_UNSHADE: 'پایین آوردن',
  LBL_ONTOP: 'در بالا',
  LBL_RESIZE: 'تغییراندازه',
  LBL_BACK: 'عقب',
  LBL_FORWARD: 'جلو',
  LBL_UPLOAD: 'آپلود',
  LBL_IMAGE: 'تصویر',
  LBL_CREATE_SHORTCUT: 'ایجاد میانبر',
  LBL_REMOVE_SHORTCUT: 'حذف میانبر',
  LBL_EDIT: 'ویرایش'
};
