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
import {EventEmitter} from '@osjs/event-emitter';
import {droppable} from './utils/dnd';
import {escapeHtml, createCssText, supportsTransition, getActiveElement} from './utils/dom';
import {
  createAttributes,
  createState,
  createDOMAttributes,
  createDOMStyles,
  clampPosition,
  renderCallback,
  transformVectors,
  positionFromGravity,
  dimensionFromElement
} from './utils/windows';
import logger from './logger';

/**
 * Window dimension definition
 * @typedef {Object} WindowDimension
 * @property {number} width Width in pixels (or float for percentage in setters)
 * @property {number} height Height in pixels (or float for percentage in setters)
 */

/**
 * Window position definition
 * @typedef {Object} WindowPosition
 * @property {number} left Left in pixels (or float for percentage in setters)
 * @property {number} top Top in pixels (or float for percentage in setters)
 */

/**
 * Window session
 * @typedef {Object} WindowSession
 * @property {number} id
 * @property {boolean} maximized
 * @property {boolean} minimized
 * @property {WindowPosition} position
 * @property {WindowDimension} dimension
 */

/**
 * Window attributes definition
 *
 * @typedef {Object} WindowAttributes
 * @property {string[]} [classNames=[]] A list of class names
 * @property {boolean} [ontop=false] If always on top
 * @property {string} [gravity] Gravity (center/top/left/right/bottom or any combination)
 * @property {boolean} [resizable=true] If resizable
 * @property {boolean} [focusable=true] If focusable
 * @property {boolean} [maximizable=true] If window if maximizable
 * @property {boolean} [minimizable=true] If minimizable
 * @property {boolean} [moveable=true] If moveable
 * @property {boolean} [closeable=true] If closeable
 * @property {boolean} [header=true] Show header
 * @property {boolean} [controls=true] Show controls
 * @property {string} [visibility=global] Global visibility, 'restricted' to hide from window lists etc.
 * @property {boolean} [clamp=true] Clamp the window position upon creation
 * @property {boolean | {dataTransferProperty?: 'files' | 'items'}} [droppable=true] If window should have the default drop action
 * @property {WindowDimension} [minDimension] Minimum dimension
 * @property {WindowDimension} [maxDimension] Maximum dimension
 * @property {{name: string}} [mediaQueries] A map of matchMedia to name
 */

/**
 * Window state definition
 *
 * @typedef {Object} WindowState
 * @property {string} title Title
 * @property {string} icon Icon
 * @property {boolean} [moving=false] If moving
 * @property {boolean} [resizing=false] If resizing
 * @property {boolean} [loading=false] If loading
 * @property {boolean} [focused=false] If focused
 * @property {boolean} [maximized=false] If maximized
 * @property {boolean} [mimimized=false] If mimimized
 * @property {boolean} [modal=false] If modal to the parent
 * @property {number} [zIndex=10] The z-index (auto calculated)
 * @property {WindowPosition} [position] Position
 * @property {WindowDimension} [dimension] Dimension
 */

/**
 * Window options definition
 *
 * @typedef {Object} WindowOptions
 * @property {string} id Window Id (not globaly unique)
 * @property {string} [title] Window Title
 * @property {string} [icon] Window Icon
 * @property {Window} [parent] The parent Window reference
 * @property {string|Function} [template] The Window HTML template (or function with signature (el, win) for programatic construction)
 * @property {Function} [ondestroy] A callback function when window destructs to interrupt the procedure
 * @property {WindowPosition|string} [position] Window position
 * @property {WindowDimension} [dimension] Window dimension
 * @property {WindowAttributes} [attributes] Apply Window attributes
 * @property {WindowState} [state] Apply Window state
 */

let windows = [];
let windowCount = 0;
let nextZindex = 1;
let lastWindow = null;

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
  <div class="osjs-window-resize" data-direction="n"></div>
  <div class="osjs-window-resize" data-direction="nw"></div>
  <div class="osjs-window-resize" data-direction="w"></div>
  <div class="osjs-window-resize" data-direction="sw"></div>
  <div class="osjs-window-resize" data-direction="s"></div>
  <div class="osjs-window-resize" data-direction="se"></div>
  <div class="osjs-window-resize" data-direction="e"></div>
  <div class="osjs-window-resize" data-direction="ne"></div>
