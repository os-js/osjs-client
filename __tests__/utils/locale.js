import {createInstance} from 'osjs';
import {
  clientLocale,
  format,
  translatable,
  translatableFlat,
  getLocale
} from '../../src/utils/locale.js';

let core;

beforeAll(() => {
  return createInstance()
    .then(c => (core = c));
});

afterAll(() => core.destroy());

it('Should get client locale', () => {
  expect(clientLocale()).toBe('en_EN');
});

it('Should format dates', () => {
  const formatter = format(core);
  const now = new Date('Januar 1, 2019 00:00:00');

  expect(formatter(now, 'shortDate')).toBe('2019-01-01');
  expect(formatter(now, 'mediumDate')).toBe('1st Jan 2019');
  expect(formatter(now, 'longDate')).toBe('1st January 2019');
  expect(formatter(now, 'fullDate')).toBe('Tuesday 1st January 2019');
  expect(formatter(now, 'shortTime')).toBe('00:00');
  expect(formatter(now, 'longTime')).toBe('00:00:00');
});

it('Should translate nested', () => {
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

it('Should translate flat', () => {
  const _ = () => translatableFlat(core)({
    en_EN: 'Hello World'
  }, 'Hello Nobody');

  expect(_()).toBe('Hello World');
});

it('Should get localization setting', () => {
  expect(getLocale(core, 'language'))
    .toEqual({defaultLocale: 'en_EN', userLocale: 'en_EN'});

  expect(getLocale(core, 'format.shortDate'))
    .toEqual({defaultLocale: 'yyyy-mm-dd', userLocale: 'yyyy-mm-dd'});
});
