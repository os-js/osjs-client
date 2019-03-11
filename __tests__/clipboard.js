import Clipboard from '../src/clipboard.js';

describe('clipboard', () => {
  const clipboard = new Clipboard();

  it('should set value', () => {
    clipboard.set('value');

    return clipboard.get()
      .then(value => expect(value).toBe('value'));
  });

  it('should clear value', () => {
    clipboard.set('value');
    clipboard.clear();

    return clipboard.get()
      .then(value => expect(value).toBe(undefined));
  });

  it('should get and clear value', () => {
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