</div>`.replace(/\n\s+/g, '').trim();

/**
 * Window Implementation
 */
export default class Window extends EventEmitter {

  /**
   * Create window
   *
   * @param {Core} core Core reference
   * @param {WindowOptions} [options={}] Options
   */
  constructor(core, options = {}) {
    options = {
      id: null,
      title: null,
      parent: null,
      template: null,
      ondestroy: null,
      attributes: {},
      position: {},
      dimension: {},
      state: {},
      ...options
    };

    logger.debug('Window::constructor()', options);

    super('Window@' + options.id);

    if (typeof options.position === 'string') {
      options.attributes.gravity = options.position;
      options.position = {};
    }

    /**
     * The Window ID
     * @type {string}
     * @readonly
     */
    this.id = options.id;

    /**
     * The Window ID
     * @type {Number}
     * @readonly
     */
    this.wid = ++windowCount;

    /**
     * Parent Window reference
     * @type {Window}
     * @readonly
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
     * @readonly
     */
    this.core = core;

    /**
     * The window destruction state
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * The window rendered state
     * @type {boolean}
     */
    this.rendered = false;

    /**
     * The window was inited
     * @type {boolean}
     */
    this.inited = false;

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
     * @type {Element}
     * @readonly
     */
    this.$element = document.createElement('div');

    /**
     * The content container
     * @type {Element}
     */
    this.$content = null;

    /**
     * The header container
     * @type {Element}
     */
    this.$header = null;

    /**
     * The icon container
     * @type {Element}
     */
    this.$icon = null;

    /**
     * The title container
     * @type {Element}
     */
    this.$title = null;

    /**
     * Internal variable to signal not to use default position
     * given by user (used for restore)
     * @private
     * @type {boolean}
     */
    this._preventDefaultPosition = false;

    /**
     * Internal timeout reference used for triggering the loading
     * overlay.
     * @private
     * @type {boolean}
     */
    this._loadingDebounce = null;

    /**
     * The window template
     * @private
     * @type {string|Function}
     */
    this._template = options.template;

    /**
     * Custom destructor callback
     * @private
     * @type {Function}
     * @readonly
     */
    this._ondestroy = options.ondestroy || (() => true);

    /**
     * Last DOM update CSS text
     * @private
     * @type {string}
     */
    this._lastCssText = '';

    /**
     * Last DOM update data attributes
     * @private
     * @type {WindowAttributes}
     */
    this._lastAttributes = {};

    windows.push(this);
  }

  /**
   * Destroy window
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    if (typeof this._ondestroy === 'function' && this._ondestroy() === false) {
      return;
    }

    this.destroyed = true;

    logger.debug('Window::destroy()');

    this.emit('destroy', this);
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
    this.$icon = null;
    this.$title = null;

    super.destroy();
  }

  /**
   * Initialize window
   */
  init() {
    if (this.inited) {
      return this;
    }

    if (this.parent) {
      // Assign the window if it is a child
      this.on('destroy', () => {
        const foundIndex = this.parent.children.findIndex(w => w === this);
        if (foundIndex !== -1) {
          this.parent.children.splice(foundIndex, 1);
        }
      });

      this.parent.children.push(this);
    }

    this._initTemplate();
    this._initBehavior();


    this.inited = true;
    this.emit('init', this);
    this.core.emit('osjs/window:create', this);

    return this;
  }

  /**
   * Initializes window template
   * @private
   */
  _initTemplate() {
    const tpl = this.core.config('windows.template') || TEMPLATE;
    if (this._template) {
      this.$element.innerHTML = typeof this._template === 'function'
        ? this._template(this, tpl)
        : this._template;
    } else {
      this.$element.innerHTML = tpl;
    }

    this.$content = this.$element.querySelector('.osjs-window-content');
    this.$header = this.$element.querySelector('.osjs-window-header');
    this.$icon = this.$element.querySelector('.osjs-window-icon > div');
    this.$title = this.$element.querySelector('.osjs-window-title');
  }

  /**
   * Initializes window behavior
   * @private
   */
  _initBehavior() {
    // Transform percentages in dimension to pixels etc
    if (this.core.has('osjs/desktop')) {
      const rect = this.core.make('osjs/desktop').getRect();
      const {dimension, position} = transformVectors(rect, this.state.dimension, this.state.position);
      this.state.dimension = dimension;
      this.state.position = position;
    }

    // Behavior
    const behavior = this.core.make('osjs/window-behavior');
    if (behavior) {
      behavior.init(this);
    }

    // DnD functionality
    if (this.attributes.droppable) {
      const {dataTransferProperty = 'files'} = this.attributes.droppable === true
        ? {}
        : this.attributes.droppable;

      const d = droppable(this.$element, {
        ondragenter: (...args) => this.emit('dragenter', ...args, this),
        ondragover: (...args) => this.emit('dragover', ...args, this),
        ondragleave: (...args) => this.emit('dragleave', ...args, this),
        ondrop: (...args) => this.emit('drop', ...args, this),
        dataTransferProperty,
      });

      this.on('destroy', () => d.destroy());
    }
  }

  /**
   * Checks the modal state of the window upon render
   * @private
   */
  _checkModal() {
    // TODO: Global modal
    if (this.parent) {
      if (this.attributes.modal) {
        this.on('render', () => this.parent.setState('loading', true));
        this.on('destroy', () => this.parent.setState('loading', false));
      }

      this.on('destroy', () => this.parent.focus());
    }
  }

  /**
   * Sets the initial class names
   * @private
   */
  _setClassNames() {
    const classNames = ['osjs-window', ...this.attributes.classNames];
    if (this.id) {
      classNames.push(`Window_${this.id}`);
    }

    classNames.filter(val => !!val)
      .forEach((val) => this.$element.classList.add(val));
  }

  /**
   * Render window
   * @param {Function} [callback] Callback when window DOM has been constructed
   * @return {Window} this instance
   */
  render(callback = function() {}) {
    if (this.rendered) {
      return this;
    } else if (!this.inited) {
      this.init();
    }

    this._setClassNames();
    this._updateButtons();
    this._updateAttributes();
    this._updateStyles();
    this._updateTitle();
    this._updateIconStyles();
    this._updateHeaderStyles();
    this._checkModal();

    if (!this._preventDefaultPosition) {
      this.gravitate(this.attributes.gravity);
    }

    // Clamp the initial window position to viewport
    if (this.attributes.clamp) {
      this.clampToViewport(false);
    }

    this.setNextZindex(true);

    this.core.$contents.appendChild(this.$element);

    renderCallback(this, callback);

    this.rendered = true;

    setTimeout(() => {
      this.emit('render', this);
      this.core.emit('osjs/window:render', this);
    }, 1);

    return this;
  }

  /**
   * Close the window
   * @return {boolean}
   */
  close() {
    if (this.destroyed) {
      return false;
    }

    this.emit('close', this);

    this.destroy();

    return true;
  }

  /**
   * Focus the window
   * @return {boolean}
   */
  focus() {
    if (!this.state.minimized && this._toggleState('focused', true, 'focus')) {
      this._focus();

      return true;
    }

    return false;
  }

  /**
   * Internal for focus
   * @private
   */
  _focus() {
    if (lastWindow && lastWindow !== this) {
      lastWindow.blur();
    }

    lastWindow = this;

    this.setNextZindex();
  }

  /**
   * Blur (un-focus) the window
   * @return {boolean}
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
   * @return {boolean}
   */
  minimize() {
    if (this.attributes.minimizable) {
      if (this._toggleState('minimized', true, 'minimize')) {
        this.blur();

        return true;
      }
    }

    return false;
  }

  /**
   * Raise (un-minimize) the window
   * @return {boolean}
   */
  raise() {
    return this._toggleState('minimized', false, 'raise');
  }

  /**
   * Maximize the window
   * @return {boolean}
   */
  maximize() {
    if (this.attributes.maximizable) {
      return this._maximize(true);
    }

    return false;
  }

  /**
   * Restore (un-maximize) the window
   * @return {boolean}
   */
  restore() {
    return this._maximize(false);
  }

  /**
   * Internal for Maximize or restore
   * @private
   * @param {boolean} toggle Maximize or restore
   * @return {boolean}
   */
  _maximize(toggle) {
    if (this._toggleState('maximized', toggle, toggle ? 'maximize' : 'restore')) {
      const emit = () => this.emit('resized', {
        width: this.$element ? this.$element.offsetWidth : -1,
        height: this.$element ? this.$element.offsetHeight : -1
      }, this);

      if (supportsTransition()) {
        this.once('transitionend', emit);
      } else {
        emit();
      }

      return true;
    }

    return false;
  }

  /**
   * Resize to fit to current container
   * @param {Element} [container] The DOM element to use
   */
  resizeFit(container) {
    container = container || this.$content.firstChild;

    if (container) {
      const rect = this.core.has('osjs/desktop')
        ? this.core.make('osjs/desktop').getRect()
        : null;

      const {width, height} = dimensionFromElement(this, rect, container);
      if (!isNaN(width) && !isNaN(height)) {
        this.setDimension({width, height});
      }
    }
  }

  /**
   * Clamps the position to viewport
   * @param {boolean} [update=true] Update DOM
   */
  clampToViewport(update = true) {
    if (!this.core.has('osjs/desktop')) {
      return;
    }

    const rect = this.core.make('osjs/desktop').getRect();

    this.state.position = {
      ...this.state.position,
      ...clampPosition(rect, this.state)
    };

    if (update) {
      this._updateStyles();
    }
  }

  /**
   * Set the Window icon
   * @param {string} uri Icon URI
   */
  setIcon(uri) {
    this.state.icon = uri;

    this._updateIconStyles();
  }

  /**
   * Set the Window title
   * @param {string} title Title
   */
  setTitle(title) {
    this.state.title = title || '';

    this._updateTitle();

    this.core.emit('osjs/window:change', this, 'title', title);
  }

  /**
   * Set the Window dimension
   * @param {WindowDimension} dimension The dimension
   */
  setDimension(dimension) {
    const {width, height} = {...this.state.dimension, ...dimension || {}};

    this.state.dimension.width = width;
    this.state.dimension.height = height;

    this._updateStyles();
  }

  /**
   * Set the Window position
   * @param {WindowPosition} position The position
   * @param {boolean} [preventDefault=false] Prevents any future position setting in init procedure
   */
  setPosition(position, preventDefault = false) {
    const {left, top} = {...this.state.position, ...position || {}};

    this.state.position.top = top;
    this.state.position.left = left;

    if (preventDefault) {
      this._preventDefaultPosition = true;
    }

    this._updateStyles();
  }

  /**
   * Set the Window z index
   * @param {Number} zIndex the index
   */
  setZindex(zIndex) {
    this.state.zIndex = zIndex;
    logger.debug('Window::setZindex()', zIndex);

    this._updateStyles();
  }

  /**
   * Sets the Window to next z index
   * @param {boolean} [force] Force next index
   */
  setNextZindex(force) {
    const setNext = force || this._checkNextZindex();

    if (setNext) {
      this.setZindex(nextZindex);
      nextZindex++;
    }
  }

  /**
   * Set a state by value
   * @param {string} name State name
   * @param {*} value State value
   * @param {boolean} [update=true] Update the DOM
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
   * @param {string} gravity Gravity
   */
  gravitate(gravity) {
    if (!this.core.has('osjs/desktop')) {
      return;
    }

    const rect = this.core.make('osjs/desktop').getRect();
    const position = positionFromGravity(this, rect, gravity);

    this.setPosition(position);
  }

  /**
   * Gets a astate
   * @return {*}
   */
  getState(n) {
    const value = this.state[n];

    return ['position', 'dimension', 'styles'].indexOf(n) !== -1
      ? {...value}
      : value;
  }

  /**
   * Get a snapshot of the Window session
   * @return {WindowSession}
   */
  getSession() {
    return this.attributes.sessionable === false ? null : {
      id: this.id,
      maximized: this.state.maximized,
      minimized: this.state.minimized,
      position: {...this.state.position},
      dimension: {...this.state.dimension}
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
   * Gets the lastly focused Window
   * @return {Window}
   */
  static lastWindow() {
    return lastWindow;
  }

  /**
   * Internal method for setting state
   * @private
   * @param {string} name State name
   * @param {*} value State value
   * @param {boolean} [update=true] Update the DOM
   * @param {boolean} [updateAll=true] Update the entire DOM
   */
  _setState(name, value, update = true) {
    const oldValue = this.state[name];
    this.state[name] = value;

    if (update) {
      if (oldValue !== value) {
        logger.debug('Window::_setState()', name, value);
      }

      this._updateAttributes();
      this._updateStyles();
    }
  }

  /**
   * Internal method for toggling state
   * @private
   * @param {string} name State name
   * @param {any} value State value
   * @param {string} eventName Name of event to emit
   * @param {boolean} [update=true] Update the DOM
   */
  _toggleState(name, value, eventName, update = true) {
    if (this.state[name] === value) {
      return false;
    }

    logger.debug('Window::_toggleState()', name, value, eventName, update);

    this.state[name] = value;
    this.emit(eventName, this);
    this.core.emit('osjs/window:change', this, name, value);

    if (update) {
      this._updateAttributes();
    }

    return true;
  }

  /**
   * Check if we have to set next zindex
   * @private
   * @return {boolean}
   */
  _checkNextZindex() {
    const {ontop} = this.attributes;
    const {zIndex} = this.state;

    const windexes = windows
      .filter(w => w.attributes.ontop === ontop)
      .filter(w => w.wid !== this.wid)
      .map(w => w.state.zIndex);

    const max = windexes.length > 0
      ? Math.max.apply(null, windexes)
      : 0;

    return zIndex < max;
  }

  /*
   * Updates window styles and attributes
   * FIXME: Backward compability with themes
   * @deprecated
   */
  _updateDOM() {
    this._updateAttributes();
    this._updateStyles();
  }

  /**
   * Updates the window buttons in DOM
   * @private
   */
  _updateButtons() {
    const hideButton = action =>
      this.$header.querySelector(`.osjs-window-button[data-action=${action}]`)
        .style.display = 'none';

    const buttonmap = {
      maximizable: 'maximize',
      minimizable: 'minimize',
      closeable: 'close'
    };

    if (this.attributes.controls) {
      Object.keys(buttonmap)
        .forEach(key => {
          if (!this.attributes[key]) {
            hideButton(buttonmap[key]);
          }
        });
    } else {
      Array.from(this.$header.querySelectorAll('.osjs-window-button'))
        .forEach(el => el.style.display = 'none');
    }
  }

  /**
   * Updates window title in DOM
   * @private
   */
  _updateTitle() {
    if (this.$title) {
      const escapedTitle = escapeHtml(this.state.title);
      if (this.$title.innerHTML !== escapedTitle) {
        this.$title.innerHTML = escapedTitle;
      }
    }
  }

  /**
   * Updates window icon decoration in DOM
   * @private
   */
  _updateIconStyles() {
    if (this.$icon) {
      const iconSource = `url(${this.state.icon})`;
      if (this.$icon.style.backgroundImage !== iconSource) {
        this.$icon.style.backgroundImage = iconSource;
      }
    }
  }

  /**
   * Updates window header decoration in DOM
   * @private
   */
  _updateHeaderStyles() {
    if (this.$header) {
      const headerDisplay = this.attributes.header ? undefined : 'none';
      if (this.$header.style.display !== headerDisplay) {
        this.$header.style.display = headerDisplay;
      }
    }
  }

  /**
   * Updates window data in DOM
   * @private
   */
  _updateAttributes() {
    if (this.$element) {
      const attrs = createDOMAttributes(this.id, this.state, this.attributes);
      const applyAttrs = Object.keys(attrs).filter(k => attrs[k] !== this._lastAttributes[k]);

      if (applyAttrs.length > 0) {
        applyAttrs.forEach(a => this.$element.setAttribute(`data-${a}`, String(attrs[a])));
        this._lastAttributes = attrs;
      }
    }
  }

  /**
   * Updates window style in DOM
   * @private
   */
  _updateStyles() {
    if (this.$element) {
      const cssText = createCssText(createDOMStyles(this.state, this.attributes));
      if (cssText !== this._lastCssText) {
        this.$element.style.cssText = cssText;
        this._lastCssText = cssText;
      }
    }
  }
}
