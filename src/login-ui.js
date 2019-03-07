import {h, app} from 'hyperapp';
import {EventEmitter} from '@osjs/event-emitter';

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

    return f.children || [];
  };

  return fields.map(f => h('div', {
    class: 'osjs-login-field osjs-login-field-' + f.tagName
  }, h(f.tagName, createAttributes(props, f, disabled), children(f))));
};

const createView = (options) => {
  const {src, position} = options.logo;

  const logo = () =>
    h('div', {
      class: 'osjs-login-logo',
      'data-position': position,
      style: {
        backgroundImage: `url('${src}')`
      }
    });

  const fields = state => {
    const result = createFields(state, options.fields, state.loading);

    if (src && position === 'bottom') {
      result.push(logo());
    }

    if (options.stamp) {
      result.push(h('div', {
        class: 'osjs-login-stamp'
      }, options.stamp));
    }

    return result;
  };

  return (state, actions) => {
    const header = [];

    if (options.title) {
      header.push(h('div', {
        class: 'osjs-login-header'
      }, h('span', {}, options.title)));
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
      id: options.id,
      style: {display: state.hidden ? 'none' : undefined}
    }, [left(), middle(), right()].filter(el => !!el));
  };
};

const create = (options, login, startHidden, $container) => {
  const ee = new EventEmitter('LoginUI');
  const view = createView(options);
  const a = app(Object.assign({
    hidden: startHidden
  }, login), {
    setLoading: loading => ({loading}),
    setError: error => ({error, hidden: false}),
    submit: ev => state => {
      ev.preventDefault();

      if (state.loading) {
        return;
      }

      const values = Array.from(ev.target.elements)
        .filter(el => el.type !== 'submit')
        .reduce((o, el) => Object.assign(o, {[el.name] : el.value}), {});

      ee.emit('login:post', values);
    }
  }, view, $container);

  ee.on('login:start', () => a.setLoading(true));
  ee.on('login:stop', () => a.setLoading(false));
  ee.on('login:error', err => a.setError(err));

  return ee;
};

export default create;
