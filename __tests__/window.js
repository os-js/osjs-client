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
      closeable: false,
      header: false
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
  const oninit = jest.fn();
  const onrender = jest.fn();
  const render = jest.fn($content => {
    $content.appendChild(document.createTextNode('Hello World'));
  });

  win.once('init', oninit);
  win.once('render', onrender);
  win.render(render);

  expect(oninit).toBeCalled();
  expect(render).toBeCalled();
  expect(win.$content.innerHTML).toBe('Hello World');
  expect(win.rendered).toBe(true);

  setTimeout(() => expect(onrender).toBeCalled(), 10);
});

it('Should only init once', () => {
  const oninit = jest.fn();
  win.once('init', oninit);
  win.init();

  expect(oninit).not.toBeCalled();
});

it('Should only render once', () => {
  const onrender = jest.fn();
  const render = jest.fn();
  win.once('render', onrender);
  win.render(render);

  expect(onrender).not.toBeCalled();
  expect(render).not.toBeCalled();
});

it('Should be minimized', () => {
  const onminimize = jest.fn();
  win.once('minimize', onminimize);

  expect(win.minimize()).toBe(true);
  expect(win.minimize()).toBe(false);
  expect(win.state.minimized).toBe(true);
  expect(onminimize).toBeCalled();
});

it('Should be raised', () => {
  const onraise = jest.fn();
  win.once('raise', onraise);

  expect(win.raise()).toBe(true);
  expect(win.raise()).toBe(false);
  expect(win.state.minimized).toBe(false);
  expect(onraise).toBeCalled();
});

it('Should be maximized', () => {
  const onmaximize = jest.fn();
  const onresized = jest.fn();
  win.once('maximize', onmaximize);
  win.once('resized', onresized);

  expect(win.maximize()).toBe(true);
  expect(win.maximize()).toBe(false);
  expect(win.state.maximized).toBe(true);
  expect(onmaximize).toBeCalled();
//  expect(onresized).toBeCalled(); //  FIXME
});

it('Should be restored', () => {
  const onrestore = jest.fn();
  const onresized = jest.fn();
  win.once('restore', onrestore);
  win.once('resized', onresized);

  expect(win.restore()).toBe(true);
  expect(win.restore()).toBe(false);
  expect(win.state.maximized).toBe(false);
  expect(onrestore).toBeCalled();
//  expect(onresized).toBeCalled(); //  FIXME
});

it('Should be focused', () => {
  const onfocus = jest.fn();
  win.once('focus', onfocus);

  expect(win.state.focused).toBe(false);
  expect(win.focus()).toBe(true);
  expect(win.focus()).toBe(false);
  expect(win.state.focused).toBe(true);
  expect(onfocus).toBeCalled();
});

it('Should be blured', () => {
  const onblur = jest.fn();
  win.once('blur', onblur);

  expect(win.state.focused).toBe(true);
  expect(win.blur()).toBe(true);
  expect(win.blur()).toBe(false);
  expect(win.state.focused).toBe(false);
  expect(onblur).toBeCalled();
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

it('Should set loading state', () => {
  win.setState('loading', true);
  expect(win.state.loading).toBe(false);

  // FIXME: Set debounce time
  setTimeout(() => {
    expect(win.state.loading).toBe(true);
  }, 300);
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
  win.setPosition({top: 0, left: 0});

  win.gravitate('center');
  expect(win.state.position).toEqual({top: 60,  left: 80});

  win.gravitate('left');
  expect(win.state.position).toEqual({top: 60,  left: 0});

  win.gravitate('top-left');
  expect(win.state.position).toEqual({top: 0,  left: 0});

  win.gravitate('bottom-left');
  expect(win.state.position).toEqual({top: 120,  left: 0});

  win.gravitate('top');
  expect(win.state.position).toEqual({top: 0,  left: 0});

  win.gravitate('top-right');
  expect(win.state.position).toEqual({top: 0,  left: 160});

  win.gravitate('top-left');
  expect(win.state.position).toEqual({top: 0,  left: 0});

  win.gravitate('bottom');
  expect(win.state.position).toEqual({top: 120,  left: 0});

  win.gravitate('bottom-left');
  expect(win.state.position).toEqual({top: 120,  left: 0});

  win.gravitate('bottom-right');
  expect(win.state.position).toEqual({top: 120,  left: 160});

  win.gravitate('right');
  expect(win.state.position).toEqual({top: 120,  left: 160});
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

it('Parent window should handle children', () => {
  const parentWindow = new Window(core, {
    position: 'center'
  });

  const childWindow = new Window(core, {
    parent: parentWindow,
    attributes: {
      modal: true
    }
  });

  parentWindow.render();
  childWindow.render();

  expect(parentWindow.children.length).toBe(1);
  expect(parentWindow.children[0]).toBe(childWindow);
  expect(childWindow.parent).toBe(parentWindow);

  parentWindow.destroy();
  expect(parentWindow.children.length).toBe(0);
  expect(childWindow.parent).toBe(null);
  childWindow.destroy();
});
