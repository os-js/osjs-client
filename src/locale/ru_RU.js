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

export const ru_RU = {
  // Core
  ERR_REQUEST_STANDALONE: 'Невозможно делать запросы в автономном режиме.',
  ERR_REQUEST_NOT_OK: 'Произошла ошибка при запросе: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Файловая система \'{0}\' не найдена',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Файловая система не найдена для \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Файловая система \'{0}\' не вмонтирована',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Файловая система \'{0}\' уже вмонтирована',
  ERR_VFS_PATH_FORMAT_INVALID: 'Заданный путь \'{0}\' не соответсвует формату \'имя:/путь\'',
  ERR_PACKAGE_NOT_FOUND: 'Метаданные пакета \'{0}\' не найдены',
  ERR_PACKAGE_LOAD: 'Ошибка загрузки пакета \'{0}\': {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Рантайм пакета \'{0}\' не найден',
  ERR_PACKAGE_NO_METADATA: 'Метаданные не найдены для \'{0}\'. Is it in the manifest?',
  ERR_PACKAGE_EXCEPTION: 'Произошло исключение в \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Окно с ID \'{0}\' уже существует',
  ERR_INVALID_LOCALE: 'Неправильная локаль \'{0}\'',
  LBL_CONNECTION_LOST: 'Соединение Потеряно',
  LBL_CONNECTION_LOST_MESSAGE: 'Соединение с OS.js было потеряно. Переподключаемся....',
  LBL_CONNECTION_RESTORED: 'Соединение Восстановлено',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Соединение с сервером OS.js было восстановлено.',
  LBL_CONNECTION_FAILED: 'Ошибка Соединения',
  LBL_CONNECTION_FAILED_MESSAGE: 'Соединение с OS.js не может быть установлено. Некоторые возможности могут не работать корректно.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Разработка',
  LBL_APP_CAT_SCIENCE: 'Вычисления',
  LBL_APP_CAT_GAMES: 'Игры',
  LBL_APP_CAT_GRAPHICS: 'Графика',
  LBL_APP_CAT_NETWORK: 'Сеть',
  LBL_APP_CAT_MULTIMEDIA: 'Мультимедиа',
  LBL_APP_CAT_OFFICE: 'Офис',
  LBL_APP_CAT_SYSTEM: 'Система',
  LBL_APP_CAT_UTILITIES: 'Утилиты',
  LBL_APP_CAT_OTHER: 'Другие',

  // UI
  LBL_LAUNCH_SELECT: 'Выберите приложение',
  LBL_LAUNCH_SELECT_MESSAGE: 'Выберите приложение \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Выберите обои',
  LBL_DESKTOP_SELECT_THEME: 'Выберите тему',
  LBL_SEARCH_TOOLTOP: 'Поиск файловой системы ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Поиск файловой системы...',
  LBL_SEARCH_WAIT: 'Поиск...',
  LBL_SEARCH_RESULT: 'Показано {0} результатов',

  // FS
  LBL_FS_B: 'Б',
  LBL_FS_M: 'М',
  LBL_FS_G: 'Г',
  LBL_FS_KIB: 'ГиБ',
  LBL_FS_MIB: 'МиБ',
  LBL_FS_GIB: 'ГиБ',

  // Generic
  LBL_TOP: 'Вверх',
  LBL_LEFT: 'Лево',
  LBL_RIGHT: 'Право',
  LBL_BOTTOM: 'Вниз',
  LBL_MENU: 'Меню',
  LBL_ERROR: 'Ошибка',
  LBL_INFO: 'Информация',
  LBL_MESSAGE: 'Сообщение',
  LBL_WARNINIG: 'Предупреждение',
  LBL_SUCCESS: 'Успешно',
  LBL_FAILURE: 'Ошибка',
  LBL_WINDOW: 'Окно',
  LBL_WINDOWS: 'Окна',
  LBL_NOTIFICATION: 'Оповещение',
  LBL_NOTIFICATIONS: 'Оповещения',
  LBL_TRAY: 'Трэй',
  LBL_NAME: 'Имя',
  LBL_TYPE: 'Тип',
  LBL_SIZE: 'Размер',
  LBL_FILE: 'Файл',
  LBL_NEW: 'Новый',
  LBL_OPEN: 'Открыть',
  LBL_OPEN_WITH: 'Открыть с...',
  LBL_SAVE: 'Сохранить',
  LBL_SAVEAS: 'Сохранить как',
  LBL_OK: 'ОК',
  LBL_ABORT: 'Прервать',
  LBL_CANCEL: 'Отмена',
  LBL_CLOSE: 'Закрыть',
  LBL_QUIT: 'Выйти',
  LBL_YES: 'Да',
  LBL_NO: 'Нет',
  LBL_GO: 'Вперед',
  LBL_MKDIR: 'Новая папка',
  LBL_MKFILE: 'Новый файл',
  LBL_COPY: 'Скопировать',
  LBL_PASTE: 'Вставить',
  LBL_CUT: 'Вырезать',
  LBL_MOVE: 'Переместить',
  LBL_RENAME: 'Переименовать',
  LBL_DELETE: 'Удалить',
  LBL_DOWNLOAD: 'Скачать',
  LBL_REFRESH: 'Обновить',
  LBL_RELOAD: 'Перезагрузить',
  LBL_HOME: 'Домой',
  LBL_VIEW: 'Вид',
  LBL_HELP: 'Помощь',
  LBL_ABOUT: 'О программе',
  LBL_APPLICATION: 'Приложение',
  LBL_APPLICATIONS: 'Приложения',
  LBL_KILL: 'Убить',
  LBL_KILL_ALL: 'Убить все',
  LBL_MINIMIZE: 'Свернуть',
  LBL_MAXIMIZE: 'Развернуть',
  LBL_RESTORE: 'Восстановить',
  LBL_RAISE: 'Raise',
  LBL_SHADE: 'Shade',
  LBL_UNSHADE: 'Unshade',
  LBL_ONTOP: 'Поверх окон',
  LBL_RESIZE: 'Размер',
  LBL_BACK: 'Назад',
  LBL_FORWARD: 'Вперед',
  LBL_UPLOAD: 'Загрузить',
  LBL_IMAGE: 'Картинка',
  LBL_CREATE_SHORTCUT: 'Создать ярлык',
  LBL_REMOVE_SHORTCUT: 'Удалить ярлык'
};
