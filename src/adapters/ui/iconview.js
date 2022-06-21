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
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @license Simplified BSD License
 */
import {EventEmitter} from '@osjs/event-emitter';
import {h, app} from 'hyperapp';
import {doubleTap} from '../../utils/input';
import {pathJoin} from '../../utils/vfs';
import {invertHex} from '../../utils/colors';
import {isDroppingImage, validVfsDrop} from '../../utils/desktop';

const tapper = doubleTap();

const onDropAction = actions => (ev, data, files, shortcut = true) => {
  if (validVfsDrop(data)) {
    actions.addEntry({entry: data, shortcut});
  } else if (files.length > 0) {
    actions.uploadEntries(files);
  }
};

const createLabelComputer = (core) => (entry) => {
  const [metadata] = (entry.mime === 'osjs/application')
    ? core.make('osjs/packages').getPackages(pkg => (pkg.name === entry.filename)) : [];

  return entry.label || (metadata ? core.make('osjs/locale').translatableFlat(metadata.title) : entry.filename);
};

const isRootElement = ev =>
  ev.target && ev.target.classList.contains('osjs-desktop-iconview__wrapper');

const view = (computeLabel, fileIcon, themeIcon, droppable) => (state, actions) =>
  h('div', {
    class: 'osjs-desktop-iconview__wrapper',
    oncontextmenu: ev => {
      if (isRootElement(ev)) {
        actions.openContextMenu({ev});
      }
    },
    onclick: ev => {
      if (isRootElement(ev)) {
        actions.selectEntry({index: -1});
      }
    },
    oncreate: el => {
      droppable(el, {
        ondrop: (ev, data, files) => {
          const droppedImage = isDroppingImage(data);

          if (droppedImage || (ev.shiftKey && validVfsDrop(data))) {
            actions.openDropContextMenu({ev, data, files});
          } else {
            onDropAction(actions)(ev, data, files);
          }
        }
      });
    }
  }, state.entries.map((entry, index) => {
    return h('div', {
      class: 'osjs-desktop-iconview__entry' + (
        state.selected === index
          ? ' osjs-desktop-iconview__entry--selected'
          : ''
      ),
      oncontextmenu: ev => actions.openContextMenu({ev, entry, index}),
      ontouchstart: ev => tapper(ev, () => actions.openEntry({ev, entry, index})),
      ondblclick: ev => actions.openEntry({ev, entry, index}),
      onclick: ev => actions.selectEntry({ev, entry, index})
    }, [
      h('div', {
        class: 'osjs-desktop-iconview__entry__inner'
      }, [
        h('div', {
          class: 'osjs-desktop-iconview__entry__icon'
        }, [
          h('img', {
            src: entry.icon ? entry.icon : themeIcon(fileIcon(entry).name),
            class: 'osjs-desktop-iconview__entry__icon__icon'
          }),
          entry.shortcut !== false
            ? h('img', {
              src: themeIcon('emblem-symbolic-link'),
              class: 'osjs-desktop-iconview__entry__icon__shortcut'
            })
            : null
        ]),
        h('div', {
          class: 'osjs-desktop-iconview__entry__label'
        }, computeLabel(entry))
      ])
    ]);
  }));

const createShortcuts = (root, readfile, writefile) => {
  const read = () => {
    const filename = pathJoin(root, '.shortcuts.json');

    return readfile(filename)
      .then(contents => JSON.parse(contents))
      .catch(error => ([]));
  };

  const write = shortcuts => {
    const filename = pathJoin(root, '.shortcuts.json');
    const contents = JSON.stringify(shortcuts || []);

    return writefile(filename, contents)
      .catch(() => 0);
  };

  const add = entry => read(root)
    .then(shortcuts => ([...shortcuts, entry]))
    .then(write);

  const remove = index => read(root)
    .then(shortcuts => {
      shortcuts.splice(index, 1);
      return shortcuts;
    })
    .then(write);

  return {read, add, remove};
};

const readDesktopFolder = (root, readdir, shortcuts) => {
  const supressError = () => [];

  const read = () => readdir(root, {
    showHiddenFiles: false
  })
    .then(files => files.map(s => ({shortcut: false, ...s})))
    .catch(supressError);

  const readShortcuts = () => shortcuts.read()
    .then(shortcuts => shortcuts.map((s, index) => ({shortcut: index, ...s})))
    .catch(supressError);

  return () => {
    return Promise.all([readShortcuts(), read()])
      .then(results => [].concat(...results));
  };
};

/**
 * Desktop Icon View
 */
export class DesktopIconView extends EventEmitter {

  /**
   * @param {Core} core Core reference
   */
  constructor(core) {
    super('DesktopIconView');

    this.core = core;
    this.$root = null;
    this.iconview = null;
    this.root = 'home:/.desktop'; // Default path, changed later
  }

  destroy() {
    if (this.$root && this.$root.parentNode) {
      this.$root.remove();
    }

    this.iconview = null;
    this.$root = null;

    this.emit('destroy');

    super.destroy();
  }

  _render(root) {
    const oldRoot = this.root;
    if (root) {
      this.root = root;
    }

    if (this.$root) {
      if (this.root !== oldRoot) {
        this.iconview.reload();
      }

      return false;
    }

    return true;
  }

