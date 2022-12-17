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
import Window from './window';
import VFSSearchAdapter from './adapters/search/vfs';
import createUI from './adapters/ui/search';

/**
 * Search Service
 */
export default class Search {
    /**
     * Create Search instance
     * @param {Core} core Core reference
     */
    constructor(core,options) {
        /**
         * Core instance reference
         * @type {Core}
         * @readonly
         */
        this.core = core;

        /**
         * Wired actions
         * @type {Object}
         */
        this.ui = null;

        /**
         * Last focused window
         * @type {Window}
         */
        this.focusLastWindow = null;

        /**
         * Search root DOM element
         * @type {Element}
         * @readonly
         */
        this.$element = document.createElement('div');
        const providedAdapters = options.adapters || [];
        const useAdapters = [VFSSearchAdapter, ...providedAdapters];
        this.adapters = useAdapters.map(A => new A(core));
    }

    /**
     * Destroy Search instance
     */
    async destroy() {
        if (this.ui) {
            this.ui.destroy();
        }
        await this.adapters.map(a => a.destroy());
    }

    /**
     * Initializes Search Service
     */
    async init() {
        const {icon} = this.core.make('osjs/theme');
        const _ = this.core.make('osjs/locale').translate;

        this.$element.className = 'osjs-search';
        this.core.$root.appendChild(this.$element);

        this.core.make('osjs/tray').create({
            title: _('LBL_SEARCH_TOOLTOP', 'F3'),
            icon: icon('system-search')
        }, () => this.show());

        this.ui = createUI(this.core, this.$element);
        this.ui.on('hide', () => this.hide());
        this.ui.on('open', iter => this.core.open(iter));
        this.ui.on('search', query => {
            this.search(query)
                .then(results => this.ui.emit('success', results))
                .catch(error => this.ui.emit('error', error));
        });
        await Promise.all(this.adapters.map(a => a.init()));
    }

    /**
     * Performs a search across all mounts
     * @param {string} pattern Search query
     * @return {Promise<FileMetadata[]>}
     */
    async search(pattern) {
        const results = await Promise.all(this.adapters.map(a => a.search(pattern)));
        return results.flat(1);
    }

    /**
     * Focuses UI
     */
    focus() {
        if (this.ui) {
            this.ui.emit('focus');
        }
    }

    /**
     * Hides UI
     */
    hide() {
        if (this.ui) {
            this.ui.emit('toggle', false);

            const win = Window.lastWindow();
            if (this.focusLastWindow && win) {
                win.focus();
            }
        }
    }

    /**
     * Shows UI
     */
    show() {
        if (this.ui) {
            const win = Window.lastWindow();

            this.focusLastWindow = win && win.blur();

            this.ui.emit('toggle', true);
            setTimeout(() => this.focus(), 1);
        }
    }
}
