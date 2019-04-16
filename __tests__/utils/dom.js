import {
  style,
  script,
  escapeHtml,
  createCssText,
  supportedMedia,
  supportsPassive,
  supportsTransition,
  getActiveElement,
  playSound,
  handleTabOnTextarea
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

  test('getActiveElement', () => {
    expect(getActiveElement()).toBe(null);
    expect(getActiveElement(document.body)).toBe(document.body);
  });

  test('playSound', () => {
    expect(playSound())
      .resolves
      .toBeInstanceOf(HTMLAudioElement);
  });

  test('handleTabOnTextarea', () => {
    const input = document.createElement('input');
    input.value = 'test';
    input.selectionStart = 4;

    handleTabOnTextarea({
      target: input
    });

    expect(input.value).toBe('test\t');
    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });

  test('script - onload', () => {
    return expect(script(document.body, 'onload'))
      .resolves
      .toBeInstanceOf(HTMLScriptElement);
  });

  test('script - onreadystatechange', () => {
    return expect(script(document.body, 'onreadystatechange'))
      .resolves
      .toBeInstanceOf(HTMLScriptElement);
  });

  test('script - onerror', () => {
    return expect(script(document.body, 'onerror'))
      .rejects
      .toBeInstanceOf(Error);
  });

  test('style - onload', () => {
    return expect(style(document.body, 'onload'))
      .resolves
      .toBeInstanceOf(HTMLLinkElement);
  });

  test('style - onerror', () => {
    return expect(style(document.body, 'onerror'))
      .rejects
      .toBeInstanceOf(Error);
  });
});
