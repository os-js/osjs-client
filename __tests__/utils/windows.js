import * as windows from '../../src/utils/windows.js';

describe('Window Utils', () => {
  test('createAttributes', () => {
    expect(windows.createAttributes({
      classNames: ['foo', 'bar']
    }))
      .toMatchObject({
        classNames: ['foo', 'bar']
      });
  });

  test('createState', () => {
    const attrs = windows.createAttributes({});
    expect(windows.createState({
    }, {
      id: 'jest'
    }, attrs))
      .toMatchObject({
        title: 'jest'
      });
  });

  test('clampPosition', () => {
    expect(windows.clampPosition({
      width: 1000,
      height: 1000,
      top: 0,
      left: 0
    }, {
      dimension: {
        width: 0,
        height: 0
      },
      position: {
        left: 0,
        top: 0
      }
    })).toEqual({left: 0, top: 0});
  });

  test('positionFromGravity', () => {
    const win = {
      state: {
        dimension: {
          width: 500,
          height: 500
        },
        position: {
          left: 100,
          top: 100
        }
      }
    };

    const rect = {
      width: 1000,
      height: 1000,
      left: 0,
      top: 0
    };

    expect(windows.positionFromGravity(win, rect, 'center'))
      .toEqual({left: 250, top: 250});

    expect(windows.positionFromGravity(win, rect, 'left'))
      .toEqual({left: 0, top: 100});

    expect(windows.positionFromGravity(win, rect, 'top'))
      .toEqual({left: 100, top: 0});

    expect(windows.positionFromGravity(win, rect, 'right'))
      .toEqual({left: 500, top: 100});

    expect(windows.positionFromGravity(win, rect, 'bottom'))
      .toEqual({left: 100, top: 500});

    expect(windows.positionFromGravity(win, rect, 'top-left'))
      .toEqual({left: 0, top: 0});

    expect(windows.positionFromGravity(win, rect, 'top-right'))
      .toEqual({left: 500, top: 0});

    expect(windows.positionFromGravity(win, rect, 'bottom-left'))
      .toEqual({left: 0, top: 500});

    expect(windows.positionFromGravity(win, rect, 'bottom-right'))
      .toEqual({left: 500, top: 500});

    expect(windows.positionFromGravity(win, rect, 'center-top'))
      .toEqual({left: 250, top: 0});

    expect(windows.positionFromGravity(win, rect, 'center-bottom'))
      .toEqual({left: 250, top: 500});

    expect(windows.positionFromGravity(win, rect, 'center-left'))
      .toEqual({left: 0, top: 250});

    expect(windows.positionFromGravity(win, rect, 'center-right'))
      .toEqual({left: 500, top: 250});
  });

  test('dimensionFromElement', () => {
    // TODO
  });

  test('transformVectors', () => {
    expect(windows.transformVectors({
      width: 1000,
      height: 1000,
      left: 0,
      top: 0
    }, {
      width: 0.5,
      height: 400
    }, {
      top: 0.5,
      left: 100
    })).toEqual({
      dimension: {
        width: 500,
        height: 400
      },
      position: {
        left: 100,
        top: 500
      }
    });
  });

  test('getCascadePosition', () => {
    expect(windows.getCascadePosition({
      wid: 3
    }, {
      left: 0,
      top: 0,
      width: 1000,
      height: 1000
    }, {})).toEqual({
      top: 40,
      left: 40
    });
  });

  test('getMediaQueryName', () => {
    const attributes = windows.createAttributes({});
    const state = windows.createState({}, {
      dimension: {
        width: 10000,
        height: 10000
      }
    }, attributes);

    expect(windows.getMediaQueryName({
      attributes,
      state,
      $element: {
        offsetWidth: state.dimension.width,
        offsetHeight: state.dimension.height
      }
    })).toBe('big');
  });
});

describe('Window Mover', () => {
  const m = windows.mover({
    state: {
      position: {
        top: 100,
        left: 100
      }
    }
  }, {
    width: 1000,
    height: 1000,
    top: 0,
    left: 0
  });

  test('move up', () => expect(m(0, -100)).toEqual({top: 0, left: 100}));
  test('move down', () => expect(m(0, 100)).toEqual({top: 200, left: 100}));
  test('move left', () => expect(m(-100, 0)).toEqual({top: 100, left: 0}));
  test('move right', () => expect(m(100, 0)).toEqual({top: 100, left: 200}));
});

describe('Window Resizer', () => {
  const resizer = (dir, ...args) => {
    const el = document.createElement('div');
    el.setAttribute('data-direction', dir);

    const attributes = windows.createAttributes({});
    const r = windows.resizer({
      attributes,
      state: {
        position: {
          top: 100,
          left: 100
        },
        dimension: {
          width: 100,
          height: 100
        }
      }
    }, el);

    return r(...args);
  };

  test('resize N', () => expect(resizer('n', -10, -10)).toEqual({top: 90, left: 100, width: 100, height: 110}));
  test('resize NE', () => expect(resizer('ne', 10, -10)).toEqual({top: 90, left: 100, width: 110, height: 110}));
  test('resize E', () => expect(resizer('e', 10, 10)).toEqual({top: 100, left: 100, width: 110, height: 100}));
  test('resize SE', () => expect(resizer('se', 10, 10)).toEqual({top: 100, left: 100, width: 110, height: 110}));
  test('resize S', () => expect(resizer('s', 10, 10)).toEqual({top: 100, left: 100, width: 100, height: 110}));
  test('resize SW', () => expect(resizer('sw', -10, 10)).toEqual({top: 100, left: 90, width: 110, height: 110}));
  test('resize W', () => expect(resizer('w', -10, 10)).toEqual({top: 100, left: 90, width: 110, height: 100}));
  test('resize NW', () => expect(resizer('nw', -10, -10)).toEqual({top: 90, left: 90, width: 110, height: 110}));
});

describe('Load options from config', () => {
  const config = [{
    application: 'Application1',
    options: {
      attributes: {
        foo: 'bar'
      }
    }
  }, {
    application: 'Application2',
    window: 'Gaga',
    options: {
      attributes: {
        bass: 'jazz'
      }
    }
  }, {
    window: /^RegExp_/,
    options: {
      attributes: {
        test: 'jest'
      }
    }
  }, {
  }];

  test('all application windows', () => {
    const result = {attributes: {foo: 'bar'}};
    expect(windows.loadOptionsFromConfig(config, 'Application1', 'Koko')).toEqual(result);
    expect(windows.loadOptionsFromConfig(config, 'Application1', 'Kokoko')).toEqual(result);
    expect(windows.loadOptionsFromConfig(config, 'Application1')).toEqual(result);
    expect(windows.loadOptionsFromConfig(config, 'Application2', 'Koko')).toEqual({});
  });

  test('application spesific window', () => {
    expect(windows.loadOptionsFromConfig(config, 'Application2', 'Gaga')).toEqual({
      attributes: {
        bass: 'jazz'
      }
    });

    expect(windows.loadOptionsFromConfig(config, 'Application2', 'Gagaga')).toEqual({});
  });

  test('global window', () => {
    expect(windows.loadOptionsFromConfig(config, 'undefined', 'RegExp_123')).toEqual({
      attributes: {
        test: 'jest'
      }
    });

    expect(windows.loadOptionsFromConfig([
      ...config,
      {
        window: /(.*)/,
        options: {
          attributes: {
            all: 'thethings'
          }
        }
      }
    ], 'undefined')).toEqual({
      attributes: {
        all: 'thethings'
      }
    });
  });
});
