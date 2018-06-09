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

import dateformat from 'dateformat';

const sprintfRegex = /\{(\d+)\}/g;

const sprintfMatcher = args => (m, n) =>
  n in args ? args[n] : m;

const getDefaultLocale = (core, key) => core.config('locale.' + key);

const getUserLocale = (core, key, defaultLocale) => core.make('osjs/settings')
  .get('osjs/locale.' + key, defaultLocale);

const getLocale = (core, key) => {
  const defaultLocale = getDefaultLocale(core, key);
  const userLocale = getUserLocale(core, key, defaultLocale);
  return {defaultLocale, userLocale};
};

const getFromList = (list, ul, dl, k) => {
  const localizedList = list[ul] || list[dl];
  return localizedList[k] || k;
};

const translate = (list, ul, dl, k, ...args) => {
  const fmt = getFromList(list, ul, dl, k);
  return fmt.replace(sprintfRegex, sprintfMatcher(args));
};

/**
 * Translates a given flat list of locales
 *
 * @desc Automatically translates using user locale if available.
 * @example
 *  translatableFlat({en_EN: 'Hello World'}); // => 'Hello World'
 *
 * @param {Object} list The list
 * @param {String} defaultValue Default value if none found
 * @return {String}
 */
export const translatableFlat = core => (list, defaultValue) => {
  const {defaultLocale, userLocale} = getLocale(core, 'language');
  return list[userLocale] || list[defaultLocale] || defaultValue;
};

/**
 * Translates a given list of locales
 *
 * @desc Automatically translates using user locale if available.
 * @example
 *  translatable({en_EN: {foo: 'Hello {0}'}})
 *    ('foo', 'World'); // => 'Hello World'
 * @param {String} k List key
 * @param {...args} Format arguments
 * @return {String}
 */
export const translatable = core => list => {
  const {defaultLocale, userLocale} = getLocale(core, 'language');

  return (k, ...args) => translate(
    list,
    userLocale,
    defaultLocale,
    k,
    ...args
  );
};

/**
 * Formats a given Date to a format
 * @desc Formats are 'shortDate', 'mediumDate', 'longDate', 'fullDate',
 *       'shortTime' and 'longTime'
 * @param {Date} date Date object
 * @param {String} fmt Format
 * @return {String}
 */
export const format = core => (date, fmt) => {
  const {defaultLocale, userLocale} = getLocale(core, 'format.' + fmt);
  const useFormat = userLocale || defaultLocale || fmt;
  return dateformat(date, useFormat);
};
