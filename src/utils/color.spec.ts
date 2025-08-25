import { expect, describe, test } from 'vitest';
import { Color, hexColorByAnyString, hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from './color';

describe('utils/color.ts', () => {
  test('#hexColorByAnyString', () => {
    expect(hexColorByAnyString('some-string')).toBe('#197134');
    expect(hexColorByAnyString('some-string')).toBe('#197134');
    expect(hexColorByAnyString('second-string')).toBe('#17e0ad');
    expect(hexColorByAnyString('second-string')).toBe('#17e0ad');
  });
  test('#rgbToHex', () => {
    expect(rgbToHex(1, 1, 1)).toBe('#ffffff');
    expect(rgbToHex(0.011764705882352941, 0.011764705882352941, 0.011764705882352941)).toBe('#030303');
    expect(rgbToHex(0.011764705882352941, 0.011764705882352941, 0.011764705882352941, 1)).toBe('#030303');
    expect(rgbToHex(0.011764705882352941, 0.011764705882352941, 0.011764705882352941, 0)).toBe('#03030300');
  });
  test('#rgbToHsl', () => {
    expect(rgbToHsl(1, 1, 1)).toMatchObject([0, 0, 1, 1]);
    expect(rgbToHsl(0, 0, 0)).toMatchObject([0, 0, 0, 1]);
    expect(rgbToHsl(1, 1, 1, 0.5)).toMatchObject([0, 0, 1, 0.5]);
    expect(rgbToHsl(0, 0, 0, 0.8)).toMatchObject([0, 0, 0, 0.8]);
  });
  test('#hexToRgb', () => {
    expect(hexToRgb('#ffffff')).toMatchObject([1, 1, 1, 1]);
    expect(hexToRgb('#030303')).toMatchObject([0.011764705882352941, 0.011764705882352941, 0.011764705882352941, 1]);
    expect(hexToRgb('#ffffff00')).toMatchObject([1, 1, 1, 0]);
    expect(hexToRgb('#03030308')).toMatchObject([0.011764705882352941, 0.011764705882352941, 0.011764705882352941, 0.031]);
    expect(hexToRgb('#030303ff')).toMatchObject([0.011764705882352941, 0.011764705882352941, 0.011764705882352941, 1]);
    expect(hexToRgb('#0303037f')).toMatchObject([0.011764705882352941, 0.011764705882352941, 0.011764705882352941, 0.498]);
  });
  test('#hslToRgb', () => {
    // hsl(193.57deg 100% 39.02%) == rgb(0 154 199)
    expect(hslToRgb(193.57, 1, 0.3902, 1)).toMatchObject([0, 0.6038995333333342, 0.7804, 1]); // rgb(0 154 199);
  });

  describe('Color class', () => {
    test('#Color.fromRgb', () => {
      const colorRed = Color.fromRgb('rgb(255, 0, 0, 0.3)');
      const colorGreen = Color.fromRgb('rgb(0 255 0 / 34.65%)');
      const colorBlue = Color.fromRgb('rgb(0 0 255 / 0.6)');

      expect(colorRed).toBeInstanceOf(Color);
      expect(colorRed).toMatchObject({ _h: 0, _s: 1, _l: 0.5, _a: 0.3 });
      expect(colorGreen).toMatchObject({ _h: 120, _s: 1, _l: 0.5, _a: 0.3465 });
      expect(colorBlue).toMatchObject({ _h: 240, _s: 1, _l: 0.5, _a: 0.6 });
    });

    test('#Color.fromRgb', () => {
      const colorRed = Color.fromHex('#ff0000');
      const colorGreen = Color.fromHex('#0f0');
      const colorBlue = Color.fromHex('#0000ff08');

      expect(colorRed).toBeInstanceOf(Color);
      expect(colorRed).toMatchObject({ _h: 0, _s: 1, _l: 0.5, _a: 1 });
      expect(colorGreen).toMatchObject({ _h: 120, _s: 1, _l: 0.5, _a: 1 });
      expect(colorBlue).toMatchObject({ _h: 240, _s: 1, _l: 0.5, _a: 0.031 });
    });

    test('#Color.toString', () => {
      const colorRed = Color.fromHex('#ff0000');
      const colorGreen = Color.fromHex('#0f0');
      const colorGreen05 = Color.fromHex('#00ff007f');
      const colorBlue = Color.fromHex('#0000fff3');

      expect(colorRed.toString('rgb')).toBe('rgb(255 0 0)');
      expect(colorGreen.toString('hex')).toBe('#00ff00');
      expect(colorGreen05.toString('hex')).toBe('#00ff007f');
      expect(colorBlue.toString('hsl')).toBe('hsl(240 100% 50% / 0.952)');
    });

    test('#Color.text', () => {
      const color1 = Color.from('rgb(70, 70, 70)');
      const color2 = Color.from('rgb(240, 240, 240)');

      expect(color1.getForeground().toString('rgb')).toBe('rgb(255 255 255)');
      expect(color2.getForeground().toString('rgb')).toBe('rgb(0 0 0)');
    });
  });
});