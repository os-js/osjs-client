import {
  escapeHtml,
  createCssText,
  supportedMedia,
  supportsPassive,
  supportsTransition
} from '../../src/utils/dom.js';

it('Should escape HTML', () => {
  expect(escapeHtml('This is a <div>test</div>'))
    .toBe('This is a test');
});

it('Should create cssText from object', () => {
  expect(createCssText({
    backgroundColor: '#000',
    position: 'absolute'
  }))
    .toBe('background-color: #000;position: absolute');
});

it('Should try to detect supported media', () => {
  const media = supportedMedia();

  expect(media.audio)
    .toMatchObject({
      mp3: false,
      mp4: false,
      oga: false
    });

  expect(media.video)
    .toMatchObject({
      mp4: false,
      ogv: false
    });
});

it('Should try to detect passive event support', () => {
  expect(typeof supportsPassive())
    .toBe('boolean');
});

it('Should try to detect transition support', () => {
  expect(typeof supportsTransition())
    .toBe('boolean');
});

