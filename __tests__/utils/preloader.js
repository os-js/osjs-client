import Preloader from '../../src/utils/preloader.js';

let pre;

it('Should create a new instance', () => {
  pre = new Preloader(document.body);
});

it('Should load a set of resources', () => {
  return expect(pre.load([]))
    .resolves
    .toEqual({
      elements: {},
      errors: []
    });
});
