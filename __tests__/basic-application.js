import {createInstance} from 'osjs';
import Application from '../src/application.js';
import {BasicApplication} from '../src/basic-application.js';

let core;
let win;
let proc;
let basic;

beforeAll(() => createInstance().then(c => core = c));
afterAll(() => core.destroy());

it('Should create a new instance', () => {
  proc = new Application(core, {
    args: {
      file: {
        path: 'test:/foo',
        filename: 'foo'
      }
    },
    metadata: {
      title: {
        en_EN: 'Test'
      },
      description: {}
    }
  });
  win = proc.createWindow();
  basic = new BasicApplication(core, proc, win);
});

it('Should init', () => {
  expect(basic.init())
    .resolves
    .toBe(true);
});

it('Should trigger new file creation', () => {
  const fn = jest.fn();
  basic.once('new-file', fn);
  basic.createNew();
  expect(fn).toBeCalled();
  expect(proc.args.file).toBe(null);
  expect(win.state.title).toEqual('Test - New File');
});

it('Should trigger file open', () => {
  const fn = jest.fn();
  const file = {
    path: 'test:/foo',
    filename: 'foo'
  };

  basic.once('open-file', fn);
  basic.open(file);

  expect(fn).toBeCalled();
  expect(proc.args.file).toEqual(file);
  expect(win.state.title).toEqual(`Test - ${file.filename}`);
});

it('Should trigger file save', () => {
  const fn = jest.fn();
  const file = {
    path: 'test:/foo',
    filename: 'foo'
  };

  basic.once('save-file', fn);
  basic.save(file);

  expect(fn).toBeCalled();
  expect(proc.args.file).toEqual(file);
  expect(win.state.title).toEqual(`Test - ${file.filename}`);
});

it('Should try to create dialogs', () => {
  basic.createSaveDialog();
  basic.createOpenDialog();
});

it('Should destroy', () => {
  basic.destroy();
});
