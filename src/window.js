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
import EventHandler from './event-handler';
import WindowBehavior from './window-behavior';

const MINIMUM_WIDTH = 100;
const MINIMUM_HEIGHT = 100;

let windows = [];
let windowCount = 0;
let nextZindex = 1;
let lastWindow = null;

/*
 * Sets attributes on a DOM element
 */
const setDataAttributes = (el, obj) => Object.keys(obj)
  .filter(k => typeof obj[k] !== 'object')
  .forEach((k) => el.setAttribute('data-' + k, String(obj[k])));

/*
 * Serialize an object to CSS
 */
const createCssText = (obj) => Object.keys(obj)
  .map(k => [k, k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()])
  .map(k => `${k[1]}: ${obj[k[0]]}`)
  .join(';');

/*
 * Creates window attributes from an object
 */
const createAttributes = (attrs) => Object.assign({
  classNames: [],
  gravity: false,
  resizable: true,
  focusable: true,
  maximizable: true,
  minimizable: true,
  minDimension: {
    width: MINIMUM_WIDTH,
    height: MINIMUM_HEIGHT
  },
  maxDimension: {
    width: -1,
    height: -1
  }
}, attrs);

/*
 * Creates window state from an object
 */
const createState = (state, options) => Object.assign({
  title: options.title || options.id,
  icon: require('./styles/logo-blue-32x32.png'),
  moving: false,
  resizing: false,
  loading: false,
  focused: false,
  maximized: false,
  minimized: false,
  ontop: false,
  modal: false,
  zIndex: 1,
  styles: {},
  position: {
    left: 0,
    top: 0
  },
  dimension: {
    width: MINIMUM_WIDTH,
    height: MINIMUM_HEIGHT
  }
}, state);

/*
 * Creates a window id
 */
const createWindowId = (win) => {
  const id = windowCount;
  windowCount++;
  windows.push(win);
  return id;
};

/*
 * Escape HTML
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent;
};

/*
 * Default window template
 */
const TEMPLATE = `<div class="osjs-window-inner">
  <div class="osjs-window-header">
    <div class="osjs-window-icon">
      <div></div>
    </div>
    <div class="osjs-window-title"></div>
    <div class="osjs-window-button" data-action="minimize">
      <div></div>
    </div>
    <div class="osjs-window-button" data-action="maximize">
      <div></div>
    </div>
    <div class="osjs-window-button" data-action="close">
      <div></div>
    </div>
  </div>
  <div class="osjs-window-content">
  </div>
  <div class="osjs-window-resize">
  </div>
</div>`.replace(/\n\s+/g, '').trim();

/**
 * OS.js Window
 */
export default class Window extends EventHandler {

  /**
   * Create window
   *
   * @param {Core} core Core reference
   * @param {Object} options Options
   * @param {String} options.id Window Id (not globaly unique)
   * @param {Window} options.parent The parent Window reference
   * @param {Object} options.attributes Window attributes
   * @param {Object} options.state Window state
   * @param {WindowBehavior} options.behavior Window behavior
   */
  constructor(core, options = {}) {
    options = Object.assign({
      id: null,
      title: null,
      parent: null,
      attributes: {},
      state: {}
    }, options);

    console.log('Window::constructor()', options);

    super('Window@' + options.id);

    /**
     * The Window ID
     * @type {String}
     */
    this.id = options.id;

    /**
     * The Window ID
     * @type {Number}
     */
    this.wid = createWindowId(this);

    /**
     * Parent Window reference
     * @type {Window}
     */
    this.parent = options.parent;

    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * The window behavior
     * @type {WindowBehavior}
     */
    this.behavior = options.behavior || new WindowBehavior(core, this);

    /**
     * The window destruction state
     * @type {Boolean}
     */
    this.destroyed = false;

    /**
     * The window attributes
     * @type {Object}
     */
    this.attributes = createAttributes(options.attributes);

    /**
     * The window state
     * @type {Object}
     */
    this.state = createState(options.state, options);

    /**
     * The window container
     * @type {Node}
     */
    this.$element = document.createElement('div');

    /**
     * The content container
     * @type {Node}
     */
    this.$content = null;

    this.core.emit('osjs/window:create', this);
  }

  /**
   * Destroy window
   */
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    console.debug('Window::destroy()');

    this.emit('destroy');
    this.core.emit('osjs/window:destroy', this);

    if (this.$element) {
      this.$element.remove();
    }

    if (lastWindow === this) {
      lastWindow = null;
    }

    const foundIndex = windows.findIndex(w => w === this);
    if (foundIndex !== -1) {
      windows.splice(foundIndex, 1);
    }

