import Clipboard from '../src/clipboard.js';

describe('Clipboard', () => {
  const clipboard = new Clipboard();

  test('#set', () => {
    clipboard.set('value');

    return clipboard.get()
      .then(value => expect(value).toBe('value'));
  });

  test('#clear', () => {
    clipboard.set('value');
    clipboard.clear();

    return clipboard.get()
      .then(value => expect(value).toBe(undefined));
  });

  test('#has', () => {
    expect(clipboard.has('vfs')).toBe(false);
    clipboard.set('value', 'vfs');
    expect(clipboard.has('vfs')).toBe(true);
    expect(clipboard.has(/^vf/)).toBe(true);
    expect(clipboard.has(/^foo/)).toBe(false);
    expect(clipboard.has('other')).toBe(false);
    clipboard.clear();
    expect(clipboard.has('vfs')).toBe(false);
    expect(clipboard.has('other')).toBe(false);
  });

  test('#get + #clear', () => {
    clipboard.clear();
    clipboard.set('value');

    return clipboard.get(true)
      .then(value => {
        expect(value).toBe('value');

        return clipboard.get()
          .then(value => expect(value).toBe(undefined));
      });
  });

});
