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

import {
  transformReaddir,
  transformArrayBuffer,
  createFileIter
} from './utils/vfs';

// Makes sure our input paths are object(s)
const pathToObject = path => Object.assign({
  id: null,
}, typeof path === 'string' ? {path} : path);

// Handles directory listing result(s)
const handleDirectoryList = (path, options) => result =>
  Promise.resolve(result.map(stat => createFileIter(stat)))
    .then(result => transformReaddir(pathToObject(path), result, {
      showHiddenFiles: options.showHiddenFiles !== false,
      filter: options.filter
    }));

/**
 * Read a directory
 *
 * @param {object|string} path The path to read
 * @param {object} [options] Options
 * @return {Promise<object[], Error>} A list of files
 */
export const readdir = (adapter, mount) => (path, options = {}) =>
  adapter.readdir(pathToObject(path), options, mount)
    .then(handleDirectoryList(path, options));

/**
 * Reads a file
 *
 * Available types are 'arraybuffer', 'blob', 'uri' and 'string'
 *
 * @param {object|string} path The path to read
 * @param {string} [type=string] Return this content type
 * @param {object} [options] Options
 * @return {Promise<ArrayBuffer, Error>}
 */
export const readfile = (adapter, mount) => (path, type = 'string', options = {}) =>
  adapter.readfile(pathToObject(path), type, options, mount)
    .then(response => transformArrayBuffer(response.body, response.mime, type));

/**
 * Writes a file
 * @param {object|string} path The path to write
 * @param {ArrayBuffer|Blob|string} data The data
 * @param {object} [options] Options
 * @return {Promise<number, Error>} File size
 */
export const writefile = (adapter, mount) => (path, data, options = {}) => {
  const binary = (data instanceof ArrayBuffer || data instanceof Blob)
    ? data
    : new Blob([data], {type: 'application/octet-stream'});

  return adapter.writefile(pathToObject(path), binary, options, mount);
};

/**
 * Copies a file or directory (move)
 * @param {object|string} from The source (from)
 * @param {object|string} to The destination (to)
 * @param {object} [options] Options
 * @return {Promise<boolean, Error>}
 */
export const copy = (adapter, mount) => (from, to, options = {}) =>
  adapter.copy(pathToObject(from), pathToObject(to), options, mount);

/**
 * Renames a file or directory (move)
 * @param {object|string} from The source (from)
 * @param {object|string} to The destination (to)
 * @param {object} [options] Options
 * @return {Promise<boolean, Error>}
 */
export const rename = (adapter, mount) => (from, to, options = {}) =>
  adapter.rename(pathToObject(from), pathToObject(to), options, mount);

/**
 * Alias of 'readme'
 * @param {object|string} from The source (from)
 * @param {object|string} to The destination (to)
 * @param {object} [options] Options
 * @return {Promise<boolean, Error>}
 */
export const move = rename;

/**
 * Creates a directory
 * @param {object|string} path The path to new directory
 * @param {object} [options] Options
 * @return {Promise<boolean, Error>}
 */
export const mkdir = (adapter, mount) => (path, options = {}) =>
  adapter.mkdir(pathToObject(path), options, mount);

/**
 * Removes a file or directory
 * @param {object|string} path The path to remove
 * @param {object} [options] Options
 * @return {Promise<boolean, Error>}
 */
export const unlink = (adapter, mount) => (path, options = {}) =>
  adapter.unlink(pathToObject(path), options, mount);

/**
 * Checks if path exists
 * @param {object|string} path The path to check
 * @param {object} [options] Options
 * @return {Promise<boolean, Error>}
 */
export const exists = (adapter, mount) => (path, options = {}) =>
  adapter.exists(pathToObject(path), options, mount);

/**
 * Gets the stats of the file or directory
 * @param {object|string} path The path to check
 * @param {object} [options] Options
 * @return {Promise<object, Error>}
 */
export const stat = (adapter, mount) => (path, options = {}) =>
  adapter.stat(pathToObject(path), options, mount)
    .then(stat => createFileIter(stat));

/**
 * Gets an URL to a resource defined by file
 * @param {object|string} path The file
 * @param {object} [options] Options
 * @return {Promise<string, Error>}
 */
export const url = (adapter, mount) => (path, options = {}) =>
  adapter.url(pathToObject(path), options, mount);

/**
 * Initiates a native browser download of the file
 * @param {object|string} path The file
 * @param {object} [options] Options
 * @return {Promise<any>}
 */
export const download = (adapter, mount) => (path, options = {}) =>
  typeof adapter.download === 'function' && options.readfile !== true
    ? adapter.download(pathToObject(path), options, mount)
    : readfile(adapter)(path, 'blob')
      .then(body => {
        const filename = pathToObject(path).path.split('/').splice(-1)[0];
        const url = window.URL.createObjectURL(body);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);

        a.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          a.remove();
        }, 1);
      });

/**
 * Searches for files and folders
 * @param {object|string} root The root
 * @param {string} pattern Search pattern
 * @param {object} [options] Options
 * @return {Promise<object[], Error>} A list of files
 */
export const search = (adapter, mount) => (root, pattern, options = {}) => {
  if (mount.attributes && mount.attributes.searchable === false) {
    return Promise.resolve([]);
  }

  return adapter.search(pathToObject(root), pattern, options, mount)
    .then(handleDirectoryList(root, options));
};

/**
 * Touches a file
 * @param {object|string} path File path
 * @return {Promise<boolean, Error>}
 */
export const touch = (adapter, mount) => (path, options = {}) =>
  adapter.touch(pathToObject(path), options, mount);
