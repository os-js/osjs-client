import {createInstance} from 'osjs';
import Window from '../src/window.js';

describe('Window', () => {
  let core;
  let win;

  beforeAll(() => createInstance().then(c => core = c));

  afterAll(() => {
    win.destroy();
    core.destroy();
  });

  test('Should create a new instance', () => {
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

  test('Should be inited with correct attributes', () => {
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

  test('#render + #init', () => {
    const oninit = jest.fn();
    const onrender = jest.fn();
    const render = jest.fn($content => {
      $content.appendChild(document.createTextNode('Hello World'));
    });

    win.on('init', oninit);
    win.on('render', onrender);
    win.render(render);
    win.render(render);

    expect(oninit).toBeCalledTimes(1);
    expect(render).toBeCalledTimes(1);
    expect(win.$content.innerHTML).toBe('Hello World');
    expect(win.rendered).toBe(true);

    setTimeout(() => expect(onrender).toBeCalled(), 10);
  });

  test('#minimize', () => {
    const onminimize = jest.fn();
    win.once('minimize', onminimize);

    expect(win.minimize()).toBe(true);
    expect(win.minimize()).toBe(false);
    expect(win.state.minimized).toBe(true);
    expect(onminimize).toBeCalled();
  });

  test('#raise', () => {
    const onraise = jest.fn();
    win.once('raise', onraise);

    expect(win.raise()).toBe(true);
    expect(win.raise()).toBe(false);
    expect(win.state.minimized).toBe(false);
    expect(onraise).toBeCalled();
  });

  test('#maximize', () => {
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

  test('#restore', () => {
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

  test('#focus', () => {
    const onfocus = jest.fn();
    win.once('focus', onfocus);

    expect(win.state.focused).toBe(false);
    expect(win.focus()).toBe(true);
    expect(win.focus()).toBe(false);
    expect(win.state.focused).toBe(true);
    expect(onfocus).toBeCalled();
  });

  test('#blur', () => {
    const onblur = jest.fn();
    win.once('blur', onblur);

    expect(win.state.focused).toBe(true);
    expect(win.blur()).toBe(true);
    expect(win.blur()).toBe(false);
    expect(win.state.focused).toBe(false);
    expect(onblur).toBeCalled();
  });

  test('#setIcon', () => {
    win.setIcon('new-icon');
    expect(win.state.icon).toBe('new-icon');
    expect(win.$icon.style.backgroundImage).toBe('url(new-icon)');
  });

  test('#setTitle', () => {
    win.setTitle('new-title');
    expect(win.state.title).toBe('new-title');
    expect(win.$title.innerHTML).toBe('new-title');
  });

  test('#setDimension', () => {
    win.setDimension({width: 640, height: 480});
    expect(win.state.dimension).toEqual({width: 640, height: 480});
  });

  test('#setPosition', () => {
    win.setPosition({top: 100, left: 100});
    expect(win.state.position).toEqual({top: 100, left: 100});
  });

  test('#setNextZindex', () => {
    win.setNextZindex();
    expect(win.state.zIndex).toBe(1);

    win.setNextZindex(true);
    expect(win.state.zIndex).toBe(2);
  });

  test('#setZindex', () => {
    win.setZindex(10);
    expect(win.state.zIndex).toBe(10);
  });

  test('#_setState', () => {
    const toggleEvent = jest.fn(() => {});

    win.setState('focused', true);
    expect(win.state.focused).toBe(true);

    win.setState('focused', false);
    expect(win.state.focused).toBe(false);

    win._setState('focused', true);
    expect(win.state.focused).toBe(true);
  });

  test('#_toggleState', () => {
    const toggleEvent = jest.fn(() => {});

    win.on('blur', toggleEvent);
    win._toggleState('focused', false, 'blur');
    expect(win.state.focused).toBe(false);
    expect(toggleEvent).toBeCalled();
  });


  test('#getState', () => {
    expect(win.getState('focused')).toBe(false);
    expect(win.getState('position')).toEqual({top: 100, left: 100});
  });

  test('#getSession', () => {
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

  test('¤setState - loading', () => {
    win.setState('loading', true);
    expect(win.state.loading).toBe(false);

    // FIXME: Set debounce time
    setTimeout(() => {
      expect(win.state.loading).toBe(true);
    }, 300);
  });

  test('#resizeFit', () => {
    // TODO
    //win.resizeFit()
  });

  test('#clampToViewport', () => {
    // TODO
    //win.clampToViewport()
  });

  test('#gravitate', () => {
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

  test('.getWindows', () => {
    expect(Window.getWindows().length).toBe(1);
  });

  test('.lastWindow', () => {
    win.focus();
    expect(Window.lastWindow()).toBe(win);
  });

  test('#close', () => {
    expect(win.close()).toBe(true);
    expect(win.close()).toBe(false);
  });

  test('Parent window should handle children', () => {
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
});
