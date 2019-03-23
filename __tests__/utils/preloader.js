import Preloader from '../../src/utils/preloader.js';

describe('Preloader', () => {
  let pre;

  test('#constructor', () => {
    pre = new Preloader(document.body);
  });

  test('#load', () => {
    return expect(pre.load([]))
      .resolves
      .toEqual({
        elements: {},
        errors: []
      });
  });
});
