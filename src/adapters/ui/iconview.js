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
import {doubleTap} from '../../utils/input';

const tapper = doubleTap();

const view = (fileIcon, themeIcon, droppable) => (state, actions) =>
  h('div', {
    class: 'osjs-desktop-iconview__wrapper',
    oncontextmenu: ev => actions.openContextMenu({ev}),
    oncreate: el => {
      droppable(el, {
        ondrop: (ev, data, files) => {
          if (data && data.path) {
            actions.addEntry(data);
          } else if (files.length > 0) {
            actions.uploadEntries(files);
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
        }, h('img', {
          src: themeIcon(fileIcon(entry).name)
        })),
        h('div', {
          class: 'osjs-desktop-iconview__entry__label'
        }, entry.filename)
      ])
    ]);
  }));

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
    this.core.$root.appendChild(this.$root);

    const {droppable} = this.core.make('osjs/dnd');
    const {icon: fileIcon} = this.core.make('osjs/fs');
    const {icon: themeIcon} = this.core.make('osjs/theme');
    const {copy, readdir, unlink} = this.core.make('osjs/vfs');
    const error = err => console.error(err);

    this.iconview = app({
      selected: -1,
      entries: []
    }, {
      setEntries: entries => ({entries}),

      openContextMenu: ({ev, entry}) => {
        if (entry) {
          this.createFileContextMenu(ev, entry);
        }
      },

      openEntry: ({entry, forceDialog}) => {
        if (entry.isDirectory) {
          this.core.run('FileManager', {
            path: entry
          });
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

      addEntry: entry => (state, actions) => {
        const dest = `${root}/${entry.filename}`;

        copy(entry, dest)
          .then(() => actions.reload())
          .catch(error);

        return {selected: -1};
      },

      removeEntry: entry => (state, actions) => {
        unlink(entry)
          .then(() => actions.reload())
          .catch(error);

        return {selected: -1};
      },

      reload: () => (state, actions) => {
        readdir(root)
          .then(entries => entries.filter(e => e.filename !== '..'))
          .then(entries => actions.setEntries(entries));
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
        label: _('LBL_DELETE'),
        onclick: () => this.iconview.removeEntry(entry)
      }]
    });
  }
}