    this.parent = null;
    this.$element = null;
    this.$content = null;
  }

  /**
   * Initialize window
   */
  init() {
    this.behavior.init();

    this.inited = true;
    this.emit('init', this);
  }

  /**
   * Render window
   * @param {Function} [callback] Callback when window DOM has been constructed
   * @return {Window} this instance
   */
  render(callback = function() {}) {
    this.$element.id = `Window_${this.id}`;
    this.$element.innerHTML = TEMPLATE;
    this.$element.setAttribute('data-id', this.id);

    ['osjs-window', ...this.attributes.classNames]
      .filter(val => !!val)
      .forEach((val) => {
        this.$element.classList.add(val);
      });

    this.$content = this.$element.querySelector('.osjs-window-content');

    this.setNextZindex();
    this._updateDOM();

    this.core.$root.appendChild(this.$element);

    if (typeof callback === 'function') {
      callback(this.$content, this);
    }

    this.emit('render', this);

    return this;
  }

  /**
   * Close the window
   */
  close() {
    if (this.destroyed) {
      return;
    }

    this.emit('close', this);

    this.destroy();
  }

  /**
   * Focus the window
   * @return {Boolean}
   */
  focus() {
    if (!this.state.minimized) {
      if (this._toggleState('focused', true, 'focus')) {
        if (lastWindow && lastWindow !== this) {
          lastWindow.blur();
        }

        this.setNextZindex();

        lastWindow = this;

        return true;
      }
    }

    return false;
  }

  /**
   * Blur (un-focus) the window
   * @return {Boolean}
   */
  blur() {
    return this._toggleState('focused', false, 'blur');
  }

  /**
   * Minimize (hide) the window
   * @return {Boolean}
   */
  minimize() {
    if (this._toggleState('minimized', true, 'minimize')) {
      return this.blur();
    }

    return true;
  }

  /**
   * Raise (un-minimize) the window
   * @return {Boolean}
   */
  raise() {
    return this._toggleState('minimized', false, 'raise');
  }

  /**
   * Maximize the window
   * @return {Boolean}
   */
  maximize() {
    return this._toggleState('maximized', true, 'maximize');
  }

  /**
   * Restore (un-maximize) the window
   * @return {Boolean}
   */
  restore() {
    return this._toggleState('maximized', false, 'restore');
  }

  /**
   * Updated the Window DOM
   */
  _updateDOM() {
    const {width, height} = this.state.dimension;
    const {top, left} = this.state.position;
    const {zIndex} = this.state;

    setDataAttributes(this.$element, this.state);
    setDataAttributes(this.$element, this.attributes);

    const $title = this.$element.querySelector('.osjs-window-title');
    $title.innerHTML = escapeHtml(this.state.title);

    const $icon = this.$element.querySelector('.osjs-window-icon > div');
    $icon.style.cssText = `background-image: url(${this.state.icon})`;

    this.$element.style.cssText = createCssText(Object.assign({
      top: String(top) + 'px',
      left: String(left) + 'px',
      height: String(height) + 'px',
      width: String(width) + 'px',
      height: String(height) + 'px',
      zIndex: zIndex
    }, this.state.styles));
  }

  /**
   * Set the Window icon
   * @param {String} uri Icon URI
   */
  setIcon(uri) {
    this.state.icon = uri;

    this._updateDOM();
  }

  /**
   * Set the Window title
   * @param {String} title Title
   */
  setTitle(title) {
    this.state.title = title || '';

    this._updateDOM();
  }

  /**
   * Set the Window dimension
   * @param {Object} dimension The dimension
   * @param {Number} dimension.width Width in pixels
   * @param {Number} dimension.height Height in pixels
   */
  setDimension(dimension) {
    const {width, height} = Object.assign(this.state.dimension, dimension || {});

    this.state.dimension.width = width;
    this.state.dimension.height = height;

    this._updateDOM();
  }

  /**
   * Set the Window position
   * @param {Object} position The position
   * @param {Number} position.left Left (X) in pixels
   * @param {Number} position.top Top (Y) in pixels
   */
  setPosition(position) {
    const {left, top} = Object.assign(this.state.position, position || {});

    this.state.position.top = top;
    this.state.position.left = left;

    this._updateDOM();
  }

  /**
   * Set the Window z index
   * @param {Number} zIndex the index
   */
  setZindex(zIndex) {
    this.state.zIndex = zIndex;
    console.debug('Window::setZindex()', zIndex);

    this._updateDOM();
  }

  /**
   * Sets the Window to next z index
   */
  setNextZindex() {
    this.setZindex(nextZindex);
    nextZindex++;
  }

  /**
   * Set a state by value
   * @param {String} name State name
   * @param {*} value State value
   * @param {Boolean} [update=true] Update the DOM
   */
  setState(name, value, update = true) {
    this.state[name] = value;

    if (update) {
      console.debug('Window::setState()', name, value);
      this._updateDOM();
    }
  }

  _toggleState(name, value, eventName, update = true) {
    if (this.state[name] === value) {
      return false;
    }

    console.debug('Window::_toggleState()', name, value, eventName);

    this.state[name] = value;
    this.emit(eventName, this);
    this.core.emit('osjs/window:change', this, name, value);

    if (update) {
      this._updateDOM();
    }

    return true;
  }

  /**
   * Get a snapshot of the Window session
   * @return Object
   */
  getSession() {
    return {
      id: this.id,
      state: Object.assign({}, this.state),
      attributes: Object.assign({}, this.attributes)
    };
  }

  /**
   * Get a list of all windows
   *
   * Does not return a reference, but rather a serialized list
   *
   * @return {Object[]}
   */
  static getWindows() {
    return windows.map(win => Object.assign({
      maximize: () => win.maximize(),
      raise: () => win.raise(),
      restore: () => win.restore(),
      close: () => win.close()
    }, win.getSession()));
  }

}
