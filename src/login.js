import {h, app} from 'hyperapp';
import {EventHandler} from '@osjs/common';

const createAttributes = (props, field, disabled) => {
  disabled = disabled ? 'disabled' : undefined;
  if (field.tagName === 'input') {
    if (field.attributes.type !== 'submit') {
      return Object.assign({}, {
        autocapitalize: 'off',
        autocomplete: 'off',
        disabled,
        oncreate: el => (el.value = props[field.attributes.name] || field.value || '')
      }, field.attributes);
    }
  }

  return Object.assign({disabled}, field.attributes);
};

const createFields = (props, fields, disabled) =>
  fields.map(f => h('div', {}, h(f.tagName, createAttributes(props, f, disabled))));


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
      title: 'Welcome to OS.js',
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
    this.$container.className = 'osjs-login';
    this.core.$root.appendChild(this.$container);

    this.render();
  }

  /**
   * Destroys the UI
   */
  destroy() {
    if (this.$container) {
      this.$container.remove();
    }
  }

  /**
   * Renders the UI
   */
  render() {
    const login = this.core.config('auth.login', {});
    const createView = (state, actions) => h('div', {}, [
      h('div', {
        class: 'osjs-login-error',
        style: {display: state.error ? 'block' : 'none'}
      }, h('span', {}, state.error)),
      h('div', {
        class: 'osjs-login-header'
      }, h('span', {}, this.options.title)),
      h('form', {
        loading: false,
        method: 'post',
        action: '#',
        autocomplete: 'off',
        onsubmit: actions.submit
      }, [
        ...createFields(state, this.options.fields, state.loading)
      ])
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
