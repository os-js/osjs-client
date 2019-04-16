import {getEvent, matchKeyCombo} from '../../src/utils/input.js';

describe('matchKeyCombo', () => {
  test('Should match', () => {
    expect(matchKeyCombo('ALT+A', {
      key: 'A',
      altKey: true
    })).toBe(true);
  });

  test('Should not match', () => {
    expect(matchKeyCombo('ALT+A', {
      key: 'A',
      altKey: false
    })).toBe(false);
  });
});

describe('getEvent', () => {
  test('should get event', () => {
    expect(getEvent({
      touches: [{clientX: 100, clientY: 100}]
    })).toEqual({clientX: 100, clientY: 100, touch: true, target: undefined});
  });
});
