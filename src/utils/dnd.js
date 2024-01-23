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

import logger from '../logger';

/**
 * @callback DraggableEvent
 * @param {MouseEvent} ev
 */

/**
 * @callback DroppableEvent
 * @param {MouseEvent} ev
 */

/**
 * @callback DroppedEvent
 * @param {MouseEvent} ev
 * @param {Object} data
 * @param {File[]} [files=[]]
 */

/**
 * @typedef {Object} DroppableOptions
 * @property {string} [type=application/json] Content Type
 * @property {string} [effect=move] DnD effect (cursor)
 * @property {DroppableEvent} [ondragenter] Callback to event (ev) => {}
 * @property {DroppableEvent} [ondragover] Callback to event (ev) => {}
 * @property {DroppableEvent} [ondragleave] Callback to event (ev) => {}
 * @property {DroppedEvent} [ondrop] Callback to event (ev, data, files) => {}
 * @property {boolean} [strict=false] Drop element must match exactly
 */

/**
 * @typedef {Object} DroppableInstance
 * @property {Function} destroy
 */

/**
 * @typedef {Object} DraggableOptions
 * @property {string} [type=application/json] Content Type
 * @property {string} [effect=move] DnD effect (cursor)
 * @property {DraggableEvent} [ondragstart] Callback to event (ev) => {}
 * @property {DraggableEvent} [ondragend] Callback to event (ev) => {}
 * @property {DraggableEvent} [setDragImage] Set custom drag image (browser dependent)
 */

/**
 * @typedef {Object} DraggableInstance
 * @property {Function} destroy
 */

const retval = (fn, ...args) => {
  try {
    const result = fn(...args);
    if (typeof result === 'boolean') {
      return result;
    }
  } catch (e) {
    logger.warn('droppable value parsing error', e);
  }

  return true;
};

const getDataTransfer = (ev, type) => {
  let files = [];
  let data;

  if (ev.dataTransfer) {
    files = ev.dataTransfer.items
      ? Array.from(ev.dataTransfer.items)
      : [];

    try {
      const transfer = ev.dataTransfer.getData(type);

      try {
        if (type === 'application/json') {
          data = typeof transfer === 'undefined' ? transfer : JSON.parse(transfer);
        } else {
          data = transfer;
        }
      } catch (e) {
        data = transfer;
        logger.warn('droppable dataTransfer parsing error', e);
      }
    } catch (e) {
      logger.warn('droppable dataTransfer parsing error', e);
    }
  }

  return {files, data};
};

const setDataTransfer = (type, effect, data, setDragImage) => {
  const hasDragImage = typeof setDragImage === 'function';
  const transferData = type === 'application/json'
    ? JSON.stringify(data)
    : data;

  return (ev, el, options) => {
    if (ev.dataTransfer) {
      if (ev.dataTransfer.setDragImage && hasDragImage) {
        try {
          setDragImage(ev, el, options);
        } catch (e) {
          logger.warn('draggable dragstart setDragImage error', e);
        }
      }

      try {
        ev.dataTransfer.effectAllowed = effect;
        ev.dataTransfer.setData(type, transferData);
      } catch (e) {
        logger.warn('draggable dragstart dataTransfer error', e);
      }
    }
  };
};

/**
 * Creates a "draggable" element
 * @param {Element} el The DOM element to apply to
 * @param {DraggableOptions} [options={}] Options
 * @return {DraggableInstance}
 */
export const draggable = (el, options = {}) => {
  const {type, effect, data, ondragstart, ondragend, setDragImage} = {
    type: 'application/json',
    effect: 'move',
    ondragstart: () => true,
    ondragend: () => true,
    setDragImage: null,
    ...options
  };

  const setter = setDataTransfer(type, effect, data, setDragImage);

  const dragstart = ev => {
    el.setAttribute('aria-grabbed', 'true');
    setter(ev, el, options);
    return ondragstart(ev);
  };

  const dragend = ev => {
    el.setAttribute('aria-grabbed', 'false');

    return ondragend(ev);
  };

  const destroy = () => {
    el.removeAttribute('draggable');
    el.removeAttribute('aria-grabbed');
    el.removeEventListener('dragstart', dragstart);
    el.removeEventListener('dragend', dragend);
    el.classList.remove('osjs__draggable');
  };

  el.setAttribute('draggable', 'true');
  el.setAttribute('aria-grabbed', 'false');
  el.addEventListener('dragstart', dragstart);
  el.addEventListener('dragend', dragend);
  el.classList.add('osjs__draggable');

  return {destroy};
};

/**
 * Creates a "droppable" element
 * @param {Element} el The DOM element to apply to
 * @param {DroppableOptions} [options={}] Options
 * @return {DroppableInstance}
 */
export const droppable = (el, options = {}) => {
  const {strict, type, effect, ondragenter, ondragover, ondragleave, ondrop} = {
    type: 'application/json',
    effect: 'move',
    ondragenter: () => true,
    ondragover: () => true,
    ondragleave: () => true,
    ondrop: () => true,
    strict: false,
    ...options
  };

  const dragenter = ev => ondragenter(ev);

  const dragleave = ev => {
    el.classList.remove('osjs__drop');

    return retval(ondragleave, ev);
  };

  const dragover = ev => {
    ev.preventDefault();

    const inside = el.contains(ev.target);

    if (!inside) {
      el.classList.remove('osjs__drop');
      return false;
    }

    ev.stopPropagation();
    ev.dataTransfer.dropEffect = effect;
    el.classList.add('osjs__drop');

    return retval(ondragover, ev);
  };

  const drop = ev => {
    if (strict && ev.target !== el) {
      return false;
    }

    const {files, data} = getDataTransfer(ev, type);

    ev.stopPropagation();
    ev.preventDefault();
    el.classList.remove('osjs__drop');

    return retval(ondrop, ev, data, files);
  };

  const destroy = () => {
    el.removeAttribute('aria-dropeffect', effect);
    el.removeEventListener('dragenter', dragenter);
    el.removeEventListener('dragover', dragover);
    el.removeEventListener('dragleave', dragleave);
    el.removeEventListener('drop', drop);
    el.classList.remove('osjs__droppable');
  };

  el.setAttribute('aria-dropeffect', effect);
  el.addEventListener('dragenter', dragenter);
  el.addEventListener('dragover', dragover);
  el.addEventListener('dragleave', dragleave);
  el.addEventListener('drop', drop);
  el.classList.add('osjs__droppable');

  return {destroy};
};
