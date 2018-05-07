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

  fields.map(f => h('div', {
    class: 'osjs-login-field'
  }, h(f.tagName, createAttributes(props, f, disabled)), children(f)));
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
      stamp: OSJS_VERSION,
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
  init() {
    this.$container = document.createElement('div');
    this.$container.id = this.options.id;
    this.$container.className = 'osjs-login-base';
    this.core.$root.classList.add('login');
    this.core.$root.appendChild(this.$container);

    this.render();
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
  render() {
    const login = this.core.config('auth.login', {});
    const fields = state => {
      const result = createFields(state, this.options.fields, state.loading);

      if (this.options.stamp) {
        result.push(h('div', {
          class: 'osjs-login-stamp'
        }, this.options.stamp));
      }

      return result;
    };

    const createView = (state, actions) => h('div', {
      class: 'osjs-login',
      id: this.options.id
    }, [
      h('div', {
        class: 'osjs-login-header'
      }, h('span', {}, this.options.title)),
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
      }, fields(state))
    ]);

    const a = app(Object.assign({}, login), {
      setLoading: loading => state => ({loading}),
      setError: error => state => ({error}),
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
