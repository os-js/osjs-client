import {createInstance} from 'osjs';
import Window from '../src/window.js';

let core;
let win;

beforeAll(() => createInstance().then(c => core = c));

afterAll(() => {
  win.destroy();
  core.destroy();
});

it('Should create a new instance', () => {
  win = new Window(core, {
    id: 'Jest',
    title: 'Jest Test',
    attributes: {
      ontop: true,
      closeable: false
    },
    state: {
      zIndex: 1000
    },
    position: {
      top: 10,
      left: 10
    },
    dimension: {
      width: 800,
      height: 600
    }
  });
});

it('Should be inited with correct attributes', () => {
  expect(win.id).toBe('Jest');
  expect(win.attributes.ontop).toBe(true);
  expect(win.attributes.closeable).toBe(false);
  expect(win.state.zIndex).toBe(1000);
  expect(win.state.position.top).toBe(10);
  expect(win.state.position.left).toBe(10);
  expect(win.state.dimension.width).toBe(800);
  expect(win.state.dimension.height).toBe(600);
  expect(win.state.title).toBe('Jest Test');
});

it('Should be rendered with correct DOM', () => {
  const render = jest.fn($content => {
    $content.appendChild(document.createTextNode('Hello World'));
  });

  win.init();
  win.render(render);

  expect(render).toBeCalled();
  expect(win.$content.innerHTML).toBe('Hello World');
});

it('Should be minimized', () => {
  expect(win.minimize()).toBe(true);
  expect(win.minimize()).toBe(false);
  expect(win.state.minimized).toBe(true);
});

it('Should be raised', () => {
  expect(win.raise()).toBe(true);
  expect(win.raise()).toBe(false);
  expect(win.state.minimized).toBe(false);
});

it('Should be maximized', () => {
  expect(win.maximize()).toBe(true);
  expect(win.maximize()).toBe(false);
  expect(win.state.maximized).toBe(true);
});

it('Should be restored', () => {
  expect(win.restore()).toBe(true);
  expect(win.state.maximized).toBe(false);
});

it('Should be focused', () => {
  expect(win.state.focused).toBe(false);
  expect(win.focus()).toBe(true);
  expect(win.focus()).toBe(false);
  expect(win.state.focused).toBe(true);
});

it('Should be blured', () => {
  expect(win.state.focused).toBe(true);
  expect(win.blur()).toBe(true);
  expect(win.blur()).toBe(false);
  expect(win.state.focused).toBe(false);
});

it('Should set icon', () => {
  win.setIcon('new-icon');
  expect(win.state.icon).toBe('new-icon');
  expect(win.$icon.style.backgroundImage).toBe('url(new-icon)');
});

it('Should set title', () => {
  win.setTitle('new-title');
  expect(win.state.title).toBe('new-title');
  expect(win.$title.innerHTML).toBe('new-title');
});

it('Should set dimension', () => {
  win.setDimension({width: 640, height: 480});
  expect(win.state.dimension).toEqual({width: 640, height: 480});
});

it('Should set position', () => {
  win.setPosition({top: 100, left: 100});
  expect(win.state.position).toEqual({top: 100, left: 100});
});

it('Should set next zIndex', () => {
  win.setNextZindex();
  expect(win.state.zIndex).toBe(1);

  win.setNextZindex(true);
  expect(win.state.zIndex).toBe(2);
});

it('Should set zIndex', () => {
  win.setZindex(10);
  expect(win.state.zIndex).toBe(10);
});

it('Should set state', () => {
  const toggleEvent = jest.fn(() => {});

  win.setState('focused', true);
  expect(win.state.focused).toBe(true);

  win.setState('focused', false);
  expect(win.state.focused).toBe(false);

  win._setState('focused', true);
  expect(win.state.focused).toBe(true);

  win.on('blur', toggleEvent);
  win._toggleState('focused', false, 'blur');
  expect(win.state.focused).toBe(false);
  expect(toggleEvent).toBeCalled();
});

it('Should get state', () => {
  expect(win.getState('focused')).toBe(false);
  expect(win.getState('position')).toEqual({top: 100, left: 100});
});

it('Should get session', () => {
  expect(win.getSession()).toEqual({
    id: 'Jest',
    dimension: {
      width: 640,
      height: 480
    },
    position: {
      top: 100,
      left: 100
    }
  });
});

it('Should resize to fit', () => {
  // TODO
  //win.resizeFit()
});

it('Should clamp to viewport', () => {
  // TODO
  //win.clampToViewport()
});

it('Should gravitate in viewport', () => {
  // TODO
  //win.gravitate()
});

it('Should get window list', () => {
  expect(Window.getWindows().length).toBe(1);
});

it('Should get last focused window', () => {
  win.focus();
  expect(Window.lastWindow()).toBe(win);
});

it('Should be closed', () => {
  expect(win.close()).toBe(true);
  expect(win.close()).toBe(false);
});
