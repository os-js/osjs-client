import {createInstance} from 'osjs';
import {
  clientLocale,
  format,
  translatable,
  translatableFlat,
  getLocale
} from '../../src/utils/locale.js';


describe('Locale Utils', () => {
  let core;

  beforeAll(() => {
    return createInstance()
      .then(c => (core = c));
  });

  afterAll(() => core.destroy());

  test('clientLocalec', () => {
    expect(clientLocale()).toBe('en_EN');
  });

  test('format', () => {
    const formatter = format(core);
    const now = new Date('Januar 1, 2019 00:00:00');

    expect(formatter(now, 'shortDate')).toBe('2019-01-01');
    expect(formatter(now, 'mediumDate')).toBe('1st Jan 2019');
    expect(formatter(now, 'longDate')).toBe('1st January 2019');
    expect(formatter(now, 'fullDate')).toBe('Tuesday 1st January 2019');
    expect(formatter(now, 'shortTime')).toBe('00:00');
    expect(formatter(now, 'longTime')).toBe('00:00:00');
  });

  test('translatable', () => {
    const _ = translatable(core)({
      en_EN: {
        foo: 'Hello World',
        baz: 'Hello {0} {1}'
      }
    });

    expect(_('foo')).toBe('Hello World');
    expect(_('bar')).toBe('bar');
    expect(_('baz', 'World', '?')).toBe('Hello World ?');
  });

  test('translatableFlat', () => {
    const _ = () => translatableFlat(core)({
      en_EN: 'Hello World'
    }, 'Hello Nobody');

    expect(_()).toBe('Hello World');
  });

  test('getLocale', () => {
    expect(getLocale(core, 'language'))
      .toEqual({defaultLocale: 'en_EN', userLocale: 'en_EN'});

    expect(getLocale(core, 'format.shortDate'))
      .toEqual({defaultLocale: 'yyyy-mm-dd', userLocale: 'yyyy-mm-dd'});
  });
});
