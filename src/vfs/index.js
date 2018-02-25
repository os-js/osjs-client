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
  encodeQueryData,
  transformReaddir,
  transformArrayBuffer,
  request
} from './utils';

///////////////////////////////////////////////////////////////////////////////
// API
///////////////////////////////////////////////////////////////////////////////

/**
 * Read a directory
 *
 * @param {String} path The path to read
 * @param {Object} [options] Options
 * @return {Object[]} A list of files
 */
const readdir = async (path, options = {}) => {
  const response = await request('readdir', {
    path,
    options
  });

  return transformReaddir(path, response.body);
};

/**
 * Reads a file
 *
 * Available types are 'arraybuffer', 'blob', 'uri' and 'string'
 *
 * @param {String} path The path to read
 * @param {Object} [options] Options
 * @return {ArrayBuffer}
 */
const readfile = async (path, type = 'string', options = {}) => {
  const response = await request('readfile', {path, options});
  const result = await transformArrayBuffer(response.body, response.mime, type);
  return result;
};

/**
 * Writes a file
 * @param {String} path The path to write
 * @param {Object} [options] Options
 * @return {Number} File size
 */
const writefile = async (path, data, options = {}) =>
  (await request('writefile', {path, data, options})).body;

/**
 * Renames a file or directory (move)
 * @param {String} from The source (from)
 * @param {String} to The destination (to)
 * @param {Object} [options] Options
 * @return {Boolean}
 */
const rename = async (from, to, options = {}) =>
  (await request('rename', {from, to, options})).body;

/**
 * Creates a directory
 * @param {String} path The path to new directory
 * @param {Object} [options] Options
 * @return {Boolean}
 */
const mkdir = async (path, options = {}) =>
  (await request('mkdir', {path, options})).body;

/**
 * Removes a file or directory
 * @param {String} path The path to remove
 * @param {Object} [options] Options
 * @return {Boolean}
 */
const unlink = async (path, options = {}) =>
  (await request('unlink', {path, options})).body;

/**
 * Checks if path exists
 * @param {String} path The path to check
 * @param {Object} [options] Options
 * @return {Boolean}
 */
const exists = async (path, options = {}) =>
  (await request('exists', {path, options})).body;

/**
 * Gets the stats of the file or directory
 * @param {String} path The path to check
 * @param {Object} [options] Options
 * @return {Object}
 */
const stat = async (path, options = {}) =>
  (await request('stat', {path, options})).body;

/**
 * Gets an URL to a resource defined by file
 * @param {String} path The file
 * @param {Object} [options] Options
 * @return {String}
 */
const url = async (path, options = {}) => {
  const url = `/API/VFS/readfile?path=` + encodeURIComponent(path);
  return url;
};

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

export {
  readdir,
  readfile,
  writefile,
  rename,
  mkdir,
  unlink,
  exists,
  stat,
  url
};
