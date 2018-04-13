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

import Transport from '../transport';

/**
 * System VFS Transport Module
 *
 * @desc Provides filesystem via the OS.js server
 */
export default class SystemTransport extends Transport {

  async _request(fn, body, fetchOptions = {}, type) {
    const url = this.core.url(`/vfs/${fn}`);
    const response = await this.core.request(url, Object.assign({
      body
    }, fetchOptions), type);

    if (type === 'json') {
      return {mime: 'application/json', body: response};
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const result = await response.arrayBuffer();

    return {mime: contentType, body: result};
  }

  async readdir(path, options = {}) {
    const response = await this._request('readdir', {
      path,
      options: {}
    }, {}, 'json');

    return response.body;
  }

  async readfile(path, type = 'string', options = {}) {
    const response = await this._request('readfile', {path, options});
    return response;
  }

  async writefile(path, data, options = {}) {
    const formData = new FormData();
    const writeStream = (data instanceof ArrayBuffer || data instanceof Blob)
      ? data
      : new Blob([data], {type: 'application/octet-stream'});

    formData.append('upload', writeStream);
    formData.append('path', path);
    formData.append('options', options);

    const response = await this._request('writefile', formData, {
      method: 'post'
    });

    return response.body;
  }

  async rename(from, to, options = {}) {
    const response = await this._request('rename', {from, to, options});
    return response.body;
  }

  async mkdir(path, options = {}) {
    const response = await this._request('mkdir', {path, options});
    return response.body;
  }

  async unlink(path, options = {}) {
    const response = await this._request('unlink', {path, options});
    return response.body;
  }

  async exists(path, options = {}) {
    const response = await this._request('exists', {path, options});
    return response.body;
  }

  async stat(path, options = {}) {
    const response = await this._request('stat', {path, options});
    return response.body;
  }

  async url(path, options = {}) {
    const url = `/vfs/readfile?path=` + encodeURIComponent(path);
    return url;
  }

}
