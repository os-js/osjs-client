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

const supportsNativeNotification = 'Notification' in window;

/**
 * Creates a new CSS DOM element
 * @param {Element} root Root node
 * @param {string} src Source
 * @return {Promise<ScriptElement, Error>}
 */
export const style = (root, src) => new Promise((resolve, reject) => {
  const el = document.createElement('link');
  el.setAttribute('rel', 'stylesheet');
  el.setAttribute('type', 'text/css');
  el.onload = () => resolve(el);
  el.onerror = (err) => reject(err);
  el.setAttribute('href', src);

  root.appendChild(el);

  return el;
});

/**
 * Creates a new Script DOM element
 * @param {Element} root Root node
 * @param {string} src Source
 * @return {Promise<StyleElement>, Error>}
 */
export const script = (root, src) => new Promise((resolve, reject) => {
  const el = document.createElement('script');
  el.onreadystatechange = function() {
    if ((this.readyState === 'complete' || this.readyState === 'loaded')) {
      resolve(el);
    }
  };
  el.onerror = (err) => reject(err);
  el.onload = () => resolve(el);
  el.src = src;

  root.appendChild(el);

  return el;
});


/**
 * Escape text so it is "safe" for HTML usage
 * @param {string} text Input text
 * @return {string}
 */
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent;
};

/**
 * Serialize an object to CSS
 * @param {object} obj Object
 * @return {string} CSS text
 */
export const createCssText = (obj) => Object.keys(obj)
  .map(k => [k, k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()])
  .map(k => `${k[1]}: ${obj[k[0]]}`)
  .join(';');

/**
 * Inserts a tab in the given event target
 * @param {Event} ev DOM Event
 */
export const handleTabOnTextarea = ev => {
  const input = ev.target;
  let {selectionStart, selectionEnd, value} = input;

  input.value = value.substring(0, selectionStart)
    + '\t'
    + value.substring(selectionEnd, value.length);

  selectionStart++;

  input.selectionStart = selectionStart;
  input.selectionEnd = selectionStart;
};

/*
 * Get active element if belonging to root
 * @param {Element} root DOM Element
 * @return {Element|null}
 */
export const getActiveElement = (root) => {
  if (root) {
    const ae = document.activeElement;

    return root.contains(ae) ? ae : null;
  }

  return null;
};

/**
 * Checks if passive events is supported
 * @link https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 * @return {boolean}
 */
export const supportsPassive = (function() {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => (supportsPassive = true)
    });

    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {/* noop */}

  return () => supportsPassive;
})();

/**
 * Plays a sound
 * @param {string} src Sound source
 * @param {object} [options] Options
 * @return {Promise<HTMLAudioElement>}
 */
export const playSound = (src, options = {}) => {
  const opts = Object.assign({
    volume: 1.0
  }, options);

  const audio = new Audio();
  audio.voule = opts.volume;
  audio.src = src;

  try {
    const p = audio.play();
    if (p instanceof Promise) {
      return p.then(() => audio)
        .catch(err => console.warn('Failed to play sound', src, err));
    }
  } catch (e) {
    console.warn('Failed to play sound', src, e);
  }

  return Promise.resolve(audio);
};

/**
 * Gets supported media types
 * @return {object}
 */
export const supportedMedia = () => {
  const videoFormats = {
    mp4: 'video/mp4',
    ogv: 'video/ogg'
  };

  const audioFormats = {
    mp3: 'audio/mpeg',
    mp4: 'audio/mp4',
    oga: 'audio/ogg'
  };

  const reduce = (list, elem) => Object.keys(list)
    .reduce((result, format) => {
      return Object.assign({
        [format]: elem.canPlayType(list[format]) === 'probably'
      }, result);
    }, {});

  return {
    audio: reduce(audioFormats, document.createElement('audio')),
    video: reduce(videoFormats, document.createElement('video'))
  };
};

/**
 * Gets if CSS transitions is supported
 * @return {boolean}
 */
export const supportsTransition = (function() {
  const el = document.createElement('div');
  const tests = ['WebkitTransition', 'MozTransition', 'OTransition', 'transition'];
  const supported = tests.some(name => typeof el.style[name] !== 'undefined');

  return () => supported;
})();

/**
 * Creates a native notification
 * @param {object} options Notification options
 * @param {Function} [onclick] Callback on click
 * @return {Promise<window.Notification>}
 */
export const createNativeNotification = (options, onclick) => {
  const Notif = window.Notification;

  const create = () => {
    const notification = new Notif(
      options.title,
      {
        body: options.message,
        icon: options.icon
      }
    );

    notification.onclick = onclick;

    return notification;
  };

  if (supportsNativeNotification) {
    if (Notif.permission === 'granted') {
      return Promise.resolve(create());
    } else if (Notif.permission !== 'denied') {
      return new Promise((resolve, reject) => {
        Notif.requestPermission(permission => {
          return permission === 'granted' ? resolve(true) : reject(permission);
        });
      }).then(create);
    }
  }

  return Promise.reject('Unsupported');
};
