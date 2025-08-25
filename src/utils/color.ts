export type RawColor = [number, number, number, number];
export type RgbColor = `rgb(${string})`;
export type RgbaColor = `rgba(${string})`;
/**
 * Represent color in HSL format
 *
 * @example
 * hsl(90deg 0% 50%)
 * hsl(90 100% 50%)
 */
export type HslColor = `hsl(${string})`;
export type HwbColor = `hwb(${string})`;
export type HexColor = `#${string}`;

/**
 * Generates the same unique color for the string value (salt).
 * CYRB53 Hash Algorithm
 *
 * @param str any string
 * @param seed if you need different colors for same string
 */
export function hexColorByAnyString(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  return '#' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).substring(0, 6);
}

export function rgbToHex(r: number, g: number, b: number, a: number = 1): string {
  let rHex = Math.round(255 * r).toString(16).padStart(2, '0');
  let gHex = Math.round(255 * g).toString(16).padStart(2, '0');
  let bHex = Math.round(255 * b).toString(16).padStart(2, '0');
  let aHex = '';
  
  if (a < 1 && a >= 0) {
    aHex = Math.round(255 * a).toString(16).padStart(2, '0');
  }
  
  return '#' + rHex + gHex + bHex + aHex;
}

export function rgbToHsl(r: number, g: number, b: number, a: number = 1): RawColor {
  const cMin = Math.min(r, g, b);
  const cMax = Math.max(r, g, b);
  const delta = cMax - cMin;
  let h = 0;
  let s = 0;
  let l = 0;
  
  // Calculate hue
  // No difference
  if (delta == 0) {
    h = 0;
  }
  
  // Red is max
  else if (cMax == r) {
    h = ((g - b) / delta) % 6;
  }
  // Green is max
  else if (cMax == g) {
    h = (b - r) / delta + 2;
  }
  // Blue is max
  else {
    h = (r - g) / delta + 4;
  }
  
  h = Math.round(h * 60);
  
  // Make negative hues positive behind 360°
  if (h < 0) {
    h += 360;
  }
  
  // Calculate lightness
  l = (cMax + cMin) / 2;
  
  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  return [h, s, l, a];
}

export function hexToRgb(hex: string): RawColor {
  let r = 0, g = 0, b = 0, a = 1;
  
  // 3 digits
  if (hex.length == 4) {
    r = parseInt(hex[1]! + hex[1]!, 16);
    g = parseInt(hex[2]! + hex[2]!, 16);
    b = parseInt(hex[3]! + hex[3]!, 16);
  }
  // 6 digits
  else if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  // 6 digits + 2 alfa
  else if (hex.length == 9) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
    a = Math.floor(parseInt(hex.substring(7, 9), 16) / 255 * 1000) / 1000;
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  
  return [r, g, b, a];
}

export function hexToHsl(hex: string): RawColor {
  return hslToRgb(...hexToRgb(hex));
}

export function hslToRgb(h: number, s: number, l: number, a: number = 1): RawColor {
  h = (h % 360 + 360) % 360;
  
  s = isNaN(h) || isNaN(s) ? 0 : s;
  l = isNaN(h) || isNaN(l) ? 0 : l;
  
  const m2 = l + (l < 0.5 ? l : 1 - l) * s;
  const m1 = 2 * l - m2;
  
  const computeChanel = (h: number, m1: number, m2: number): number => {
    return h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1;
  };
  
  const r = computeChanel(h >= 240 ? h - 240 : h + 120, m1, m2);
  const g = computeChanel(h, m1, m2);
  const b = computeChanel(h < 120 ? h + 240 : h - 120, m1, m2);
  
  return [r, g, b, a];
}

export function hslToHex(h: number, s: number, l: number, a: number = 1): string {
  return rgbToHex(...hslToRgb(h, s, l, a));
}

/**
 * Color object
 */
export class Color {
  /**
   * Hue 0...360 deg
   * @private
   */
  private _h: number;
  /**
   * Saturation 0...1
   * @private
   */
  private _s: number;
  /**
   * Lightness 0...1
   * @private
   */
  private _l: number;
  /**
   * Alfa canal 0...1
   * @private
   */
  private _a: number;
  
  static fromString(str: string, seed = 0): Color {
    const hex = hexColorByAnyString(str, seed);
    return Color.fromHex(hex);
  }
  
  static fromHex(hex: string): Color {
    hex = hex.startsWith('#') ? hex : `#${hex}`;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(...rgb);
    
    return new Color(...hsl);
  }
  
