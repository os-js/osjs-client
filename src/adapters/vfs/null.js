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

/**
 * Null VFS adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const nullAdapter = ({
  readdir: (path, options) => Promise.resolve([]),
  readfile: (path, type, options) => Promise.resolve({body: new ArrayBuffer(), mime: 'application/octet-stream'}),
  writefile: (path, data, options) => Promise.resolve(-1),
  copy: (from, to, options) => Promise.resolve(false),
  rename: (from, to, options) => Promise.resolve(false),
  mkdir: (path, options) => Promise.resolve(false),
  unlink: (path, options) => Promise.resolve(false),
  exists: (path, options) => Promise.resolve(false),
  stat: (path, options) => Promise.resolve({}),
  url: (path, options) => Promise.resolve(null),
  mount: options => Promise.resolve(true),
  unmount: options => Promise.resolve(true),
  search: (root, pattern, options) => Promise.resolve([]),
  touch: (path, options) => Promise.resolve(false)
});

export default nullAdapter;
