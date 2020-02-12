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
 * @author  Matheus Felipe <matheusfelipeog@gmail.com>
 * @licence Simplified BSD License
 */

export const pt_BR = {
  // Core
  ERR_REQUEST_STANDALONE: 'Não é possível fazer solicitações autônomas.',
  ERR_REQUEST_NOT_OK: 'Ocorreu um erro ao executar a solicitação: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Sistema de arquivo \'{0}\' não encontrado',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Sistema de arquivo não encontrado para \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Sistema de arquivo \'{0}\' não montado',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Sistema de arquivo \'{0}\' já montado',
  ERR_VFS_PATH_FORMAT_INVALID: 'O caminho especificado \'{0}\' não corresponde \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Metadados do pacote \'{0}\' não encontrados',
  ERR_PACKAGE_LOAD: 'Carregamento do pacote \'{0}\' falhou: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Tempo de execução do pacote \'{0}\' não encontrado',
  ERR_PACKAGE_NO_METADATA: 'Metadados não encontrado para \'{0}\'. Está no manifesto?',
  ERR_PACKAGE_EXCEPTION: 'Ocorreu uma exceção em \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Janela com ID \'{0}\' Já existe',
  ERR_INVALID_LOCALE: 'Código de idioma inválido \'{0}\'',
  LBL_CONNECTION_LOST: 'Conexão perdida',
  LBL_CONNECTION_LOST_MESSAGE: 'A conexão com OS.js foi perdida. Reconectando....',
  LBL_CONNECTION_RESTORED: 'Conexão restaurada',
  LBL_CONNECTION_RESTORED_MESSAGE: 'A conexão com o servidor OS.js foi restaurada.',
  LBL_CONNECTION_FAILED: 'Falha na conexão',
  LBL_CONNECTION_FAILED_MESSAGE: 'A conexão com OS.js não pode ser estabelecida. Alguns recursos podem não funcionar corretamente.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Desenvolvimento',
  LBL_APP_CAT_SCIENCE: 'Ciência',
  LBL_APP_CAT_GAMES: 'Jogos',
  LBL_APP_CAT_GRAPHICS: 'Grâfico',
  LBL_APP_CAT_NETWORK: 'Rede',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Escritório',
  LBL_APP_CAT_SYSTEM: 'Sistema',
  LBL_APP_CAT_UTILITIES: 'Utilidades',
  LBL_APP_CAT_OTHER: 'Outros',

  // UI
  LBL_LAUNCH_SELECT: 'Selecionar aplicativo',
  LBL_LAUNCH_SELECT_MESSAGE: 'Selecionar aplicativo para \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Selecionar papel de parede',
  LBL_DESKTOP_SELECT_THEME: 'Selecionar tema',
  LBL_SEARCH_TOOLTOP: 'Pesquisar no sistema de arquivos ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Pesquisar...',
  LBL_SEARCH_WAIT: 'Buscando...',
  LBL_SEARCH_RESULT: 'Mostrando {0} resultados',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Topo',
  LBL_LEFT: 'Esquerda',
  LBL_RIGHT: 'Direita',
  LBL_BOTTOM: 'Inferior',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Erro',
  LBL_INFO: 'Informação',
  LBL_MESSAGE: 'Mensagem',
  LBL_WARNINIG: 'Atenção',
  LBL_SUCCESS: 'Sucesso',
  LBL_FAILURE: 'Falha',
  LBL_WINDOW: 'Janela',
  LBL_WINDOWS: 'Janelas',
  LBL_NOTIFICATION: 'Notificação',
  LBL_NOTIFICATIONS: 'Notificações',
  LBL_TRAY: 'Entrada',
  LBL_NAME: 'Nome',
  LBL_TYPE: 'Tipo',
  LBL_SIZE: 'Tamanho',
  LBL_FILE: 'Arquivo',
  LBL_NEW: 'Novo',
  LBL_OPEN: 'Abrir',
  LBL_OPEN_WITH: 'Abrir com...',
  LBL_SAVE: 'Salvar',
  LBL_SAVEAS: 'Salvar como',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abortar',
  LBL_CANCEL: 'Cancelar',
  LBL_CLOSE: 'Fechar',
  LBL_QUIT: 'Sair',
  LBL_YES: 'Sim',
  LBL_NO: 'Não',
  LBL_GO: 'Ir',
  LBL_MKDIR: 'Criar novo diretório',
  LBL_MKFILE: 'Criar novo arquivo',
  LBL_COPY: 'Copiar',
  LBL_PASTE: 'Colar',
  LBL_CUT: 'Recortar',
  LBL_MOVE: 'Mover',
  LBL_RENAME: 'Renomear',
  LBL_DELETE: 'Deletar',
  LBL_DOWNLOAD: 'Download',
  LBL_REFRESH: 'Atualizar',
  LBL_RELOAD: 'Recarregar',
  LBL_HOME: 'Home',
  LBL_VIEW: 'Visualização',
  LBL_HELP: 'Ajuda',
  LBL_ABOUT: 'Sobre',
  LBL_APPLICATION: 'Aplicativo',
  LBL_APPLICATIONS: 'Aplicativos',
  LBL_KILL: 'Finalizar',
  LBL_KILL_ALL: 'Finalizar tudo',
  LBL_MINIMIZE: 'Minimizar',
  LBL_MAXIMIZE: 'Maximizar',
  LBL_RESTORE: 'Restaurar',
  LBL_RAISE: 'Levantar',
  LBL_SHADE: 'Sombra',
  LBL_UNSHADE: 'Tirar sombra',
  LBL_ONTOP: 'No topo',
  LBL_RESIZE: 'Redimensionar',
  LBL_BACK: 'Voltar',
  LBL_FORWARD: 'Avançar',
  LBL_UPLOAD: 'Enviar',
  LBL_IMAGE: 'Imagem',
  LBL_CREATE_SHORTCUT: 'Criar atalho',
  LBL_REMOVE_SHORTCUT: 'Remover atalho',
  LBL_EDIT: 'Editar'
};
