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

  const request = (fn, body, fetchOptions = {}, type) =>
    core.request(core.url(`/vfs/${fn}`), Object.assign({
      body
    }, fetchOptions), type)
      .then(response => {
        if (type === 'json') {
          return {mime: 'application/json', body: response};
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        return response.arrayBuffer().then(result => ({
          mime: contentType,
          body: result
        }));
      });

  return {
    readdir: ({path}, options) => request('readdir', {
      path,
      options: {}
    }, {}, 'json').then(({body}) => body),

    readfile: ({path}, type, options) =>
      request('readfile', {path, options}),

    writefile: ({path}, data, options) => {
      const formData = new FormData();
      formData.append('upload', data);
      formData.append('path', path);
      formData.append('options', options);

      return request('writefile', formData, {
        method: 'post'
      }).then(({body}) => body);
    },

    copy: (from, to, options) =>
      request('copy', {from: from.path, to: to.path, options}).then(({body}) => body),

    rename: (from, to, options) =>
      request('rename', {from: from.path, to: to.path, options}).then(({body}) => body),

    mkdir: ({path}, options) =>
      request('mkdir', {path, options}).then(({body}) => body),

    unlink: ({path}, options) =>
      request('unlink', {path, options}).then(({body}) => body),

    exists: ({path}, options) =>
      request('exists', {path, options}).then(({body}) => body),

    stat: ({path}, options) =>
      request('stat', {path, options}).then(({body}) => body),

    url: ({path}, options) =>
      Promise.resolve(`/vfs/readfile?path=${encodeURIComponent(path)}`),

    search: ({path}, pattern, options) =>
      request('search', {root: path, pattern, options}, {}, 'json')
        .then(({body}) => body),

    touch: ({path}, options) =>
      request('touch', {path, options}, {method: 'post'}).then(({body}) => body),

    download: ({path}, options = {}) => {
      const json = encodeURIComponent(JSON.stringify({download: true}));

      return Promise.resolve(`/vfs/readfile?options=${json}&path=` + encodeURIComponent(path))
        .then(url => {
          return (options.target || window).open(url);
        });
    }
  };

};

export default adapter;
