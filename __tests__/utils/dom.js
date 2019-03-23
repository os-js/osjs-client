import {
  escapeHtml,
  createCssText,
  supportedMedia,
  supportsPassive,
  supportsTransition
} from '../../src/utils/dom.js';

describe('DOM Utils', () => {
  test('escapeHtml', () => {
    expect(escapeHtml('This is a <div>test</div>'))
      .toBe('This is a test');
  });

  test('createCssText', () => {
    expect(createCssText({
      backgroundColor: '#000',
      position: 'absolute'
    }))
      .toBe('background-color: #000;position: absolute');
  });

  test('supportedMedia', () => {
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

  test('supportsPassive', () => {
    expect(typeof supportsPassive())
      .toBe('boolean');
  });

  test('supportsTransition', () => {
    expect(typeof supportsTransition())
      .toBe('boolean');
  });
});
