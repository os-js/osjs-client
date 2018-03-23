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

/**
 * Creates a new CSS DOM element
 * @param {Element} root Root node
 * @param {String} src Source
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
});

/**
 * Creates a new Script DOM element
 * @param {Element} root Root node
 * @param {String} src Source
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
});


/**
 * Escape text so it is "safe" for HTML usage
 * @param {String} text Input text
 * @return {String}
 */
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent;
};

/**
 * Serialize an object to CSS
 * @param {Object} obj Object
 * @return {String} CSS text
 */
export const createCssText = (obj) => Object.keys(obj)
  .map(k => [k, k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()])
  .map(k => `${k[1]}: ${obj[k[0]]}`)
  .join(';');

/**
 * Gets a configuration entry by key
 *
 * You can specify this as 'foo.bar.baz' to resolve {foo: {bar: {baz: 'Hello World'}}}
 * and get "Hello World" back.
 *
 * @param {String} key The key to get the value from
 * @param {*} [defaultValue] If result is undefined, return this instead
 * @return {*}
 */
export const resolveTreeByKey = (tree, key, defaultValue) => {
  let result;

  try {
    result = key
      .split(/\./g)
      .reduce((result, key) => result[key], Object.assign({}, tree));
  } catch (e) { /* noop */ }

  return typeof result === 'undefined' ? defaultValue : result;
};

