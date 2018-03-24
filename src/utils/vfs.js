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

/*
 * Get a GET query from data
 */
export const encodeQueryData = data => Object.keys(data)
  .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
  .join('&');

/*
 * Get parent directory
 */
export const parentDirectory = path => path
  .split('/')
  .filter((item, index, arr) => index < (arr.length - 1))
  .join('/');

/*
 * Sorts an array of files
 */
const sortFn = t => (k, d) => (a, b) => {
  if (t === 'string') {
    return d === 'asc'
      ? String(a[k]).localeCompare(b[k])
      : String(b[k]).localeCompare(a[k]);
  } else if (t === 'date') {
    return d === 'asc'
      ? (new Date(a[k])) > (new Date(b[k]))
      : (new Date(b[k])) > (new Date(a[k]));
  }

  return (
    (a[k] < b[k])
      ? -1
      : ((a[k] > b[k])
        ? (d === 'asc' ? 1 : 0)
        : (d === 'asc' ? 0 : 1)));
};

/*
 * Map of sorters from readdir attributes
 */
const sortMap = {
  size: sortFn('number'),
  mtime: sortFn('date'),
  ctime: sortFn('date'),
  atime: sortFn('date')
};

/**
 * Creates "special" directory entries
 * @param {String} path The path to the readdir root
 * @return {Object[]}
 */
const createSpecials = path => {
  const specials = [];

  if (path !== '/') {
    specials.push({
      isDirectory: true,
      isFile: false,
      mime: null,
      stat: {},
      filename: '..',
      path: parentDirectory(path) || '/'
    });
  }

  return specials;
};

/**
 * Creates a FileReader (promisified)
 * @param {String} method The method to call
 * @param {ArrayBuffer} ab The ArrayBuffer
 * @param {String} mime The MIME type
 * @return {Promise}
 */
const createFileReader = (method, ab, mime) => new Promise((resolve, reject) => {
  const b = new Blob([ab], {type: mime});
  const r = new FileReader();
  r.onerror = e => reject(e);
  r.onloadend = () => resolve(r.result);
  r[method](b);
});

/**
 * Converts a number (bytez) into human-readable string
 * @param {Number} bytes Input
 * @param {Boolean} [si=false] Use SI units
 * @return {String}
 */
export const humanFileSize = (bytes, si = false) => {
  if (isNaN(bytes) || typeof bytes !== 'number') {
    bytes = 0;
  }

  const thresh = si ? 1000 : 1024;
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  if (bytes < thresh) {
    return bytes + ' B';
  }

  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh);

  return `${bytes.toFixed(1)} ${units[u]}`;
};

/**
 * Transforms a readdir result
 * @param {String} path The path to the readdir root
 * @param Object[] files An array of readdir results
 * @param {Object} options Options
 * @param {Function} [options.filter] A filter
 * @param {String} [options.sortBy='filename'] Sort by this attribute
 * @param {String} [options.sortDir='asc'] Sort in this direction
 * @return {Object[]}
 */
export const transformReaddir = (path, files, options = {}) => {
  options = Object.assign({}, {
    sortBy: 'filename',
    sortDir: 'asc'
  }, options);

  let {sortDir, sortBy, filter} = options;
  if (typeof filter !== 'function') {
    filter = () => true;
  }

  if (['asc', 'desc'].indexOf(sortDir) === -1) {
    sortDir = 'asc';
  }

  const sorter = sortMap[sortBy]
    ? sortMap[sortBy]()
    : sortFn('string');

  const modify = (file) => Object.assign(file, {
    humanSize: humanFileSize(file.size)
  });

  const sortedSpecial = createSpecials(path)
    .sort(sorter(sortBy, sortDir))
    .map(modify);

  const sortedDirectories = files.filter(file => file.isDirectory)
    .sort(sorter(sortBy, sortDir))
    .filter(filter)
    .map(modify);

  const sortedFiles = files.filter(file => !file.isDirectory)
    .sort(sorter(sortBy, sortDir))
    .filter(filter)
    .map(modify);

  return [
    ...sortedSpecial,
    ...sortedDirectories,
    ...sortedFiles
  ];
};

/**
 * Transform an ArrayBuffer
 * @param {ArrayBuffer} ab The ArrayBuffer
 * @param {String} mime The MIME type
 * @param {String} type Transform to this type
 * @return {DOMString|String|Blob|ArrayBuffer}
 */
export const transformArrayBuffer = async (ab, mime, type) => {
  if (type === 'string') {
    return createFileReader('readAsText', ab, mime);
  } else if (type === 'uri') {
    return createFileReader('readAsDataURL', ab, mime);
  } else if (type === 'blob') {
    return new Blob([ab], {type: mime});
  }

  return ab;
};

/**
 * Performs a VFS HTTP request
 * @param {String} fn The function name on the server
 * @param {*} data The HTTP body
 * @param {Object} [fetchOptions] Options to pass on to 'fetct'
 * @return {Object}
 */
export const request = async (fn, data, fetchOptions = {}) => {
  fetchOptions = Object.assign({}, {
    method: 'GET',
    headers: []
  }, fetchOptions);

  const method = fetchOptions.method.toUpperCase();
  const body = method === 'GET' ? null : data;
  const query = method === 'GET' ? '?' + encodeQueryData(data) : '';

  // FIXME
  const url = OSjs.url(`/vfs/${fn}` + query);

  const response = await fetch(url, {
    headers: fetchOptions.headers,
    method,
    body
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream';

  let result;
  if (contentType.includes('application/json')) {
    result = await response.json();
  } else {
    result = await response.arrayBuffer();
  }

  return {mime: contentType, body: result};
};

