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
import {EventHandler} from '@osjs/common';
import {escapeHtml, createCssText} from './utils/dom';

/**
 * Window dimension definition
 * @property {number} width Width in pixels
 * @property {number} height Height in pixels
 * @typedef WindowDimension
 */

/**
 * Window position definition
 * @property {number} left Left in pixels
 * @property {number} top Top in pixels
 * @typedef WindowPosition
 */

/**
 * Window attributes definition
 *
 * @desc Contains attributes for a window.
 * Media queries will add a given name as a `data-media` attribute to the window
 * root DOM element.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries
 *
 * @property {String[]} [classNames=[]] A list of class names
 * @property {Boolean} [ontop=false] If always on top
 * @property {String} [gravity] Gravity (center/top/left/right/bottom)
 * @property {Boolean} [resizable=true] If resizable
 * @property {Boolean} [focusable=true] If focusable
 * @property {Boolean} [maximizable=true] If window if maximizable
 * @property {Boolean} [minimizable=true] If minimizable
 * @property {WindowDimension} [minDimension] Minimum dimension
 * @property {WindowDimension} [maxDimension] Maximum dimension
 * @property {Map<String,String>} [mediaQueries] A map of matchMedia to name
 * @typedef WindowAttributes
 */

/**
 * Window state definition
 * @property {String} title Title
 * @property {String} icon Icon
 * @property {Boolean} [moving=false] If moving
 * @property {Boolean} [resizing=false] If resizing
 * @property {Boolean} [loading=false] If loading
 * @property {Boolean} [focused=false] If focused
 * @property {Boolean} [maximized=false] If maximized
 * @property {Boolean} [mimimized=false] If mimimized
 * @property {Boolean} [modal=false] If modal
 * @property {number} [zIndex=1] The z-index (auto calculated)
 * @property {WindowPosition} [position] Position
 * @property {WindowDimension} [dimension] Dimension
 * @typedef WindowState
 */

const MINIMUM_WIDTH = 100;
const MINIMUM_HEIGHT = 100;
const ONTOP_ZINDEX = 8388635;

let windows = [];
let windowCount = 0;
let nextZindex = 1;
let lastWindow = null;

/*
 * Creates window attributes from an object
 */