  static fromRgb(rgbStr: string): Color {
    const result = /^rgba?\((\d+)(?:\s|,)\s?(\d+)(?:\s|,)\s?(\d+)(?:(?:\s|,|\s?\/)\s?([\d.]+%?))?\)/.exec(rgbStr);
    if (!result) {
      throw new Error(`RGB color parse error - "${rgbStr}"`);
    }
    const r = parseInt(result[1]!) / 255;
    const g = parseInt(result[2]!) / 255;
    const b = parseInt(result[3]!) / 255;
    const opacity = result[4]?.trim();
    let a = 1;
    
    if (opacity) {
      if (opacity.includes('%')) {
        a = Math.floor(parseFloat(opacity) * 1000) / 100000;
      } else {
        a = parseFloat(opacity);
      }
    }
    
    if (isNaN(r) || r < 0 || r > 1 || isNaN(g) || g < 0 || g > 1 || isNaN(b) || b < 0 || b > 1) {
      throw new Error(`Invalid color ${rgbStr}`);
    }
    
    if (isNaN(a) || a < 0 || a > 1) {
      throw new Error(`Invalid alfa value`);
    }
    
    return new Color(...rgbToHsl(r, g, b, a));
  }
  
  static from(strColor: string): Color {
    if (/^#/.test(strColor)) {
      return Color.fromHex(strColor);
    }
    if (/^rgb/.test(strColor)) {
      return Color.fromRgb(strColor);
    }
    
    throw new Error('Unknown Color Format');
  }
  
  constructor(h: number, s: number, l: number, a = 1) {
    this._h = h;
    this._s = s;
    this._l = l;
    this._a = a;
  }
  
  clone(): Color {
    return new Color(this._h, this._s, this._l, this._a);
  }
  
  rotateHue(deg: number): Color {
    return this.setHue(this._h + deg)
  }
  
  addLightness(value: number): Color {
    if (value > 0) {
      return this.setLightness(Math.min(1, this._l + value));
    } else if (value < 0) {
      return this.setLightness(Math.max(0, this._l - Math.abs(value)));
    }
    return this;
  }
  
  addSaturation(value: number): Color {
    if (value > 0) {
      return this.setSaturation(Math.min(1, this._s + value));
    } else if (value < 0) {
      return this.setSaturation(Math.max(0, this._s - Math.abs(value)));
    }
    return this;
  }
  
  setHue(deg: number): Color {
    this._h = (deg % 360 + 360) % 360;
    return this;
  }
  
  setLightness(value: number): Color {
    if (value > 1 || value < 0) {
       throw new Error(`Invalid Lightness ${value}`);
    }
    this._l = value;
    return this;
  }
  
  setSaturation(value: number): Color {
    if (value > 1 || value < 0) {
       throw new Error(`Invalid Saturation ${value}`);
    }
    this._s = value;
    return this;
  }
  
  setAlfa(value: number): Color {
    if (value > 1 || value < 0) {
      throw new Error(`Invalid opacity ${value}`);
    }
    
    this._a = value;
    return this;
  }
  
  get luminance() {
    const [r, g, b] = hslToRgb(this._h, this._s, this._l);
    const R = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
    const G = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
    const B = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;
    
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }
  
  get hue(): number {
    return this._h;
  }
  
  get lightness(): number {
    return this._l;
  }
  
  get saturation(): number {
    return this._s;
  }
  
  get alfa(): number {
    return this._a;
  }
  
  /**
   * Compute high contrast colour relative current color
   */
  getForeground(): Color {
    return new Color(0, 1, this.luminance > 0.6 ? 0 : 1);
  }
  
  toString(format: 'rgb' | 'hex' | 'hsl' = 'hsl'): string {
    let alfa = '';
    switch (format) {
      case 'hex':
        return hslToHex(this._h, this._s, this._l, this._a);
      case 'hsl':
        alfa = this._a === 1 ? '' : ` / ${Math.round(this._a * 1000) / 1000}`;
        return `hsl(${this._h} ${Math.round(this._s * 100)}% ${Math.round(this._l * 100)}%${alfa})`;
      case 'rgb':
        const [r, g, b] = hslToRgb(this._h, this._s, this._l);
        alfa = this._a === 1 ? '' : ` / ${Math.round(this._a * 1000) / 1000}`;
        return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}${alfa})`;
    }
  }
}