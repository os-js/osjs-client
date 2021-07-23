/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2020, Anders Evenrud <andersevenrud@gmail.com>
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
  const fetchOptions = {
    credentials: 'same-origin',
    method: 'get',
    headers: {},
    ...options
  };

  if (type === 'json') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    };
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
 * This is a fetch polyfill for XMLHttpRequest.
 * Mainly used to get upload progress indicator.
 */
const fetchXhr = (target, fetchOptions) => new Promise((resolve, reject) => {
  const req = new XMLHttpRequest();
  let onProgress = () => {};

  const onError = (msg) => (ev) => {
    console.warn(msg, ev);
    reject(new Error(msg));
  };

  const onLoad = () => {
    resolve({
      status: req.status,
      statusText: req.statusText,
      ok: req.status >= 200 && req.status <= 299,
      headers: {
        get: k => req.getResponseHeader(k)
      },
      text: () => Promise.resolve(JSON.responseText),
      json: () => Promise.resolve(JSON.parse(req.responseText)),
      arrayBuffer: () => Promise.resolve(req.response)
    });
  };

  if (typeof fetchOptions.onProgress === 'function') {
    onProgress = (ev) => {
      if (ev.lengthComputable) {
        const percentComplete = ev.loaded / ev.total * 100;
        fetchOptions.onProgress(ev, percentComplete);
      }
    };
  }

  req.addEventListener('load', onLoad);
  req.addEventListener('error', onError('An error occured while performing XHR request'));
  req.addEventListener('abort', onError('XHR request was aborted'));
  req.addEventListener('progress', onProgress);
  req.open(fetchOptions.method, target);
  Object.entries(fetchOptions.headers).forEach(([k, v]) => req.setRequestHeader(k, v));
  req.responseType = fetchOptions.responseType || '';
  req.send(fetchOptions.body);
});

/**
 * Make a HTTP request
 *
 * @param {string} url The endpoint
 * @param {Options} [options] fetch options
 * @param {string} [type] Request / Response type
 * @return {Promise<*>}
 */
export const fetch = (url, options = {}, type = null) => {
  const [target, fetchOptions] = createFetchOptions(url, options, type);

  const createErrorRejection = (response, error) =>
    Promise.reject(new Error(error
      ? error
      : `${response.status} (${response.statusText})`));

  const op = options.xhr
    ? fetchXhr(target, fetchOptions)
    : window.fetch(target, fetchOptions);

  return op
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
