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
 * @author  lijun <lijun_ay@126.com>
 * @licence Simplified BSD License
 */

export const zh_CN = {
  // Core
  ERR_REQUEST_STANDALONE: '无法在独立模式下发出请求。',
  ERR_REQUEST_NOT_OK: '执行请求时发生错误：{0}',
  ERR_VFS_MOUNT_NOT_FOUND: '找不到文件系统 \'{0}\' ',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: '找不到\'{0}\'的文件系统',
  ERR_VFS_MOUNT_NOT_MOUNTED: '文件系统 \'{0}\' 未挂载',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: '文件系统 \'{0}\' 已挂载',
  ERR_VFS_PATH_FORMAT_INVALID: '给定路径\'{0}\'与\'name:/path\'不匹配',
  ERR_PACKAGE_NOT_FOUND: '未找到包的元数据\'{0}\'',
  ERR_PACKAGE_LOAD: '加载包 \'{0}\' 失败： {1}',
  ERR_PACKAGE_NO_RUNTIME: '未找到运行包 \'{0}\' ',
  ERR_PACKAGE_NO_METADATA: '找不到 \'{0}\' 的元数据。它在清单（manifest）中吗？',
  ERR_PACKAGE_EXCEPTION: '\'{0}\'发生异常',
  ERR_WINDOW_ID_EXISTS: 'ID为\'{0}\'的窗口已存在',
  ERR_INVALID_LOCALE: '无效的区域设置 \'{0}\'',
  LBL_CONNECTION_LOST: '连接丢失',
  LBL_CONNECTION_LOST_MESSAGE: '与OS.js的连接丢失了。重新连接....',
  LBL_CONNECTION_RESTORED: '连接已恢复',
  LBL_CONNECTION_RESTORED_MESSAGE: '已恢复与OS.js服务器的连接。',
  LBL_CONNECTION_FAILED: '连接失败',
  LBL_CONNECTION_FAILED_MESSAGE: '无法建立与OS.js的连接。 某些功能可能无法正常工作。',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: '开发',
  LBL_APP_CAT_SCIENCE: '科学',
  LBL_APP_CAT_GAMES: '游戏',
  LBL_APP_CAT_GRAPHICS: '图像',
  LBL_APP_CAT_NETWORK: '网络',
  LBL_APP_CAT_MULTIMEDIA: '媒体',
  LBL_APP_CAT_OFFICE: '办公',
  LBL_APP_CAT_SYSTEM: '系统',
  LBL_APP_CAT_UTILITIES: '工具',
  LBL_APP_CAT_OTHER: '其他',

  // UI
  LBL_LAUNCH_SELECT: '选择应用程序',
  LBL_LAUNCH_SELECT_MESSAGE: '选择\'{0}\'的应用程序',
  LBL_DESKTOP_SELECT_WALLPAPER: '选择壁纸',
  LBL_DESKTOP_SELECT_THEME: '选择主题',
  LBL_SEARCH_TOOLTOP: '搜索文件系统 ({0})',
  LBL_SEARCH_PLACEHOLDER: '搜索文件系统...',
  LBL_SEARCH_WAIT: '搜索...',
  LBL_SEARCH_RESULT: '显示{0}个结果',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KB',
  LBL_FS_MIB: 'MB',
  LBL_FS_GIB: 'GB',

  // Generic
  LBL_TOP: '上',
  LBL_LEFT: '左',
  LBL_RIGHT: '右',
  LBL_BOTTOM: '下',
  LBL_MENU: '菜单',
  LBL_ERROR: '错误',
  LBL_INFO: '信息',
  LBL_MESSAGE: '消息',
  LBL_WARNINIG: '警告',
  LBL_SUCCESS: '成功',
  LBL_FAILURE: '失败',
  LBL_WINDOW: '窗口',
  LBL_WINDOWS: '窗口',
  LBL_NOTIFICATION: '通知',
  LBL_NOTIFICATIONS: '通知',
  LBL_TRAY: '托盘',
  LBL_NAME: '名称',
  LBL_TYPE: '类型',
  LBL_SIZE: '大小',
  LBL_FILE: '文件',
  LBL_NEW: '新建',
  LBL_OPEN: '打开',
  LBL_SAVE: '保存',
  LBL_SAVEAS: '另存为',
  LBL_OK: '确定',
  LBL_ABORT: '中止',
  LBL_CANCEL: '取消',
  LBL_CLOSE: '关闭',
  LBL_QUIT: '退出',
  LBL_YES: '是',
  LBL_NO: '否',
  LBL_GO: '进行',
  LBL_MKDIR: '创建新目录',
  LBL_MKFILE: '创建新文件',
  LBL_COPY: '复制',
  LBL_PASTE: '粘贴',
  LBL_CUT: '剪切',
  LBL_MOVE: '移动',
  LBL_RENAME: '重命名',
  LBL_DELETE: '删除',
  LBL_DOWNLOAD: '下载',
  LBL_REFRESH: '刷新',
  LBL_RELOAD: '刷新',
  LBL_HOME: '主页',
  LBL_VIEW: '视图',
  LBL_HELP: '帮助',
  LBL_ABOUT: '关于',
  LBL_APPLICATION: '应用程序',
  LBL_APPLICATIONS: '应用程序',
  LBL_KILL: '杀死',
  LBL_KILL_ALL: '全部杀死',
  LBL_MINIMIZE: '最小化',
  LBL_MAXIMIZE: '最大化',
  LBL_RESTORE: '恢复',
  LBL_RAISE: '上浮',
  LBL_SHADE: '置后',
  LBL_UNSHADE: '置前',
  LBL_ONTOP: '顶端',
  LBL_RESIZE: '调整',
  LBL_BACK: '后退',
  LBL_FORWARD: '前进',
  LBL_UPLOAD: '上传',
  LBL_IMAGE: '图像'
};
