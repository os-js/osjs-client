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
  transformArrayBuffer
} from '../utils/vfs';

/**
 * Read a directory
 *
 * @param {String} path The path to read
 * @param {Object} [options] Options
 * @return {Object[]} A list of files
 */
export const readdir = transport => async (path, options = {}) => {
  const result = await transport.readdir(path, options);

  return transformReaddir(path, result, {
    filter: options.filter
  });
};

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
export const readfile = transport => async (path, type = 'string', options = {}) => {
  const response = await transport.readfile(path, type, options);
  const result = await transformArrayBuffer(response.body, response.mime, type);
  return result;
};

/**
 * Writes a file
 * @param {String} path The path to write
 * @param {ArrayBuffer|Blob|String} data The data
 * @param {Object} [options] Options
 * @return {Number} File size
 */
export const writefile = transport => async (path, data, options = {}) =>
  transport.writefile(path, data, options);

/**
 * Renames a file or directory (move)
 * @param {String} from The source (from)
 * @param {String} to The destination (to)
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const rename = transport => async (from, to, options = {}) =>
  transport.rename(from, to, options);

/**
 * Creates a directory
 * @param {String} path The path to new directory
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const mkdir = transport => async (path, options = {}) =>
  transport.mkdir(path, options);

/**
 * Removes a file or directory
 * @param {String} path The path to remove
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const unlink = transport => async (path, options = {}) =>
  transport.unlink(path, options);

/**
 * Checks if path exists
 * @param {String} path The path to check
 * @param {Object} [options] Options
 * @return {Boolean}
 */
export const exists = transport => async (path, options = {}) =>
  transport.exists(path, options);

/**
 * Gets the stats of the file or directory
 * @param {String} path The path to check
 * @param {Object} [options] Options
 * @return {Object}
 */
export const stat = transport => async (path, options = {}) =>
  transport.stat(path, options);

/**
 * Gets an URL to a resource defined by file
 * @param {String} path The file
 * @param {Object} [options] Options
 * @return {String}
 */
export const url = transport => async (path, options = {}) =>
  transport.url(path, options);
