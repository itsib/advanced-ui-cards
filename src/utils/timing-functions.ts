const b1 = 4 / 11;
const b2 = 6 / 11;
const b3 = 8 / 11;
const b4 = 3 / 4;
const b5 = 9 / 11;
const b6 = 10 / 11;
const b7 = 15 / 16;
const b8 = 21 / 22;
const b9 = 63 / 64;
const b0 = 1 / b1 / b1;

const tau = 2 * Math.PI;
const amplitude = 1;
const period = 0.3;

/**
 * tpmt is two power minus ten times t scaled to [0,1]
 * @param x
 */
function tpmt(x: number): number {
  return (Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494;
}

export function bounceOut(t: number): number {
  return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
}

export function bounceIn(t: number): number {
  return 1 - bounceOut(1 - t);
}

export function bounceInOut(t: number): number {
  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
}

export const elasticIn = (function custom(a: number, p: number) {
  const s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

  function elasticIn(t: number): number {
    return a * tpmt(-(--t)) * Math.sin((s - t) / p);
  }

  elasticIn.amplitude = function(a: number) { return custom(a, p * tau); };
  elasticIn.period = function(p: number) { return custom(a, p); };

  return elasticIn;
})(amplitude, period);

export const elasticOut = (function custom(a: number, p: number) {
  const s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

  function elasticOut(t: number) {
    return 1 - a * tpmt(t = +t) * Math.sin((t + s) / p);
  }

  elasticOut.amplitude = function(a: number) { return custom(a, p * tau); };
  elasticOut.period = function(p: number) { return custom(a, p); };

  return elasticOut;
})(amplitude, period);
