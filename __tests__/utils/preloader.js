import Preloader from '../../src/utils/preloader.js';

describe('Preloader', () => {
  let pre;

  test('#constructor', () => {
    pre = new Preloader(document.body);
  });

  test('#load', () => {
    return expect(pre.load([
      'onload.js',
      'onload.css',
      'onreadystatechange.js',
      'onerror.css',
      'onerror.js'
    ]))
      .resolves
      .toEqual({
        elements: expect.objectContaining({
          'onload.js': expect.any(HTMLScriptElement),
          'onload.css': expect.any(HTMLLinkElement),
          'onreadystatechange.js': expect.any(HTMLScriptElement)
        }),
        errors: [
          'onerror.css',
          'onerror.js'
        ]
      });
  });
});
