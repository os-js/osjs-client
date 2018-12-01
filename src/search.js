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
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
import {h, app} from 'hyperapp';
import Window from './window';

export default class Search {
  constructor(core) {
    this.core = core;
    this.$element = document.createElement('div');
    this.app = null;
    this.focusLastWindow = null;
  }

  destroy() {

  }

  init() {
    const {icon} = this.core.make('osjs/theme');
    const _ = this.core.make('osjs/locale').translate;

    this.core.make('osjs/tray').create({
      title: _('LBL_SEARCH_TOOLTOP', 'F3'),
      icon: icon('system-search.png')
    }, ev => this.show());

    this.$element.className = 'osjs-search';
    this.core.$root.appendChild(this.$element);
    this.createApp();
  }

  search(pattern) {
    const vfs = this.core.make('osjs/vfs');
    const promises = this.core.make('osjs/fs')
      .mountpoints()
      .map(mount => `${mount.name}:/`)
      .map(path => {
        return vfs.search({path}, pattern)
          .catch(error => {
            console.warn(error);
            return [];
          });
      });

    return Promise.all(promises)
      .then(lists => [].concat(...lists));
  }

  createApp() {
    const fs = this.core.make('osjs/fs');
    const {icon} = this.core.make('osjs/theme');
    const _ = this.core.make('osjs/locale').translate;

    const resultView = ({results, index}, actions) => results.map((r, i) => h('li', {
      onclick: () => actions.open(i),
      onupdate: el => {
        if (i === index) {
          el.scrollIntoView();
        }
      },
      class: [
        'osjs-search-result',
        index === i ? 'osjs__active' : ''
      ].join(' ')
    }, [
      h('img', {src: icon(fs.icon(r).name + '.png')}),
      h('span', {}, `${r.path} (${r.mime})`)
    ]));

    const view = (state, actions) => h('div', {
      class: 'osjs-search-container osjs-notification',
      style: {
        display: state.visible ? undefined : 'none'
      }
    }, [
      h('input', {
        type: 'text',
        placeholder: _('LBL_SEARCH_PLACEHOLDER'),
        class: 'osjs-search-input',
        value: state.query,
        onblur: () => actions.toggle(false),
        oninput: ev => actions.setQuery(ev.target.value),
        onkeydown: ev => {
          if (ev.keyCode === 38) { // Up
            actions.setPreviousIndex();
          } else if (ev.keyCode === 40) { // Down
            actions.setNextIndex();
          } else if (ev.keyCode === 27) { // Escape
            actions.resetIndex();

            if (state.index === -1) {
              this.hide();
            }
          }
        },
        onkeypress: ev => {
          if (ev.keyCode === 13) {
            if (state.index >= 0) {
              actions.open(state.index);
            } else {
              actions.search(state.query.replace(/\*?$/, '*').replace(/^\*?/, '*'));
            }
          }
        }
      }),
      h('div', {
        'data-error': !!state.error,
        class: 'osjs-search-message',
        style: {
          display: (state.error || state.status) ? 'block' : 'none'
        }
      }, state.error || state.status),
      h('ol', {
        class: 'osjs-search-results'
      }, resultView(state, actions))
    ]);

    this.searchUI = app({
      query: '',
      index: -1,
      status: undefined,
      error: null,
      visible: false,
      results: []
    }, {
      search: query => (state, actions) => {
        this.search(query)
          .then(results => actions.setResults(results))
          .catch(error => actions.setError(error));

        return {status: _('LBL_SEARCH_WAIT')};
      },
      open: index => (state, actions) => {
        const iter = state.results[index];
        if (iter) {
          this.core.open(iter);
        }

        actions.toggle(false);
      },
      resetIndex: () => () => ({
        index: -1
      }),
      setNextIndex: () => state => ({
        index: (state.index + 1) % state.results.length
      }),
      setPreviousIndex: () => state => ({
        index: state.index <= 0 ? state.results.length - 1 : state.index - 1
      }),
      setError: error => () => ({
        error,
        status: undefined,
        index: -1
      }),
      setResults: results => () => ({
        results,
        index: -1,
        status: _('LBL_SEARCH_RESULT', results.length),
      }),
      setQuery: query => () => ({
        query
      }),
      toggle: visible => state => ({
        query: '',
        results: [],
        index: -1,
        status: undefined,
        error: null,
        visible: typeof visible === 'boolean' ? visible : !state.visible
      })
    }, view, this.$element);
  }

  focus() {
    const el = this.$element.querySelector('.osjs-search-input');
    if (el) {
      el.focus();
    }
  }

  hide() {
    if (this.searchUI) {
      this.searchUI.toggle(false);

      const win = Window.lastWindow();
      if (this.focusLastWindow && win) {
        win.focus();
      }
    }
  }

  show() {
    if (this.searchUI) {
      const win = Window.lastWindow();

      this.focusLastWindow = win && win.blur();

      this.searchUI.toggle(true);
      setTimeout(() => this.focus(), 1);
    }
  }
}
