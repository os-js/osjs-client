import {createInstance} from 'osjs';
import {resourceResolver} from '../../src/utils/desktop';

describe('#resourceResolver icon themes', () => {
  let resolver;

  beforeAll(() => createInstance().then(
    (core) => (resolver = resourceResolver(core))
  ));
  afterAll(() => core.destroy());

  test('Should work with image extensions in the icon name', () => {
    expect(resolver.icon('test.png')).toBe(
      '/icons/GnomeIcons/icons/test.png'
    );
    expect(resolver.icon('test.svg')).toBe(
      '/icons/GnomeIcons/icons/test.png'
    );
  });

  test('Should work without image extensions in the icon name', () => {
    expect(resolver.icon('test')).toBe(
      '/icons/GnomeIcons/icons/test.png'
    );
  });

  test('Should work with multiple image extensions in the name', () => {
    expect(resolver.icon('test.png.svg.gif')).toBe(
      '/icons/GnomeIcons/icons/test.png.svg.png'
    );
  });

  test('Should work on filenames with dots in them', () => {
    expect(resolver.icon('test.icon.gif')).toBe(
      '/icons/GnomeIcons/icons/test.icon.png'
    );
    expect(resolver.icon('test.icon')).toBe(
      '/icons/GnomeIcons/icons/test.icon.png'
    );
    expect(resolver.icon('lots.of.dots.here')).toBe(
      '/icons/GnomeIcons/icons/lots.of.dots.here.png'
    );
  });
});
