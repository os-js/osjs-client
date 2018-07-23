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
import {h, app} from 'hyperapp';
import {EventHandler} from '@osjs/common';

const createAttributes = (props, field, disabled) => {
  disabled = disabled ? 'disabled' : undefined;
  if (field.tagName === 'input') {
    if (field.attributes.type !== 'submit') {
      return Object.assign({}, {
        autocapitalize: 'off',
        autocomplete: 'new-' + field.attributes.name,
        disabled,
        oncreate: el => (el.value = props[field.attributes.name] || field.value || '')
      }, field.attributes);
    }
  }

  return Object.assign({disabled}, field.attributes);
};

const createFields = (props, fields, disabled) => {
  const children = f => {
    if (f.tagName === 'select' && f.choices) {
      return f.choices.map(c => h('option', {
        current: c.current ? 'current' : undefined,
        value: c.value
      }, c.label));
    }

    return [];
  };

  return fields.map(f => h('div', {
    class: 'osjs-login-field osjs-login-field-' + f.tagName
  }, h(f.tagName, createAttributes(props, f, disabled), children(f))));
};


/**
 * OS.js Login UI
 *
 * @desc Handles the Login UI and its events
 */
export default class Login extends EventHandler {

  /**
   * Create authentication handler
   *
   * @param {Core} core Core reference
   * @param {Object} [options] Options
   * @param {String} [options.title] Title
   * @param {Array} [options.fields] Fields
   */
  constructor(core, options) {
    super('Login');

    this.$container = null;
    this.core = core;
    this.options = Object.assign({
      id: 'osjs-login',
      title: 'Welcome to OS.js',
      stamp: core.config('version'),
      logo: {
        position: 'top',
        src: null
      },
      fields: [{
        tagName: 'input',
        attributes: {
          name: 'username',
          type: 'text',
          placeholder: 'Username'
        }
      }, {
        tagName: 'input',
        attributes: {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      }, {
        tagName: 'input',
        attributes: {
          type: 'submit',
          value: 'Login'
        }
      }]
    }, options);
  }

  /**
   * Initializes the UI
   */
  init(startHidden) {
    this.$container = document.createElement('div');
    this.$container.id = this.options.id;
    this.$container.className = 'osjs-login-base';
    this.core.$root.classList.add('login');
    this.core.$root.appendChild(this.$container);

    this.render(startHidden);
  }

  /**
   * Destroys the UI
   */
  destroy() {
    this.core.$root.classList.remove('login');

    if (this.$container) {
      this.$container.remove();
    }
  }

  /**
   * Renders the UI
   */
  render(startHidden) {
    const {src, position} = this.options.logo;
    const login = this.core.config('auth.login', {});

    const logo = () =>
      h('div', {
        class: 'osjs-login-logo',
        'data-position': position,
        style: {
          backgroundImage: `url('${src}')`
        }
      });

    const fields = state => {
      const result = createFields(state, this.options.fields, state.loading);

      if (src && position === 'bottom') {
        result.push(logo());
      }

      if (this.options.stamp) {
        result.push(h('div', {
          class: 'osjs-login-stamp'
        }, this.options.stamp));
      }

      return result;
    };

    const createView = (state, actions) => {
      const header = [];

      if (this.options.title) {
        header.push(h('div', {
          class: 'osjs-login-header'
        }, h('span', {}, this.options.title)));
      }

      if (src && ['top', 'middle'].indexOf(position) !== -1) {
        const m = position === 'top'
          ? 'unshift'
          : 'push';

        header[m](logo());
      }

      const createSide = side => position === side
        ? h('div', {'data-position': position}, logo())
        : null;

      const left = () => createSide('left');
      const right = () => createSide('right');
      const middle = () => h('div', {class: 'osjs-login-content'}, children);

      const formFields = fields(state);

      const children = [
        ...header,

        h('div', {
          class: 'osjs-login-error',
          style: {display: state.error ? 'block' : 'none'}
        }, h('span', {}, state.error)),
        h('form', {
          loading: false,
          method: 'post',
          action: '#',
          autocomplete: 'off',
          onsubmit: actions.submit
        }, formFields)
      ];

      return h('div', {
        class: 'osjs-login',
        id: this.options.id,
        style: {display: state.hidden ? 'none' : undefined}
      }, [left(), middle(), right()].filter(el => !!el));
    };

    const a = app(Object.assign({
      hidden: startHidden
    }, login), {
      setLoading: loading => state => ({loading}),
      setError: error => state => ({error, hidden: false}),
      submit: ev => state => {
        ev.preventDefault();

        if (state.loading) {
          return;
        }

        const values = Array.from(ev.target.elements)
          .filter(el => el.type !== 'submit')
          .reduce((o, el) => Object.assign(o, {[el.name] : el.value}), {});

        this.emit('login:post', values);
      }
    }, createView, this.$container);

    this.on('login:start', () => a.setLoading(true));
    this.on('login:stop', () => a.setLoading(false));
    this.on('login:error', err => a.setError(err));
  }

}
