/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
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
 * @author  Julien Gomes Dias <abld@abld.info>
 * @licence Simplified BSD License
 */

export const en_EN = {
  // Core
  ERR_REQUEST_STANDALONE: 'Impossible d\'effectuer des requêtes en mode autonome.',
  ERR_REQUEST_NOT_OK: 'Une erreur s\'est produite en exécutant une requête : {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Système de fichier \'{0}\' absent',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Système de fichier pour \'{0}\' absent',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Le système de fichier \'{0}\' n\'est pas encore monté',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Le système de fichier \'{0}\' est déjà monté',
  ERR_VFS_PATH_FORMAT_INVALID: 'Le dossier \'{0}\' ne correspond pas \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Les métadonnées du paquet \'{0}\' n\'ont pas été touvées',
  ERR_PACKAGE_LOAD: 'Package Loading \'{0}\' failed: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Durée d\'exécution du paquet \'{0}\' absente',
  ERR_PACKAGE_NO_METADATA: 'Métadonnée absentes pour \'{0}\'. Sont-elles dans le manifeste ?',
  ERR_PACKAGE_EXCEPTION: 'Une exception s\'est produite dans \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'La fénêtre avec l\'identifiant \'{0}\' existe déjà',
  ERR_INVALID_LOCALE: 'Paramètre de langue invalide \'{0}\'',
  LBL_CONNECTION_LOST: 'Connexion perdue',
  LBL_CONNECTION_LOST_MESSAGE: 'La connexion à OS.js a été perdue. Reconnexion...',
  LBL_CONNECTION_RESTORED: 'Connexion Restaurée',
  LBL_CONNECTION_RESTORED_MESSAGE: 'La connexion à OS.js a été restaurée.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Développement',
  LBL_APP_CAT_SCIENCE: 'Science',
  LBL_APP_CAT_GAMES: 'Jeux',
  LBL_APP_CAT_GRAPHICS: 'Graphisme',
  LBL_APP_CAT_NETWORK: 'Réseau',
  LBL_APP_CAT_MULTIMEDIA: 'Multimédia',
  LBL_APP_CAT_OFFICE: 'Bureautique',
  LBL_APP_CAT_SYSTEM: 'Système',
  LBL_APP_CAT_UTILITIES: 'Utilitaires',
  LBL_APP_CAT_OTHER: 'Autre',

  // UI
  LBL_LAUNCH_SELECT: 'Sélectionner l\'application',
  LBL_LAUNCH_SELECT_MESSAGE: 'Sélectionner l\'application pour \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Sélectionner le fond d\'écran',
  LBL_DESKTOP_SELECT_THEME: 'Sélectionner le thème',
  LBL_SEARCH_TOOLTOP: 'Recherche d\'un système de fichier ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Recherche des systèmes de fichiers...',
  LBL_SEARCH_WAIT: 'Recherche...',
  LBL_SEARCH_RESULT: 'Affichage des résultats {0}',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'En Haut',
  LBL_LEFT: 'À Gauche',
  LBL_RIGHT: 'À Droite',
  LBL_BOTTOM: 'En Bas',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Erreur',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Message',
  LBL_WARNINIG: 'Attention',
  LBL_SUCCESS: 'Succés',
  LBL_FAILURE: 'Échec',
  LBL_WINDOW: 'Fenêtre',
  LBL_WINDOWS: 'Fenêtres',
  LBL_NOTIFICATION: 'Notification',
  LBL_NOTIFICATIONS: 'Notifications',
  LBL_TRAY: 'Accès au plateau',
  LBL_NAME: 'Nom',
  LBL_TYPE: 'Type',
  LBL_SIZE: 'Taille',
  LBL_FILE: 'Fichier',
  LBL_NEW: 'Nouveau',
  LBL_OPEN: 'Ouvrir',
  LBL_SAVE: 'Sauvegarder',
  LBL_SAVEAS: 'Sauvegarder comme',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abandonner',
  LBL_CANCEL: 'Annuler',
  LBL_CLOSE: 'Fermer',
  LBL_QUIT: 'Quitter',
  LBL_YES: 'Oui',
  LBL_NO: 'Non',
  LBL_GO: 'C\'est parti !',
  LBL_MKDIR: 'Créer nouveau dossier',
  LBL_MKFILE: 'Créer nouveau fichier',
  LBL_COPY: 'Copier',
  LBL_PASTE: 'Coller',
  LBL_CUT: 'Couper',
  LBL_MOVE: 'Déplacer',
  LBL_RENAME: 'Renommer',
  LBL_DELETE: 'Supprimer',
  LBL_DOWNLOAD: 'Télécharger',
  LBL_REFRESH: 'Rafraichir',
  LBL_RELOAD: 'Recharger',
  LBL_HOME: 'Accueil',
  LBL_VIEW: 'Aperçu',
  LBL_HELP: 'Aide',
  LBL_ABOUT: 'À propos',
  LBL_APPLICATION: 'Application',
  LBL_APPLICATIONS: 'Applications',
  LBL_KILL: 'Tuer',
  LBL_KILL_ALL: 'Tuer tout'
};
