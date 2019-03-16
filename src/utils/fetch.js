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

/*
 * Creates URL request path
 */
const encodeQueryData = data => Object.keys(data)
  .filter(k => typeof data[k] !== 'object')
  .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
  .join('&');

const bodyTypes = [
  window.ArrayBuffer,
  window.ArrayBufferView,
  window.Blob,
  window.File,
  window.URLSearchParams,
  window.FormData
].filter(t => !!t);

/*
 * Creates fetch() options
 */
const createFetchOptions = (url, options, type) => {
  const fetchOptions = Object.assign({}, {
    credentials: 'same-origin',
    method: 'get',
    headers: {}
  }, options);

  if (type === 'json') {
    fetchOptions.headers = Object.assign(fetchOptions.headers, {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    });
  }

  if (fetchOptions.body && fetchOptions.method.toLowerCase() === 'get') {
    url += '?' + encodeQueryData(fetchOptions.body);
    delete fetchOptions.body;
  }

  const hasBody = typeof fetchOptions.body !== 'undefined';
  const stringBody = typeof fetchOptions.body === 'string';

  if (type === 'json' && (hasBody && !stringBody)) {
    if (!(fetchOptions.body instanceof FormData)) {
      const found = bodyTypes.find(t => (fetchOptions.body instanceof t));
      if (!found) {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }
    }
  }

  return [url, fetchOptions];
};

/**
 * Make a HTTP request
 *
 * @param {string} url The endpoint
 * @param {Options} [options] fetch options
 * @param {string} [type] Request / Response type
 * @return {*}
 */
export const fetch = (url, options = {}, type = null) => {
  const [target, fetchOptions] = createFetchOptions(url, options, type);

  const createErrorRejection = (response, error) =>
    Promise.reject(new Error(error
      ? error
      : `${response.status} (${response.statusText})`));

  return window.fetch(target, fetchOptions)
    .then(response => {
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        const method = contentType && contentType.indexOf('application/json') !== -1
          ? 'json'
          : 'text';

        return response[method]()
          .then(data => createErrorRejection(response, data.error));
      }

      return type === 'json'
        ? response.json()
        : response;
    });
};
