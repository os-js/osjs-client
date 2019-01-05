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
 * @author  Nguyễn Anh Khoa <khoaakt@gmail.com>
 * @licence Simplified BSD License
 */

export const vi_VN = {
  // Core
  ERR_REQUEST_STANDALONE: 'Không thể gửi yêu cầu ở chế độ độc lập.',
  ERR_REQUEST_NOT_OK: 'Đã xảy ra lỗi khi thực hiện yêu cầu: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Không tìm thấy hệ thống tập tin \'{0}\'',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Không tìm thấy hệ thống tập tin cho \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Hệ thống tập tin \'{0}\' không được gắn kết',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Hệ thống tập tin \'{0}\' đã được gắn kết',
  ERR_VFS_PATH_FORMAT_INVALID: 'Định dạng đường dẫn \'{0}\' không khớp với \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Không tìm thấy siêu dữ liệu của gói \'{0}\'',
  ERR_PACKAGE_LOAD: 'Tải gói \'{0}\' thất bại: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Không tìm thấy Runtime của gói \'{0}\'',
  ERR_PACKAGE_NO_METADATA: 'Không tìm thấy siêu dữ liệu cho \'{0}\'. Bạn có chắc nó đã được báo cáo trong manifest không?',
  ERR_PACKAGE_EXCEPTION: 'Đã xảy ra lỗi trong \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Cửa sổ với ID \'{0}\' đã tồn tại',
  ERR_INVALID_LOCALE: 'Ngôn ngữ không hợp lệ \'{0}\'',
  LBL_CONNECTION_LOST: 'Mất kết nối',
  LBL_CONNECTION_LOST_MESSAGE: 'Kết nối với OS.js đã bị mất. Đang kết nối lại....',
  LBL_CONNECTION_RESTORED: 'Đã khôi phục kết nối',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Kết nối với máy chủ OS.js đã được khôi phục.',
  LBL_CONNECTION_FAILED: 'Kết nối thất bại',
  LBL_CONNECTION_FAILED_MESSAGE: 'Không thể kết nối đến máy chủ OS.js. Một số tính năng có thể không hoạt động ổn định.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Phát triển',
  LBL_APP_CAT_SCIENCE: 'Khoa học',
  LBL_APP_CAT_GAMES: 'Trò chơi',
  LBL_APP_CAT_GRAPHICS: 'Đồ họa',
  LBL_APP_CAT_NETWORK: 'Mạng',
  LBL_APP_CAT_MULTIMEDIA: 'Đa phương tiện',
  LBL_APP_CAT_OFFICE: 'Văn phòng',
  LBL_APP_CAT_SYSTEM: 'Hệ thống',
  LBL_APP_CAT_UTILITIES: 'Tiện ích',
  LBL_APP_CAT_OTHER: 'Ứng dụng khác',

  // UI
  LBL_LAUNCH_SELECT: 'Chọn ứng dụng',
  LBL_LAUNCH_SELECT_MESSAGE: 'Chọn ứng dụng để mở tập tin \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Thay đổi hình nền',
  LBL_DESKTOP_SELECT_THEME: 'Thay đổi chủ đề',
  LBL_SEARCH_TOOLTOP: 'Tìm kiếm dữ liệu ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Tìm kiếm...',
  LBL_SEARCH_WAIT: 'Đang tìm kiếm...',
  LBL_SEARCH_RESULT: 'Đang hiển thị {0} kết quả',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Phía trên',
  LBL_LEFT: 'Trái',
  LBL_RIGHT: 'Phải',
  LBL_BOTTOM: 'Phía dưới',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Lỗi',
  LBL_INFO: 'Thông tin',
  LBL_MESSAGE: 'Thông báo',
  LBL_WARNINIG: 'Cảnh báo',
  LBL_SUCCESS: 'Thành công',
  LBL_FAILURE: 'Thất bại',
  LBL_WINDOW: 'Cửa sổ',
  LBL_WINDOWS: 'Các cửa sổ',
  LBL_NOTIFICATION: 'Thông báo',
  LBL_NOTIFICATIONS: 'Các thông báo',
  LBL_TRAY: 'Mục khay hệ thống',
  LBL_NAME: 'Tên',
  LBL_TYPE: 'Kiểu',
  LBL_SIZE: 'Kích thước',
  LBL_FILE: 'Tập tin',
  LBL_NEW: 'Mới',
  LBL_OPEN: 'Mở',
  LBL_SAVE: 'Lưu',
  LBL_SAVEAS: 'Lưu như',
  LBL_OK: 'OK',
  LBL_ABORT: 'Hủy thao tác',
  LBL_CANCEL: 'Hủy bỏ',
  LBL_CLOSE: 'Đóng',
  LBL_QUIT: 'Thoát',
  LBL_YES: 'Có',
  LBL_NO: 'Không',
  LBL_GO: 'Đi',
  LBL_MKDIR: 'Tạo thư mục mới',
  LBL_MKFILE: 'Tạo tệp mới',
  LBL_COPY: 'Sao chép',
  LBL_PASTE: 'Dán',
  LBL_CUT: 'Cắt',
  LBL_MOVE: 'Di chuyển',
  LBL_RENAME: 'Đổi tên',
  LBL_DELETE: 'Xóa',
  LBL_DOWNLOAD: 'Tải về',
  LBL_REFRESH: 'Làm mới',
  LBL_RELOAD: 'Tải lại',
  LBL_HOME: 'Trang chủ',
  LBL_VIEW: 'Xem',
  LBL_HELP: 'Hướng dẫn',
  LBL_ABOUT: 'Thông tin',
  LBL_APPLICATION: 'Ứng dụng',
  LBL_APPLICATIONS: 'Các ứng dụng',
  LBL_KILL: 'Đóng',
  LBL_KILL_ALL: 'Đóng tất cả',
  LBL_MINIMIZE: 'Thu nhỏ',
  LBL_MAXIMIZE: 'Tối đa',
  LBL_RESTORE: 'Phục hồi',
  LBL_RAISE: 'Nâng lên',
  LBL_SHADE: 'Làm mở',
  LBL_UNSHADE: 'Bỏ làm mờ',
  LBL_ONTOP: 'Ở trên cùng',
  LBL_RESIZE: 'Thay đổi kích thước',
  LBL_BACK: 'Lùi',
  LBL_FORWARD: 'Tiến',
  LBL_UPLOAD: 'Tải lên',
  LBL_IMAGE: 'Ảnh'
};
