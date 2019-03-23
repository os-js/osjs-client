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
