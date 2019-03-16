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

import dateformat from 'dateformat';

const FALLBACK_LOCALE = 'en_EN';

// TODO
const prefixMap = {
  nb: 'nb_NO'
};

const sprintfRegex = /\{(\d+)\}/g;

const sprintfMatcher = args => (m, n) =>
  n in args ? args[n] : m;

const getDefaultLocale = (core, key) => core.config('locale.' + key);

const getUserLocale = (core, key, defaultLocale) => core.make('osjs/settings')
  .get('osjs/locale', key, defaultLocale);

/**
 * Gest the set localization
 * @param {Core} core OS.js Core IoC
 * @param {string} key Settings key (locales.*)
 * @return {object} An object with defaultLocale and userLocale
 */
export const getLocale = (core, key) => {
  const defaultLocale = getDefaultLocale(core, key);
  const userLocale = getUserLocale(core, key, defaultLocale);
  return {defaultLocale, userLocale};
};

/**
 * Gets a raw string from a tree of translations based on key
 *
 * Note that this function will fall back to a pre-configured locale
 * if the given locale names were not found.
 *
 * @private
 * @param {object}  list      The tree of translations
 * @param {string}  ul        User locale name
 * @param {string}  dl        Default locale name
 * @param {string}  k         The key to translate from tree
 * @return {string}           The raw string
 */
const getFromList = (list, ul, dl, k) => {
  const localizedList = list[ul] || list[dl] || list[FALLBACK_LOCALE] || {};
  return localizedList[k] || k;
};

/**
 * Translates a key + arguments from a tree of translations
 *
 * @example
 *  translate({en_EN: {foo: 'Hello {0}'}}, 'nb_NO', 'en_EN', 'foo', 'World') => 'Hello World'
 *
 * @private
 * @param {object}  list      The tree of translations
 * @param {string}  ul        User locale name
 * @param {string}  dl        Default locale name
 * @param {string}  k         The key to translate from tree
 * @param {...*}    args      A list of arguments that are defined in the translation string
 * @return {string}           The translated string
 */
const translate = (list, ul, dl, k, ...args) => {
  const fmt = getFromList(list, ul, dl, k);
  return fmt.replace(sprintfRegex, sprintfMatcher(args));
};

/**
 * Translates a given flat tree of locales
 *
 * Will automatically detect the current locale from the user.
 *
 * Returns a function that takes a key and returns the correct string.
 *
 * @example
 *  translatableFlat({en_EN: 'Hello World'}); // => 'Hello World'
 *
 * @param {object} list The tree of translations
 * @param {string} defaultValue Default value if none found
 * @return {string} The translated string
 */
export const translatableFlat = core => (list, defaultValue) => {
  const {defaultLocale, userLocale} = getLocale(core, 'language');

  return list[userLocale] || list[defaultLocale] || list[FALLBACK_LOCALE] || defaultValue;
};

/**
 * Translates a given tree of locales.
 *
 * Will automatically detect the current locale from the user.
 *
 * Returns a `translate` function that takes a key and list of arguments.
 *
 * @see translate
 * @example
 *  translatable({en_EN: {foo: 'Hello {0}'}})
 *    ('foo', 'World'); // => 'Hello World'
 * @param {string} k List key
 * @param {...args} Format arguments
 * @return {Function} A translation function
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
 * Formats a given Date to a specified format
 *
 * Will automatically detect the current locale from the user.
 *
 * Formats are 'shortDate', 'mediumDate', 'longDate', 'fullDate',
 *       'shortTime' and 'longTime'
 *
 * @param {Date} date Date object
 * @param {string} fmt Format
 * @return {string}
 */
export const format = core => (date, fmt) => {
  const {defaultLocale, userLocale} = getLocale(core, 'format.' + fmt);
  const useFormat = userLocale || defaultLocale || fmt;

  return dateformat(date, useFormat);
};

/**
 * Figures out what locale the browser is running as
 *
 * @param {string} [defaultLocale=en_EN] Default locale if none found
 * @return {string} The browser locale
 */
export const clientLocale = (function() {
  const nav = window.navigator || {};
  const browserLanguage = nav.userLanguage || nav.language || '';
  const get = l => prefixMap[l] ? prefixMap[l] : (l.match(/_/)
    ? l
    : (l ? `${l}_${l.toUpperCase()}` : ''));

  const langs = (nav.languages || [browserLanguage])
    .map(l => get(l.replace('-', '_')));

  const lang = langs[langs.length - 1];

  return (defaultLocale = 'en_EN') => (lang || defaultLocale);
})();
