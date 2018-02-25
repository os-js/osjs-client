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

import {app, h} from 'hyperapp';
import EventHandler from '../event-handler';

/**
 * OS.js Panel Item
 * @see {Panel}
 */
export default class PanelItem extends EventHandler {

  /**
   * Create panel item
   *
   * @param {Core} core Core reference
   * @param {Panel} panel Panel reference
   * @param {Object} options Options
   */
  constructor(core, panel, options = {}) {
    super('Panel');

    this.core = core;
    this.panel = panel;
    this.options = options;
    this.state = {};
    this.actions = {};
    this.inited = false;
  }

  /**
   * Destroy panel item
   */
  destroy() {
    this.emit('destroy', this);
  }

  /**
   * Initializes panel item
   * @param {Object} state State
   * @param {Object} actions Actions
   * @return {Object} Bound actions
   */
  init(state = {}, actions = {}) {
    if (this.inited) {
      return false;
    }

    this.inited = true;
    this.emit('init', this);

    return app(state, actions, (state, actions) => {
      return this.render(state, actions);
    }, this.panel.$element);
  }

  /**
   * Renders the panel item
   * @param {String} name The panel item virtual name
   * @param {Object[]} children The panel item children
   * @return {Node} A *virtual* node
   */
  render(name, children = []) {
    return h('div', {
      className: 'osjs-panel-item',
      'data-name': name
    }, children);
  }

}