const createAttributes = (attrs) => Object.assign({
  classNames: [],
  ontop: false,
  gravity: false,
  resizable: true,
  focusable: true,
  maximizable: true,
  minimizable: true,
  sessionable: true,
  mediaQueries: {
    small: 'screen and (max-width: 640px)',
    medium: 'screen and (min-width: 640px) and (max-width: 1024px)',
    big: 'screen and (min-width: 1024px)'
  },
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
const createState = (state, options, attrs) => Object.assign({
  title: options.title || options.id,
  icon: options.icon || require('./styles/logo-blue-32x32.png'),
  media: null,
  moving: false,
  resizing: false,
  loading: false,
  focused: false,
  maximized: false,
  minimized: false,
  modal: false,
  zIndex: 1,
  styles: {},
  position: Object.assign({}, {
    left: 0,
    top: 0
  }, options.position),
  dimension: Object.assign({}, {
    width: Math.max(attrs.minDimension.width, MINIMUM_WIDTH),
    height: Math.max(attrs.minDimension.height, MINIMUM_HEIGHT)
  }, options.dimension)
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
 * Get active element if belonging to root
 */
const getActiveElement = (root) => {
  const ae = document.activeElement;
  return root.contains(ae) ? ae : null;
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
 * Window
 *
 * @desc Class for a OS.js Window
 */
export default class Window extends EventHandler {

  /**
   * Create window
   *
   * @param {Core} core Core reference
   * @param {Object} options Options
   * @param {String} options.id Window Id (not globaly unique)
   * @param {String} [options.title] Window Title
   * @param {String} [options.icon] Window Icon
   * @param {Window} [options.parent] The parent Window reference
   * @param {WindowPosition} [options.position] Window position
   * @param {WindowDimension} [options.dimension] Window dimension
   * @param {WindowAttributes} [options.attributes] Apply Window attributes
   * @param {WindowState} [options.state] Apply Window state
   */
  constructor(core, options = {}) {
    options = Object.assign({
      id: null,
      title: null,
      parent: null,
      attributes: {},
      position: {},
      dimension: {},
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
     * Child windows (via 'parent')
     * @type {Window[]}
     */
    this.children = [];

    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;

    /**
     * The window destruction state
     * @type {Boolean}
     */
    this.destroyed = false;

    /**
     * The window attributes
     * @type {WindowAttributes}
     */
    this.attributes = createAttributes(options.attributes);

    /**
     * The window state
     * @type {WindowState}
     */
    this.state = createState(options.state, options, this.attributes);

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

    /**
     * The header container
     * @type {Node}
     */
    this.$header = null;

    /**
     * Internal variable to signal not to use default position
     * given by user (used for restore)
     * @type {Boolean}
     */
    this._preventDefaultPosition = false;

    /**
     * Internal timeout reference used for triggering the loading
     * overlay.
     * @type {Boolean}
     */
    this._loadingDebounce = null;

    // Assign the window if it is a child
    if (this.parent) {
      this.on('destroy', () => {
        const foundIndex = this.parent.children.findIndex(w => w === this);
        if (foundIndex !== -1) {
          this.parent.children.splice(foundIndex, 1);
        }
      });

      this.parent.children.push(this);
    }

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

    this.children.forEach(w => w.destroy());

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

    this.children = [];
    this.parent = null;
    this.$element = null;
    this.$content = null;
    this.$header = null;
  }

  /**
   * Initialize window
   */
  init() {
    const behavior = this.core.make('osjs/window-behavior');
    if (behavior) {
      behavior.init(this);
    }

    this.inited = true;
    this.emit('init', this);
  }

  /**
   * Render window
   * @param {Function} [callback] Callback when window DOM has been constructed
   * @return {Window} this instance
   */
  render(callback = function() {}) {
    this.$element.innerHTML = TEMPLATE;

    ['osjs-window', ...this.attributes.classNames]
      .filter(val => !!val)
      .forEach((val) => {
        this.$element.classList.add(val);
      });

    this.$content = this.$element.querySelector('.osjs-window-content');
    this.$header = this.$element.querySelector('.osjs-window-header');

    this.setNextZindex();
    this._updateDOM();

    this.core.$root.appendChild(this.$element);

    if (typeof callback === 'function') {
      callback(this.$content, this);
    }

    setTimeout(() => {
      this.emit('render', this);

      if (!this._preventDefaultPosition) {
        this.gravitate(this.attributes.gravity);
      }
    }, 1);

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
    // Forces blur-ing of browser input element belonging to this window
    const activeElement = getActiveElement(this.$element);
    if (activeElement) {
      activeElement.blur();
    }

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
   * Resize to fit to current container
   * @param {Element} [container] The DOM element to use
   */
  resizeFit(container) {
    container = container || this.$content.firstChild;

    const min = this.attributes.minDimension;
    const max = this.attributes.maxDimension;
    let width = Math.max(container.offsetWidth, min.width);
    let height = Math.max(container.offsetHeight + this.$header.offsetHeight, min.height);

    if (max.width > 0) {
      width = Math.min(width, max.width);
    }

    if (max.height > 0) {
      height = Math.min(height, max.height);
    }

    if (!isNaN(width) && !isNaN(height)) {
      this.setDimension({width, height});
    }
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

    this.core.emit('osjs/window:change', this, 'title', title);
  }

  /**
   * Set the Window dimension
   * @param {WindowDimension} dimension The dimension
   */
  setDimension(dimension) {
    const {width, height} = Object.assign(this.state.dimension, dimension || {});

    this.state.dimension.width = width;
    this.state.dimension.height = height;

    this._updateDOM();
  }

  /**
   * Set the Window position
   * @param {WindowPosition} position The position
   * @param {Boolean} [preventDefault=false] Prevents any future position setting in init procedure
   */
  setPosition(position, preventDefault = false) {
    const {left, top} = Object.assign(this.state.position, position || {});

    this.state.position.top = top;
    this.state.position.left = left;

    if (preventDefault) {
      this._preventDefaultPosition = true;
    }

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
   * @see {WindowState}
   */
  setState(name, value, update = true) {
    const set = () => this._setState(name, value, update);

    // Allows for some "grace time" so the overlay does not
    // "blink"
    if (name === 'loading' && update) {
      clearTimeout(this._loadingDebounce);

      if (value === true) {
        this._loadingDebounce = setTimeout(() => set(), 250);
        return;
      }
    }

    set();
  }

  /**
   * Gravitates window towards a certain area
   * @param {String} gravity Gravity
   */
  gravitate(gravity) {
    // TODO: Add more directions
    if (!this.core.has('osjs/desktop')) {
      return;
    }

    const rect = this.core.make('osjs/desktop').getRect();
    let {left, top} = this.state.position;

    if (gravity === 'center') {
      left = (rect.width / 2) - (this.state.dimension.width / 2);
      top = (rect.height / 2) - (this.state.dimension.height / 2);
    }

    this.setPosition({left, top});
  }

  /**
   * Get a snapshot of the Window session
   * @return Object
   */
  getSession() {
    return this.attributes.sessionable === false ? null : {
      id: this.id,
      position: Object.assign({}, this.state.position),
      dimension: Object.assign({}, this.state.dimension)
    };
  }

  /**
   * Get a list of all windows
   *
   * @return {Window[]}
   */
  static getWindows() {
    return windows;
  }

  /**
   * Internal method for setting state
   * @param {String} name State name
   * @param {*} value State value
   * @param {Boolean} [update=true] Update the DOM
   */
  _setState(name, value, update = true) {
    this.state[name] = value;

    if (update) {
      console.debug('Window::_setState()', name, value);
      this._updateDOM();
    }
  }

  /**
   * Internal method for toggling state
   * @param {String} name State name
   * @param {*} value State value
   * @param {String} eventName Name of event to emit
   * @param {Boolean} [update=true] Update the DOM
   */
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
   * Updated the Window DOM
   */
  _updateDOM() {
    if (!this.inited) {
      return;
    }

    // TODO: Optimize

    const {width, height} = this.state.dimension;
    const {top, left} = this.state.position;
    const {zIndex} = this.state;

    const attributes = {
      id: this.id,
      media: this.state.media,
      moving: this.state.moving,
      resizing: this.state.resizing,
      loading: this.state.loading,
      focused: this.state.focused,
      maximized: this.state.maximized,
      minimized: this.state.minimized,
      modal: this.state.modal,
      ontop: this.attributes.ontop,
      resizable: this.attributes.resizable,
      maximizable: this.attributes.maximizable,
      minimizable: this.attributes.minimizable
    };

    Object.keys(attributes)
      .forEach(a => this.$element.setAttribute(`data-${a}`, String(attributes[a])));

    const $title = this.$element.querySelector('.osjs-window-title');
    if ($title) {
      $title.innerHTML = escapeHtml(this.state.title);
    }

    const $icon = this.$element.querySelector('.osjs-window-icon > div');
    if ($icon) {
      $icon.style.cssText = `background-image: url(${this.state.icon})`;
    }

    this.$element.style.cssText = createCssText(Object.assign({
      top: String(top) + 'px',
      left: String(left) + 'px',
      height: String(height) + 'px',
      width: String(width) + 'px',
      zIndex: (this.attributes.ontop ? ONTOP_ZINDEX : 0) + zIndex
    }, this.state.styles));
  }

}
