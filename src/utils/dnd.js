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

const retval = (fn, ...args) => {
  try {
    const result = fn(...args);
    if (typeof result === 'boolean') {
      return result;
    }
  } catch (e) {
    console.warn('droppable value parsing error', e);
  }

  return true;
};

const getDataTransfer = (ev, type) => {
  let files = [];
  let data;

  if (ev.dataTransfer) {
    files = ev.dataTransfer.files
      ? Array.from(ev.dataTransfer.files)
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
        console.warn('droppable dataTransfer parsing error', e);
      }
    } catch (e) {
      console.warn('droppable dataTransfer parsing error', e);
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
          console.warn('draggable dragstart setDragImage error', e);
        }
      }

      try {
        ev.dataTransfer.effectAllowed = effect;
        ev.dataTransfer.setData(type, transferData);
      } catch (e) {
        console.warn('draggable dragstart dataTransfer error', e);
      }
    }
  };
};

/**
 * Creates a "draggable" element
 * @param {Element} el The DOM element to apply to
 * @param {string} [options.type=application/json] Content Type
 * @param {string} [options.effect=move] DnD effect (cursor)
 * @param {Function} [options.ondragstart] Callback to event (ev) => {}
 * @param {Function} [options.ondragend] Callback to event (ev) => {}
 * @param {Function} [options.setDragImage] Set custom drag image (browser dependent)
 * @return {object} An object with a destructor
 */
export const draggable = (el, options = {}) => {
  const {type, effect, data, ondragstart, ondragend, setDragImage} = Object.assign({}, {
    type: 'application/json',
    effect: 'move',
    ondragstart: () => true,
    ondragend: () => true,
    setDragImage: null
  }, options);

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
 * @param {string} [options.type=application/json] Content Type
 * @param {string} [options.effect=move] DnD effect (cursor)
 * @param {Function} [options.ondragenter] Callback to event (ev) => {}
 * @param {Function} [options.ondragover] Callback to event (ev) => {}
 * @param {Function} [options.ondragleave] Callback to event (ev) => {}
 * @param {Function} [options.ondrop] Callback to event (ev, data, files) => {}
 * @return {object} An object with a destructor
 */
export const droppable = (el, options = {}) => {
  const {type, effect, ondragenter, ondragover, ondragleave, ondrop} = Object.assign({}, {
    type: 'application/json',
    effect: 'move',
    ondragenter: () => true,
    ondragover: () => true,
    ondragleave: () => true,
    ondrop: () => true
  }, options);

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
