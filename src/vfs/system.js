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

const adapter = (core) => {

  const request = async (fn, body, fetchOptions = {}, type) => {
    const url = core.url(`/vfs/${fn}`);
    const response = await core.request(url, Object.assign({
      body
    }, fetchOptions), type);

    if (type === 'json') {
      return {mime: 'application/json', body: response};
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const result = await response.arrayBuffer();

    return {mime: contentType, body: result};
  };

  return {
    readdir: async (path, options) => {
      const response = await request('readdir', {
        path,
        options: {}
      }, {}, 'json');

      return response.body;
    },

    readfile: async (path, type, options) => {
      const response = await request('readfile', {path, options});
      return response;
    },

    writefile: async (path, data, options) => {
      const formData = new FormData();
      formData.append('upload', data);
      formData.append('path', path);
      formData.append('options', options);

      const response = await request('writefile', formData, {
        method: 'post'
      });

      return response.body;
    },

    copy: async (from, to, options) => {
      const response = await request('copy', {from, to, options});
      return response.body;
    },

    rename: async (from, to, options) => {
      const response = await request('rename', {from, to, options});
      return response.body;
    },

    mkdir: async (path, options) => {
      const response = await request('mkdir', {path, options});
      return response.body;
    },

    unlink: async (path, options) => {
      const response = await request('unlink', {path, options});
      return response.body;
    },

    exists: async (path, options) => {
      const response = await request('exists', {path, options});
      return response.body;
    },

    stat: async (path, options) => {
      const response = await request('stat', {path, options});
      return response.body;
    },

    url: async (path, options) => {
      const url = `/vfs/readfile?path=` + encodeURIComponent(path);
      return url;
    }
  };

};

export default adapter;
