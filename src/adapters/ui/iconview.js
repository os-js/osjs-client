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
import {EventEmitter} from '@osjs/event-emitter';
import {h, app} from 'hyperapp';
import {draggable, droppable} from '../../utils/dnd';
import {emToPx} from '../../utils/dom';
import {doubleTap} from '../../utils/input';
import {pathJoin} from '../../utils/vfs';

const tapper = doubleTap();

//
// FIXME: Excessive render on drop events
//

// TODO: Needs real values
const ICON_WIDTH = 5.0; // ems
const ICON_HEIGHT = 6.5; // ems
const ICON_MARGIN = 0.5; // ems

const validVfsDrop = data => data && data.path;
const validInternalDrop = data => data && data.internal;

// TODO: Use internal storage
const loadIconPositions = () => JSON.parse(
  localStorage.getItem('___osjs_iconview_positions') || '[]'
);

// TODO: Use internal storage
const saveIconPositions = positions =>
  localStorage.setItem('___osjs_iconview_positions', JSON.stringify(positions || []));

const onDropAction = actions => (ev, data, files, shortcut = true) => {
  if (validVfsDrop(data)) {
    actions.addEntry({entry: data, shortcut, ev});
  } else if(validInternalDrop(data)) {
    actions.moveEntry({entry: data.internal, ev});
  } else if (files.length > 0) {
    actions.uploadEntries(files);
  }
};

const isRootElement = ev =>
  ev.target && ev.target.classList.contains('osjs-desktop-iconview__wrapper');

const calculateGridSizes = el => {
  const {offsetWidth, offsetHeight} = el;
  // TODO: Might cause reflow, do cache here
  const sizeX = emToPx(ICON_WIDTH) + (emToPx(ICON_MARGIN) * 2);
  const sizeY = emToPx(ICON_HEIGHT) + (emToPx(ICON_MARGIN) * 2);
  const cols = Math.floor(offsetWidth / sizeX);
  const rows = Math.floor(offsetHeight / sizeY);
  return [rows, cols, sizeX, sizeY];
};

const calculateIconPositions = (entries, positions, cols) => {
  const savedPositions = entries.map(entry => {
    const key = entry.shortcut === false ? entry.filename : entry.shortcut;
    const found = positions.findIndex(s => s.key === key);
    return found === -1 ? undefined : positions[found].position;
  });

  return entries.map((entry, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);
    const _position = savedPositions[index] || [x, y];

    return Object.assign(entry, {_position});
  });
};

const isIconPositionBusy = (ev, {entries, grid: {sizeX, sizeY}}) => {
  const col = Math.floor(ev.clientX / sizeX);
  const row = Math.floor(ev.clientY / sizeY);

  return entries.findIndex(e => {
    return e._position[0] === col &&
      e._position[1] === row;
  }) !== -1;
};

const createIconStyle = (entry, index, {grid: {enabled, sizeX, sizeY}}) => {
  const [left, top] = entry._position || [0, 0];

  return enabled ? {
    position: 'absolute',
    top: String(top * sizeY) + 'px',
    left: String(left * sizeX) + 'px'
  } : {};
};

const createGhostStyle = ({ghost, grid: {enabled, sizeX, sizeY}}) => {
  const style = {};
  if (ghost instanceof Event) {
    const col = Math.floor(ghost.clientX / sizeX);
    const row = Math.floor(ghost.clientY / sizeY);
    style.top = String(row * sizeY) + 'px';
    style.left = String(col * sizeX) + 'px';
  }

  return Object.assign({
    position: enabled ? 'absolute' : undefined,
    display: ghost ? undefined : 'none'
  }, style);
};

