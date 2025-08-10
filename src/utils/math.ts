export function round(value: number, decimals = 2): number {
  const mul = 10 ** decimals;
  return Math.round(value * mul) / mul;
}

export function normalize(value: number, min = 0, max = 100, decimals = 2): [number, number, number] {
  min = isNaN(min) ? 0 : min;
  max = isNaN(max) ? 100 : max;

  if (min > max) {
    throw new Error('MIN_MAX');
  }

  const multiplier = 10 ** decimals;
  value = value == null || isNaN(value) ? 0 : value;
  value = Math.max(value, min);
  value = Math.min(value, max);
  value = Math.round(value * multiplier) / multiplier;

  return [value, min, max];
}

export function getAngle(value: number, min: number, max: number): number {
  const percent = (value - min) / (max - min) * 100;

  return (percent * 180) / 100;
}

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function precisionToMinStep(decimals: number) {
  return 1 / (10 ** decimals);
}