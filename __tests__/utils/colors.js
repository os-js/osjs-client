import {invertHex} from '../../src/utils/colors.js';

describe('invertHex', () => {
  it('should invert hex', () => {
    expect(invertHex('#000000')).toBe('#ffffff');
    expect(invertHex('000000')).toBe('#ffffff');
  });
});
