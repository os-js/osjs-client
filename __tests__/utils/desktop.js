import {createInstance} from 'osjs';
import {resourceResolver} from '../../src/utils/desktop';

describe('#resourceResolver icon themes', () => {
  let core;

  beforeAll(() => createInstance().then((c) => (core = c)));
  afterAll(() => core.destroy());

  test('Should work with image extensions in the icon name', () => {
    const resolver = resourceResolver(core);

    expect(resolver.icon('test.png')).toBe(
      '/icons/GnomeIcons/icons/test.png'
    );
    expect(resolver.icon('test.svg')).toBe(
      '/icons/GnomeIcons/icons/test.png'
    );
  });
});