const view = (fileIcon, themeIcon, droppable) => (state, actions) =>
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
          if (ev.shiftKey && validVfsDrop(data)) {
            actions.openDropContextMenu({ev, data, files});
          } else {
            onDropAction(actions)(ev, data, files);
          }

          actions.setGhost(false);
        },

        ondragleave: () => actions.setGhost(false),
        ondragenter: () => actions.setGhost(true),
        ondragover: ev => actions.setGhost(ev)
      });
    }
  }, [
    ...state.entries.map((entry, index) => {
      return h('div', {
        style: createIconStyle(entry, index, state),
        class: 'osjs-desktop-iconview__entry' + (
          state.selected === index
            ? ' osjs-desktop-iconview__entry--selected'
            : ''
        ),
        oncontextmenu: ev => actions.openContextMenu({ev, entry, index}),
        ontouchstart: ev => tapper(ev, () => actions.openEntry({ev, entry, index})),
        ondblclick: ev => actions.openEntry({ev, entry, index}),
        onclick: ev => actions.selectEntry({ev, entry, index}),
        oncreate: el => {
          draggable(el, {
            data: {internal: entry}
          });
        }
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
          }, entry.filename)
        ])
      ]);
    }),
    h('div', {
      class: 'osjs-desktop-iconview__entry osjs-desktop-iconview__entry--ghost',
      style: createGhostStyle(state)
    })
  ]);

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
  const read = () => readdir(root, {
    showHiddenFiles: false
  })
    .then(files => files.map(s => Object.assign({shortcut: false}, s)));

  const readShortcuts = () => shortcuts.read()
    .then(shortcuts => shortcuts.map((s, index) => Object.assign({shortcut: index}, s)));

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
    this.root = 'home:/.desktop';
  }

  destroy() {
    if (this.$root && this.$root.parentNode) {
      this.$root.parentNode.removeChild(this.$root);
    }

    this.iconview = null;
    this.$root = null;

    this.emit('destroy');
  }

  /**
   * @param {object} rect Rectangle from desktop
   */
  resize(rect) {
    if (!this.$root) {
      return;
    }

    this.$root.style.top = `${rect.top}px`;
    this.$root.style.left = `${rect.left}px`;
    this.$root.style.bottom = `${rect.bottom}px`;
    this.$root.style.right = `${rect.right}px`;

    if (this.iconview) {
      this.iconview.resize();
    }
  }

  _render(settings) {
    const oldRoot = this.root;
    if (settings.path) {
      this.root = settings.path;
    }

    if (this.$root) {
      if (this.root !== oldRoot) {
        this.iconview.reload();
      }

      this.iconview.toggleGrid(settings.grid);

      return false;
    }

    return true;
  }

  render(settings) {
    if (!this._render(settings)) {
      return;
    }

    this.$root = document.createElement('div');
    this.$root.className = 'osjs-desktop-iconview';
    this.core.$root.appendChild(this.$root);

    const root = settings.path;
    const {icon: fileIcon} = this.core.make('osjs/fs');
    const {icon: themeIcon} = this.core.make('osjs/theme');
    const {copy, readdir, readfile, writefile, unlink, mkdir} = this.core.make('osjs/vfs');
    const error = err => console.error(err);
    const shortcuts = createShortcuts(root, readfile, writefile);
    const read = readDesktopFolder(root, readdir, shortcuts);

    const [rows, cols, sizeX, sizeY] = calculateGridSizes(this.$root);

    this.iconview = app({
      selected: -1,
      entries: [],
      positions: loadIconPositions(),
      ghost: false,
      grid: {
        enabled: settings.grid,
        rows,
        cols,
        sizeX,
        sizeY
      }
    }, {
      setEntries: entries => state => {
        return {entries: calculateIconPositions(entries, state.positions, state.grid.cols)};
      },

      openDropContextMenu: ({ev, data, files}) => {
        this.createDropContextMenu(ev, data, files);
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

      addEntry: ({entry, shortcut, ev}) => (state, actions) => {
        const dest = `${root}/${entry.filename}`;

        mkdir(root)
          .catch(() => true)
          .then(() => {
            if (shortcut || entry.mime === 'osjs/application') {
              return shortcuts.add(entry);
            }

            return copy(entry, dest)
              .then(() => actions.reload())
              .catch(error);
          })
          .then(() => actions.reload());

        return {selected: -1};
      },

      removeEntry: entry => (state, actions) => {
        if (entry.shortcut !== false) {
          shortcuts.remove(entry.shortcut)
            .then(() => actions.reload())
            .catch(error);
        } else {
          unlink(entry)
            .then(() => actions.reload())
            .catch(error);
        }

        return {selected: -1};
      },

      moveEntry: ({entry, ev}) => (state) => {
        if (!isIconPositionBusy(ev, state)) {
          const positions = state.positions;
          const key = entry.shortcut === false ? entry.filename : entry.shortcut;
          const found = positions.findIndex(s => s.key === key);
          const col = Math.floor(ev.clientX / sizeX);
          const row = Math.floor(ev.clientY / sizeY);
          const position = [col, row];
          const value = {key, position};

          if (found !== -1) {
            positions[found] = value;
          } else {
            positions.push(value);
          }

          saveIconPositions(positions);

          return {
            positions,
            entries: calculateIconPositions(state.entries, positions, state.cols)
          };
        }
        return {};
      },

      reload: () => (state, actions) => {
        read()
          .then(entries => entries.filter(e => e.filename !== '..'))
          .then(entries => actions.setEntries(entries));
      },

      resize: () => ({grid: {enabled}}) => {
        const [rows, cols, sizeX, sizeY] = calculateGridSizes(this.$root);
        return {grid: {enabled, rows, cols, sizeX, sizeY}};
      },

      toggleGrid: enabled => ({grid}) => {
        return {grid: Object.assign(grid, {enabled})};
      },

      setGhost: ev => {
        return {ghost: ev};
      }
    }, view(fileIcon, themeIcon, droppable), this.$root);

    this.iconview.reload();
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
    const _ = this.core.make('osjs/locale').translate;

    const action = shortcut => onDropAction(this.iconview)(ev, data, files, shortcut);

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu: [{
        label: _('LBL_COPY'),
        onclick: () => action(false)
      }, {
        label: _('LBL_CREATE_SHORTCUT'),
        onclick: () => action(true)
      }]
    });
  }

  createRootContextMenu(ev) {
    this.core.make('osjs/desktop')
      .openContextMenu(ev);
  }
}
