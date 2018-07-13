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

import {
  transformReaddir,
  transformArrayBuffer,
  createFileIter
} from '../utils/vfs';

/**
 * Read a directory
 *
 * @param {String} path The path to read
 * @param {Object} [options] Options
 * @return {Object[]} A list of files
 */
export const readdir = adapter => (path, options = {}) =>
  adapter.readdir(path, options)
    .then(result => result.map(stat => createFileIter(stat)))
    .then(result => transformReaddir(path, result, {
      showHiddenFiles: options.showHiddenFiles !== false,
      filter: options.filter
    }));

/**
 * Reads a file
 *
 * Available types are 'arraybuffer', 'blob', 'uri' and 'string'
 *
 * @param {String} path The path to read
 * @param {String} [type=string] Return this content type
 * @param {Object} [options] Options
 * @return {ArrayBuffer}
 */
export const readfile = adapter => (path, type = 'string', options = {}) =>
  adapter.readfile(path, type, options)
    .then(response => transformArrayBuffer(response.body, response.mime, type));

/**
 * Writes a file
 * @param {String} path The path to write
 * @param {ArrayBuffer|Blob|String} data The data
 * @param {Object} [options] Options
 * @return {Number} File size
 */
export const writefile = adapter => (path, data, options = {}) => {
  const binary = (data instanceof ArrayBuffer || data instanceof Blob)
    ? data
    : new Blob([data], {type: 'application/octet-stream'});

  return adapter.writefile(path, binary, options);
};

/**
 * Copies a file or directory (move)
 * @param {String} from The source (from)
 * @param {String} to The destination (to)
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const copy = adapter => (from, to, options = {}) =>
  adapter.copy(from, to, options);

/**
 * Renames a file or directory (move)
 * @param {String} from The source (from)
 * @param {String} to The destination (to)
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const rename = adapter => (from, to, options = {}) =>
  adapter.rename(from, to, options);

/**
 * Creates a directory
 * @param {String} path The path to new directory
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const mkdir = adapter => (path, options = {}) =>
  adapter.mkdir(path, options);

/**
 * Removes a file or directory
 * @param {String} path The path to remove
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const unlink = adapter => (path, options = {}) =>
  adapter.unlink(path, options);

/**
 * Checks if path exists
 * @param {String} path The path to check
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const exists = adapter => (path, options = {}) =>
  adapter.exists(path, options);

/**
 * Gets the stats of the file or directory
 * @param {String} path The path to check
 * @param {Object} [options] Options
 * @return {Object}
 */
export const stat = adapter => (path, options = {}) =>
  adapter.stat(path, options)
    .then(stat => createFileIter(stat));

/**
 * Gets an URL to a resource defined by file
 * @param {String} path The file
 * @param {Object} [options] Options
 * @return {String}
 */
export const url = adapter => (path, options = {}) =>
  adapter.url(path, options);