  render(root) {
    if (!this._render(root)) {
      return;
    }

    this.$root = document.createElement('div');
    this.$root.className = 'osjs-desktop-iconview';
    this.core.$contents.appendChild(this.$root);

    const {droppable} = this.core.make('osjs/dnd');
    const {icon: fileIcon} = this.core.make('osjs/fs');
    const {icon: themeIcon} = this.core.make('osjs/theme');
    const {copy, readdir, readfile, writefile, unlink, mkdir} = this.core.make('osjs/vfs');
    const error = err => console.error(err);
    const shortcuts = createShortcuts(root, readfile, writefile);
    const read = readDesktopFolder(root, readdir, shortcuts);
    const computeLabel = createLabelComputer(this.core);

    this.iconview = app({
      selected: -1,
      entries: []
    }, {
      setEntries: entries => ({entries}),

      openDropContextMenu: ({ev, data, files, droppedImage}) => {
        this.createDropContextMenu(ev, data, files, droppedImage);
      },

      openContextMenu: ({ev, entry, index}) => {
        if (entry) {
          this.createFileContextMenu(ev, entry);

          return {selected: index};
        } else {
          this.createRootContextMenu(ev);

          return {selected: -1};
        }
      },

      openEntry: ({entry, forceDialog}) => {
        if (entry.isDirectory) {
          this.core.run('FileManager', {
            path: entry
          });
        } else if (entry.mime === 'osjs/application') {
          this.core.run(entry.filename);
        } else {
          this.core.open(entry, {
            useDefault: true,
            forceDialog
          });
        }

        return {selected: -1};
      },

      selectEntry: ({index}) => ({selected: index}),

      uploadEntries: files => {
        // TODO
      },

      addEntry: ({entry, shortcut}) => (state, actions) => {
        const dest = `${root}/${entry.filename}`;

        mkdir(root)
          .catch(() => true)
          .then(() => {
            if (shortcut || entry.mime === 'osjs/application') {
              return shortcuts.add(entry);
            }

            return copy(entry, dest)
              .then(() => actions.reload(true))
              .catch(error);
          })
          .then(() => actions.reload(true));

        return {selected: -1};
      },

      removeEntry: entry => (state, actions) => {
        if (entry.shortcut !== false) {
          shortcuts.remove(entry.shortcut)
            .then(() => actions.reload(true))
            .catch(error);
        } else {
          unlink(entry)
            .then(() => actions.reload(true))
            .catch(error);
        }

        return {selected: -1};
      },

      reload: (fromUI) => (state, actions) => {
        if (fromUI && this.core.config('vfs.watch')) {
          return;
        }

        read()
          .then(entries => entries.filter(e => e.filename !== '..'))
          .then(entries => actions.setEntries(entries));
      }

    }, view(computeLabel, fileIcon, themeIcon, droppable), this.$root);

    this.applySettings();
    this.iconview.reload();
    this._createWatcher();

    this.core.on('osjs/settings:save', this.iconview.reload);
  }

  createFileContextMenu(ev, entry) {
    const _ = this.core.make('osjs/locale').translate;

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu: [{
        label: _('LBL_OPEN'),
        onclick: () => this.iconview.openEntry({entry, forceDialog: false})
      }, {
        label: _('LBL_OPEN_WITH'),
        onclick: () => this.iconview.openEntry({entry, forceDialog: true})
      }, {
        label: entry.shortcut !== false ? _('LBL_REMOVE_SHORTCUT') : _('LBL_DELETE'),
        onclick: () => this.iconview.removeEntry(entry)
      }]
    });
  }

  createDropContextMenu(ev, data, files) {
    const desktop = this.core.make('osjs/desktop');
    const _ = this.core.make('osjs/locale').translate;

    const action = shortcut => onDropAction(this.iconview)(ev, data, files, shortcut);

    const menu = [{
      label: _('LBL_COPY'),
      onclick: () => action(false)
    }, {
      label: _('LBL_CREATE_SHORTCUT'),
      onclick: () => action(true)
    }, ...desktop.createDropContextMenu(data)];

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu
    });
  }

  createRootContextMenu(ev) {
    this.core.make('osjs/desktop')
      .openContextMenu(ev);
  }

  _createWatcher() {
    const listener = (args) => {
      const currentPath = String(this.root).replace(/\/$/, '');
      const watchPath = String(args.path).replace(/\/$/, '');
      if (currentPath === watchPath) {
        this.iconview.reload();
      }
    };

    this.core.on('osjs/vfs:directoryChanged', listener);
    this.on('destroy', () => this.core.off('osjs/vfs:directoryChanged', listener));
  }

  applySettings() {
    if (!this.$root) {
      return;
    }

    const settings = this.core
      .make('osjs/settings');

    const defaults = this.core
      .config('desktop.settings');

    const fontColorStyle = settings
      .get('osjs/desktop', 'iconview.fontColorStyle', defaults.iconview.fontColorStyle);

    const fontColor = settings
      .get('osjs/desktop', 'iconview.fontColor', '#ffffff', defaults.iconview.fontColor);

    const backgroundColor = settings
      .get('osjs/desktop', 'background.color', defaults.background.color);

    const styles = {
      system: 'inherit',
      invert: invertHex(backgroundColor),
      custom: fontColor
    };

    this.$root.style.color = styles[fontColorStyle];
  }
}
